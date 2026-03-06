// Centralized validation schemas for authentication forms

import * as z from 'zod';

// Common validation rules
const emailValidation = z.string().email('Please enter a valid email address');
const passwordValidation = z.string().min(6, 'Password must be at least 6 characters');
const nameValidation = z.string().min(2, 'Name must be at least 2 characters');
const requiredPassword = z.string().min(1, 'Current password is required');
const otpValidation = z.string().length(6, 'OTP must be 6 digits');

// Login validation schema
export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Signup validation schema
export const signupSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  confirmPassword: passwordValidation,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignupFormValues = z.infer<typeof signupSchema>;

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Verify OTP validation schema
export const verifyOTPSchema = z.object({
  otp: otpValidation,
  newPassword: passwordValidation,
  confirmPassword: passwordValidation,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>;

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: requiredPassword,
  newPassword: passwordValidation,
  confirmPassword: passwordValidation,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

