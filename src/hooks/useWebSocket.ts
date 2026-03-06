// React hook for WebSocket connections (uses global WebSocket context)

import { useEffect, useRef } from 'react';
import { WebSocketEvent } from '../services/websocketService';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { VideoStatus } from '../types';

// Event data types
interface ReelsGeneratedData {
  message?: string;
  video_id?: string;
  status?: VideoStatus;
}

interface VideoStatusData {
  message?: string;
  video_id?: string;
  status?: VideoStatus;
  reels_count?: number;
}

interface StreamEventData {
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  onReelsGenerated?: (data: ReelsGeneratedData) => void;
  onVideoStatus?: (data: VideoStatusData) => void;
  onStreamStarted?: (data: StreamEventData) => void;
  onStreamOffline?: (data: StreamEventData) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    onReelsGenerated,
    onVideoStatus,
    onStreamStarted,
    onStreamOffline,
  } = options;

  const { subscribe, isConnected, state } = useWebSocketContext();
  const unsubscribeFunctionsRef = useRef<(() => void)[]>([]);

  // Subscribe to reels_generated event
  useEffect(() => {
    if (onReelsGenerated) {
      const unsubscribe = subscribe('reels_generated', onReelsGenerated);
      unsubscribeFunctionsRef.current.push(unsubscribe);
      
      return () => {
        unsubscribe();
        const index = unsubscribeFunctionsRef.current.indexOf(unsubscribe);
        if (index > -1) {
          unsubscribeFunctionsRef.current.splice(index, 1);
        }
      };
    }
  }, [onReelsGenerated, subscribe]);

  // Subscribe to video_status event
  useEffect(() => {
    if (onVideoStatus) {
      const unsubscribe = subscribe('video_status', onVideoStatus);
      unsubscribeFunctionsRef.current.push(unsubscribe);
      
      return () => {
        unsubscribe();
        const index = unsubscribeFunctionsRef.current.indexOf(unsubscribe);
        if (index > -1) {
          unsubscribeFunctionsRef.current.splice(index, 1);
        }
      };
    }
  }, [onVideoStatus, subscribe]);

  // Subscribe to stream.online event
  useEffect(() => {
    if (onStreamStarted) {
      const unsubscribe = subscribe('stream.online', onStreamStarted);
      unsubscribeFunctionsRef.current.push(unsubscribe);
      
      return () => {
        unsubscribe();
        const index = unsubscribeFunctionsRef.current.indexOf(unsubscribe);
        if (index > -1) {
          unsubscribeFunctionsRef.current.splice(index, 1);
        }
      };
    }
  }, [onStreamStarted, subscribe]);

  // Subscribe to stream.offline event
  useEffect(() => {
    if (onStreamOffline) {
      const unsubscribe = subscribe('stream.offline', onStreamOffline);
      unsubscribeFunctionsRef.current.push(unsubscribe);
      
      return () => {
        unsubscribe();
        const index = unsubscribeFunctionsRef.current.indexOf(unsubscribe);
        if (index > -1) {
          unsubscribeFunctionsRef.current.splice(index, 1);
        }
      };
    }
  }, [onStreamOffline, subscribe]);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      unsubscribeFunctionsRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeFunctionsRef.current = [];
    };
  }, []);

  return {
    isConnected,
    state,
  };
};

