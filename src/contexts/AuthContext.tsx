// Authentication context for managing user authentication state

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';
import { toast } from '@/hooks/use-toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { websocketService } from '../services/websocketService';

export interface StreamData {
  message?: string;
  streamer_username?: string;
  stream_url?: string;
  status?: string;
  start_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLive: boolean;
  streamData: StreamData | null;
  setIsLive: (isLive: boolean) => void;
  setStreamData: (data: StreamData | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);

  const isAuthenticated = !!user && authService.isAuthenticated();

  // WebSocket integration for stream events (uses global WebSocket context)
  useWebSocket({
    onStreamStarted: (data) => {
      console.log('🚀 Stream started event received in AuthContext:', data);
      const streamInfo = data as StreamData;
      if (streamInfo.status === 'online') {
        setStreamData(streamInfo);
        setIsLive(true);
        console.log('🚀 isLive state updated');
      }
    },
    onStreamOffline: (data) => {
      console.log('🚀 Stream offline event received in AuthContext:', data);
      setStreamData(null);
      setIsLive(false);
    },
  });

  // Debug: Log isLive state changes
  useEffect(() => {
    console.log('🚀 isLive state changed to:', isLive);
  }, [isLive]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setUser(user);
            // Connect WebSocket if user is authenticated
            websocketService.connect();
          } else {
            // Token is invalid, clear it
            websocketService.disconnect();
            authService.logout();
            setUser(null);
          }
        } catch (error) {
          // Auth failure - disconnect WebSocket and logout
          websocketService.disconnect();
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      if (response && response.user) {
        setUser(response.user);
        // Trigger WebSocket connection after successful login
        if (authService.isAuthenticated()) {
          websocketService.connect();
        }
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const response = await authService.signup({ email, password, name });
      if (response && response.user) {
        setUser(response.user);
        // Trigger WebSocket connection after successful signup
        if (authService.isAuthenticated()) {
          websocketService.connect();
        }
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // Disconnect WebSocket before clearing auth
    websocketService.disconnect();
    authService.logout();
    setUser(null);
    setIsLive(false);
    setStreamData(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUser(user);
        // Ensure WebSocket is connected if user is authenticated
        if (authService.isAuthenticated()) {
          websocketService.connect();
        }
      }
    } catch (error) {
      // Only logout on actual authentication failures (401), not on network errors or other issues
      // Check if token still exists - if it does, this might be a transient error
      const hasToken = authService.isAuthenticated();
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      
      // Only logout if:
      // 1. No token exists (shouldn't happen, but be safe)
      // 2. Error message indicates 401/unauthorized (actual auth failure)
      // Don't logout on network errors, timeouts, or other transient issues
      const isAuthError = 
        !hasToken || 
        errorMessage.includes('unauthorized') || 
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('401');
      
      if (isAuthError) {
        // Auth failure - disconnect WebSocket and logout
        websocketService.disconnect();
        logout();
      } else {
        // Transient error (network, timeout, etc.) - just log it but don't logout
        console.warn('Failed to refresh user data (non-auth error):', error);
      }
    }
  }, [logout]);

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    isLive,
    streamData,
    setIsLive,
    setStreamData,
    login,
    signup,
    logout,
    refreshUser,
  }), [user, isLoading, isAuthenticated, isLive, streamData, setIsLive, setStreamData, login, signup, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

