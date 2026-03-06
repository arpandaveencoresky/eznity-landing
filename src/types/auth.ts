// Authentication types

export interface ConnectedAccount {
  avatar_url: string | null;
  display_name: string | null;
  connected: boolean;
}

export interface ConnectedAccounts {
  tiktok: ConnectedAccount;
  instagram: ConnectedAccount;
  youtube: ConnectedAccount;
  twitch: ConnectedAccount;
}

export interface ActivePlan {
  id: number;
  name: string;
  price: number;
  interval: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export interface User {
  name: string;
  email: string;
  connected_accounts: ConnectedAccounts;
  active_plan: ActivePlan | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignupResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ErrorResponse422 {
  detail: ValidationError[];
}

export interface ErrorResponse404 {
  code: number;
  detail: string;
}

export interface ErrorResponse409 {
  code: number;
  detail: string;
}

export interface ErrorResponse401 {
  code?: number;
  detail?: string;
  message?: string;
}

export interface DashboardResponse {
  instagram_reel_count: number;
  youtube_short_count: number;
  tiktok_reel_count: number;
}

export interface AuthorizationUrlResponse {
  authorization_url: string;
}

export interface SocialCallbackRequest {
  code: string;
  state: string;
}

export interface SocialCallbackResponse {
  message: string;
  platform?: string;
}

