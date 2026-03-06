// WebSocket context for managing global WebSocket connection

import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback, ReactNode } from 'react';
import { websocketService, WebSocketEvent } from '../services/websocketService';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

interface WebSocketContextType {
  isConnected: boolean;
  state: 'connecting' | 'connected' | 'disconnected';
  subscribe: (event: WebSocketEvent, handler: (data: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const handlersRef = useRef<Map<WebSocketEvent, Set<(data: unknown) => void>>>(new Map());
  const unsubscribeFunctionsRef = useRef<Map<string, () => void>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Check authentication status and manage WebSocket connection
  useEffect(() => {
    let stateUpdateInterval: NodeJS.Timeout | null = null;
    let authCheckInterval: NodeJS.Timeout | null = null;

    const updateConnectionState = () => {
      setIsConnected(websocketService.isConnected());
      setConnectionState(websocketService.getState());
    };

    const checkAuthAndConnect = () => {
      const isAuthenticated = authService.isAuthenticated();
      const currentState = websocketService.getState();
      const isCurrentlyConnected = websocketService.isConnected();
      
      if (isAuthenticated) {
        // Only connect if not already connected or connecting
        if (!isCurrentlyConnected && currentState === 'disconnected') {
          logger.info('Connecting WebSocket (authenticated)');
          websocketService.connect();
        }
        // Start state update interval if not already running
        if (!stateUpdateInterval) {
          stateUpdateInterval = setInterval(updateConnectionState, 1000);
        }
      } else {
        // Disconnect if authenticated but should not be
        if (isCurrentlyConnected || currentState !== 'disconnected') {
          logger.info('Disconnecting WebSocket (not authenticated)');
          websocketService.disconnect();
          setIsConnected(false);
          setConnectionState('disconnected');
          
          // Clear all handlers when disconnecting
          handlersRef.current.forEach((handlers) => handlers.clear());
          handlersRef.current.clear();
          unsubscribeFunctionsRef.current.forEach((unsubscribe) => unsubscribe());
          unsubscribeFunctionsRef.current.clear();
        }
        // Stop state update interval
        if (stateUpdateInterval) {
          clearInterval(stateUpdateInterval);
          stateUpdateInterval = null;
        }
      }
    };

    // Initial check
    checkAuthAndConnect();
    updateConnectionState();

    // Listen for storage changes (when token is set/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        logger.info('Auth token changed in storage, rechecking WebSocket connection');
        checkAuthAndConnect();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Check periodically in case token changes in same window (but less frequently)
    // This acts as a backup to ensure connection state stays in sync
    authCheckInterval = setInterval(() => {
      const isAuthenticated = authService.isAuthenticated();
      const currentState = websocketService.getState();
      const isCurrentlyConnected = websocketService.isConnected();
      
      // Sync connection state with auth state
      if (isAuthenticated && !isCurrentlyConnected && currentState === 'disconnected') {
        // User is authenticated but WebSocket is disconnected - attempt connection
        checkAuthAndConnect();
      } else if (!isAuthenticated && (isCurrentlyConnected || currentState !== 'disconnected')) {
        // User is not authenticated but WebSocket is connected - disconnect
        checkAuthAndConnect();
      }
      
      // Always update state
      updateConnectionState();
    }, 2000); // Check every 2 seconds to be more responsive

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (authCheckInterval) {
        clearInterval(authCheckInterval);
      }
      if (stateUpdateInterval) {
        clearInterval(stateUpdateInterval);
      }
      if (!authService.isAuthenticated()) {
        websocketService.disconnect();
      }
    };
  }, []);

  /**
   * Subscribe to a WebSocket event
   * Returns an unsubscribe function
   */
  const subscribe = useCallback((event: WebSocketEvent, handler: (data: unknown) => void): (() => void) => {
    // Store handler reference
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    // Subscribe to WebSocket service
    const unsubscribe = websocketService.on(event, handler);
    
    // Store unsubscribe function with a unique key
    const handlerKey = `${event}-${Date.now()}-${Math.random()}`;
    unsubscribeFunctionsRef.current.set(handlerKey, () => {
      unsubscribe();
      handlersRef.current.get(event)?.delete(handler);
      if (handlersRef.current.get(event)?.size === 0) {
        handlersRef.current.delete(event);
      }
    });

    // Return unsubscribe function
    return () => {
      const unsubscribeFn = unsubscribeFunctionsRef.current.get(handlerKey);
      if (unsubscribeFn) {
        unsubscribeFn();
        unsubscribeFunctionsRef.current.delete(handlerKey);
      }
    };
  }, []);

  // Create context value - ensure it's always defined
  // Using useMemo to prevent unnecessary re-renders
  const value: WebSocketContextType = useMemo<WebSocketContextType>(() => ({
    isConnected: isConnected ?? false,
    state: connectionState ?? 'disconnected',
    subscribe: subscribe,
  }), [isConnected, connectionState, subscribe]);

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

