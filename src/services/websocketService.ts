// WebSocket service for real-time updates

import { API_CONFIG } from '../config/api';
import { authService } from './authService';
import { logger } from '../utils/logger';

export type WebSocketEvent = 'reels_generated' | 'stream.online' | 'stream.offline' | 'video_status';

export interface WebSocketMessage {
  event: WebSocketEvent;
  data: unknown;
}

type EventHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private eventHandlers: Map<WebSocketEvent, Set<EventHandler>> = new Map();
  private isConnecting = false;
  private shouldReconnect = true;

  /**
   * Get WebSocket URL from API base URL
   */
  private getWebSocketUrl(): string {
    const apiUrl = API_CONFIG.BASE_URL;
    let wsUrl: string;
    
    // Convert HTTP/HTTPS to WS/WSS
    if (apiUrl.startsWith('https://')) {
      wsUrl = apiUrl.replace('https://', 'wss://');
    } else if (apiUrl.startsWith('http://')) {
      wsUrl = apiUrl.replace('http://', 'ws://');
    } else {
      // Default to wss if no protocol specified
      wsUrl = `wss://${apiUrl}`;
    }
    
    // Append /ws path to the WebSocket URL
    return `${wsUrl}/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    // Prevent multiple connection attempts
    if (this.ws?.readyState === WebSocket.OPEN) {
      logger.info('WebSocket already connected, skipping connection attempt');
      return;
    }
    
    if (this.isConnecting) {
      logger.info('WebSocket connection already in progress, skipping');
      return;
    }

    if (!authService.isAuthenticated()) {
      logger.warn('Cannot connect WebSocket: user not authenticated');
      return;
    }

    this.isConnecting = true;
    const wsUrl = this.getWebSocketUrl();
    const token = authService.getToken();

    try {
      // Add token as query parameter or in headers if needed
      const url = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;
      
      logger.info(`Attempting WebSocket connection to: ${url.replace(/\?token=.*/, '?token=***')}`);
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        logger.info('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.shouldReconnect = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          
          // Handle different message formats
          let message: WebSocketMessage;
          if (parsed.event) {
            // Standard format: { event: 'reels_generated', data: {...} }
            message = parsed as WebSocketMessage;
          } else if (parsed.type) {
            // Alternative format: { type: 'reels_generated', ... }
            message = {
              event: parsed.type as WebSocketEvent,
              data: { ...parsed, type: undefined }
            };
          } else {
            logger.warn('WebSocket message missing event/type field:', parsed);
            return;
          }
          
          logger.info('WebSocket message received:', { event: message.event, data: message.data });
          this.handleMessage(message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        logger.error('WebSocket error occurred:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = (event) => {
        logger.info('WebSocket closed', { 
          code: event.code, 
          reason: event.reason || 'No reason provided',
          wasClean: event.wasClean 
        });
        this.isConnecting = false;
        this.ws = null;

        // Code 1006 = Abnormal Closure (connection lost without close frame)
        // This usually means the server doesn't support WebSocket or the endpoint is wrong
        if (event.code === 1006) {
          logger.warn('WebSocket connection failed (1006). This usually means the server does not support WebSocket at this endpoint or the server is not running.');
          // Don't keep retrying if we've hit max attempts - the server likely doesn't support WebSocket
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max reconnection attempts reached. WebSocket server may not be available or configured correctly.');
            this.shouldReconnect = false;
            return;
          }
        }

        // Only attempt to reconnect if:
        // 1. Reconnection is enabled
        // 2. Not intentionally closed (code 1000)
        // 3. User is still authenticated
        // 4. Haven't exceeded max attempts
        if (this.shouldReconnect && event.code !== 1000 && authService.isAuthenticated() && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else if (event.code === 1000) {
          logger.info('WebSocket closed intentionally, not reconnecting');
        } else if (!authService.isAuthenticated()) {
          logger.info('User not authenticated, not reconnecting');
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          logger.warn('Max reconnection attempts reached, stopping reconnection attempts');
        }
      };
    } catch (error) {
      logger.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      if (authService.isAuthenticated()) {
        this.scheduleReconnect();
      }
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max WebSocket reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    logger.info(`Scheduling WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.shouldReconnect && authService.isAuthenticated()) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.eventHandlers.get(message.event);
    
    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => {
        try {
          handler(message.data);
        } catch (error) {
          logger.error(`Error in WebSocket event handler for ${message.event}:`, error);
        }
      });
    } else {
      logger.warn(`No handlers registered for event: ${message.event}`);
    }
  }

  /**
   * Subscribe to a WebSocket event
   */
  on(event: WebSocketEvent, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
        }
      }
    };
  }

  /**
   * Unsubscribe from a WebSocket event
   */
  off(event: WebSocketEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    logger.info('Disconnecting WebSocket');
    this.shouldReconnect = false;
    this.reconnectAttempts = 0; // Reset reconnect attempts on manual disconnect
    if (this.ws) {
      // Only close if not already closed
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnecting');
      }
      this.ws = null;
    }
    this.isConnecting = false;
    this.eventHandlers.clear();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): 'connecting' | 'connected' | 'disconnected' {
    if (this.isConnecting) return 'connecting';
    if (this.isConnected()) return 'connected';
    return 'disconnected';
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;

