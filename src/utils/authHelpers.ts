// Authentication helper functions

import type { User } from '@/types/auth';

/**
 * Get user initials from name or email
 */
export const getUserInitials = (name?: string, email?: string): string => {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'U';
};

/**
 * Get count of connected social accounts
 */
export const getConnectedAccountsCount = (user: User | null): number => {
  if (!user?.connected_accounts) return 0;
  
  let count = 0;
  if (user.connected_accounts.instagram?.connected) count++;
  if (user.connected_accounts.youtube?.connected) count++;
  if (user.connected_accounts.tiktok?.connected) count++;
  if (user.connected_accounts.twitch?.connected) count++;
  
  return count;
};

/**
 * Check if a social account is connected
 */
export const isSocialAccountConnected = (
  user: User | null,
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitch'
): boolean => {
  return user?.connected_accounts?.[platform]?.connected ?? false;
};

/**
 * Get connected account display name
 */
export const getConnectedAccountDisplayName = (
  user: User | null,
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitch'
): string | null => {
  return user?.connected_accounts?.[platform]?.display_name ?? null;
};

/**
 * Get connected account avatar URL
 */
export const getConnectedAccountAvatarUrl = (
  user: User | null,
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitch'
): string | null => {
  return user?.connected_accounts?.[platform]?.avatar_url ?? null;
};

/**
 * Capitalize first letter of string
 */
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

