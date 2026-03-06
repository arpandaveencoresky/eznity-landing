// Authentication service for API calls

import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  AuthResponse,
  ErrorResponse422,
  ErrorResponse404,
  ErrorResponse409,
  ErrorResponse401,
  DashboardResponse,
  AuthorizationUrlResponse,
  SocialCallbackRequest,
  SocialCallbackResponse,
} from '../types/auth';
import { FEATURE_FLAGS, DUMMY_USER, DUMMY_TOKEN } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nidifugous-informedly-oliva.ngrok-free.dev';

class AuthService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const token = this.getToken();
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning page
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 unauthorized errors (invalid credentials - valid response, don't log)
        if (response.status === 401) {
          const errorData = data as ErrorResponse401;
          throw new Error(errorData.detail || errorData.message || 'Invalid email or password');
        }

        // Handle 422 validation errors
        if (response.status === 422) {
          const errorData = data as ErrorResponse422;
          const errorMessages = errorData.detail.map(err => err.msg).join(', ');
          throw new Error(errorMessages || 'Validation error');
        }
        
        // Handle 404 errors
        if (response.status === 404) {
          const errorData = data as ErrorResponse404;
          throw new Error(errorData.detail || 'Not found');
        }

        // Handle 409 conflict errors (e.g., user already exists)
        if (response.status === 409) {
          const errorData = data as ErrorResponse409;
          throw new Error(errorData.detail || 'Conflict error');
        }

        // Handle other errors (only log unexpected errors, not 401)
        const errorMessage = data.detail || data.message || data.error || `HTTP error! status: ${response.status}`;
        // Error logging handled by logger utility if needed
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (error) {
      // Only re-throw the error, don't log it here (401 errors are expected)
      // The error will be caught and displayed to the user via toast
      throw error;
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Bypass auth if flag is enabled
    if (FEATURE_FLAGS.BYPASS_AUTH) {
      this.setToken(DUMMY_TOKEN);
      return {
        access_token: DUMMY_TOKEN,
        token_type: 'bearer',
        user: DUMMY_USER as User,
      };
    }

    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    // Bypass auth if flag is enabled
    if (FEATURE_FLAGS.BYPASS_AUTH) {
      this.setToken(DUMMY_TOKEN);
      return {
        access_token: DUMMY_TOKEN,
        token_type: 'bearer',
        user: {
          ...DUMMY_USER,
          email: userData.email,
          name: userData.name || DUMMY_USER.name,
        } as User,
      };
    }

    const response = await this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    // Bypass auth if flag is enabled
    if (FEATURE_FLAGS.BYPASS_AUTH) {
      return DUMMY_USER as User;
    }

    return this.request<User>('/auth/me', {
      method: 'GET',
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message?: string; detail?: string }> {
    return this.request<{ message?: string; detail?: string }>('/auth/forgot/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<{ message?: string; detail?: string }> {
    return this.request<{ message?: string; detail?: string }>('/auth/verify/otp', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        otp: data.otp,
        new_password: data.newPassword, // API expects snake_case
      }),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message?: string; detail?: string }> {
    return this.request<{ message?: string; detail?: string }>('/auth/reset/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message?: string; detail?: string }> {
    // Use resetPassword endpoint with old_password and new_password
    // User is authenticated via token, so email is not needed
    return this.request<{ message?: string; detail?: string }>('/auth/reset/password', {
      method: 'POST',
      body: JSON.stringify({
        old_password: data.currentPassword, // API expects snake_case
        new_password: data.newPassword, // API expects snake_case
      }),
    });
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    // Bypass auth if flag is enabled
    if (FEATURE_FLAGS.BYPASS_AUTH) {
      return true;
    }
    return !!this.getToken();
  }

  async getDashboard(): Promise<DashboardResponse> {
    // Bypass auth if flag is enabled
    if (FEATURE_FLAGS.BYPASS_AUTH) {
      return {
        instagram_reel_count: 0,
        youtube_short_count: 0,
        tiktok_reel_count: 0,
      };
    }

    return this.request<DashboardResponse>('/dashboard', {
      method: 'GET',
    });
  }

  // Social OAuth methods
  async getAuthorizationUrl(
    platform: 'instagram' | 'youtube' | 'tiktok' | 'twitch',
    redirectUri?: string
  ): Promise<string> {
    // Construct redirect_uri if not provided
    const finalRedirectUri = redirectUri || `${window.location.origin}/oauth/callback`;
    
    // Build query parameters
    const params = new URLSearchParams({
      redirect_uri: finalRedirectUri,
    });
    
    const response = await this.request<AuthorizationUrlResponse>(
      `/${platform}/authorize`,
      {
        method: 'GET',
      }
    );
    return response.authorization_url;
  }

  async handleSocialCallback(
    data: SocialCallbackRequest,
    platform?: 'instagram' | 'youtube' | 'tiktok' | 'twitch'
  ): Promise<SocialCallbackResponse> {
    // If platform is provided, use the specific endpoint, otherwise use generic callback
    const endpoint = platform ? `/${platform}/callback` : '/oauth/callback';
    
    const token = this.getToken();
    
    console.log('Calling OAuth callback endpoint:', {
      baseUrl: this.baseUrl,
      endpoint,
      data,
      hasToken: !!token,
    });
    
    // Ensure bearer token is included in headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found for OAuth callback');
    }
    
    try {
      const response = await this.request<SocialCallbackResponse>(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('OAuth callback request failed:', {
        endpoint,
        baseUrl: this.baseUrl,
        hasToken: !!token,
        error,
      });
      throw error;
    }
  }

  async disconnectSocialAccount(platform: 'instagram' | 'youtube' | 'tiktok' | 'twitch'): Promise<{ message?: string; detail?: string }> {
    return this.request<{ message?: string; detail?: string }>(`/${platform}/disconnect`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

