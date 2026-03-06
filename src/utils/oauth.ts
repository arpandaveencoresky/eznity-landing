// OAuth utility functions for handling social account connections

import { authService } from '@/services/authService';
import i18n from '@/i18n/config';
import { toast } from '@/hooks/use-toast';

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'twitch';

interface OAuthCallbackParams {
  code: string;
  state: string;
}

interface OAuthPopupOptions {
  width?: number;
  height?: number;
}

interface OAuthCallbacks {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
  onPopupClosed?: () => void;
}

/**
 * Calculate popup window position to center it on the screen
 */
export const calculatePopupPosition = (width: number, height: number) => {
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  return { left, top };
};

/**
 * Open OAuth popup window with specified dimensions
 */
export const openOAuthPopup = (
  url: string,
  windowName: string,
  options: OAuthPopupOptions = {}
): Window | null => {
  const { width = 600, height = 700 } = options;
  const { left, top } = calculatePopupPosition(width, height);

  const popup = window.open(
    url,
    windowName,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    throw new Error(i18n.t('auth.messages.popupBlocked'));
  }

  return popup;
};

/**
 * Extract OAuth callback parameters from URL
 */
export const extractOAuthParams = (url: string): OAuthCallbackParams | null => {
  try {
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');

    if (code && state) {
      return { code, state };
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Check if URL contains OAuth error parameters
 */
export const extractOAuthError = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const error = urlObj.searchParams.get('error');
    if (error) {
      return (
        urlObj.searchParams.get('error_description') ||
        error ||
        i18n.t('auth.messages.authorizationFailed')
      );
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Check if error is a cross-origin error (expected during OAuth flow)
 */
export const isCrossOriginError = (error: any): boolean => {
  if (!error?.message) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('cross-origin') ||
    message.includes('blocked a frame') ||
    message.includes('permission denied')
  );
};

/**
 * Handle OAuth popup callback monitoring
 */
export const monitorOAuthPopup = (
  popup: Window,
  currentOrigin: string,
  callbacks: OAuthCallbacks & { onSuccessWithUrl?: (url: string) => void } = {}
): { cleanup: () => void } => {
  const { onSuccess, onError, onTimeout, onSuccessWithUrl, onPopupClosed } = callbacks;

  let timeoutId: NodeJS.Timeout | undefined;
  let intervalId: NodeJS.Timeout | undefined;

  // Monitor popup for callback
  intervalId = setInterval(async () => {
    try {
      if (popup.closed) {
        clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        // Notify that popup was closed without success
        onPopupClosed?.();
        return;
      }

      // Try to access popup URL
      let popupUrl: string;
      try {
        popupUrl = popup.location.href;
        // Log every popup URL we can access (for debugging)
        console.log('[OAuth Popup] Current popup URL:', popupUrl);
      } catch (e) {
        // Cross-origin error - popup is still on OAuth provider's domain
        // This is expected, continue checking
        return;
      }

      // Check if popup is on our domain (after server redirect)
      // Also check if it contains /oauth/callback path
      const isOnOurDomain = popupUrl.startsWith(currentOrigin);
      const isCallbackRoute = popupUrl.includes('/oauth/callback');
      
      // Debug logging for callback route
      if (isCallbackRoute) {
        console.log('[OAuth Callback] Popup on callback route:', {
          popupUrl,
          currentOrigin,
          isOnOurDomain,
          isCallbackRoute,
          fullUrl: popupUrl,
        });
      }
      
      if (!isOnOurDomain && !isCallbackRoute) {
        // Still on OAuth provider or server domain, continue waiting
        return;
      }

      // Also check if we're on our domain (original logic for backwards compatibility)
      if (isOnOurDomain) {
        // Check for error first
        const error = extractOAuthError(popupUrl);
        if (error) {
          clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);
          popup.close();
          onError?.(error);
          return;
        }

        // Extract callback parameters
        const params = extractOAuthParams(popupUrl);
        if (params) {
          console.log('OAuth params detected, closing popup:', params);
          clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);
          // Call onSuccessWithUrl first if provided, then onSuccess
          if (onSuccessWithUrl) {
            onSuccessWithUrl(popupUrl);
          }
          // Close popup immediately
          if (popup && !popup.closed) {
            popup.close();
          }
          onSuccess?.();
          return;
        }
      }
    } catch (error: any) {
      // Ignore cross-origin errors
      if (!isCrossOriginError(error)) {
        clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        if (popup && !popup.closed) {
          popup.close();
        }
        onError?.(error.message || i18n.t('auth.messages.authorizationFailed'));
      }
    }
  }, 500);

  // Timeout after 5 minutes
  timeoutId = setTimeout(() => {
    if (!popup.closed) {
      clearInterval(intervalId);
      popup.close();
      onTimeout?.();
    }
  }, 5 * 60 * 1000);

  return {
    cleanup: () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    },
  };
};

/**
 * Initiate OAuth flow with in-window redirect (instead of popup)
 * Stores platform and return URL in sessionStorage for callback handling
 */
export const initiateOAuthRedirect = async (
  platform: SocialPlatform,
  returnUrl?: string
): Promise<void> => {
  try {
    // Get authorization URL from API with redirect_uri pointing to /auth/redirect
    const redirectUri = `${window.location.origin}/auth/redirect`;
    const authUrl = await authService.getAuthorizationUrl(platform, redirectUri);

    // Store platform and return URL in sessionStorage for callback handling
    sessionStorage.setItem('oauth_platform', platform);
    sessionStorage.setItem('oauth_return_url', returnUrl || '/dashboard');

    // Redirect the current window (same window, not popup) to OAuth provider
    window.location.href = authUrl;
  } catch (error: any) {
    // Clear sessionStorage on error
    sessionStorage.removeItem('oauth_platform');
    sessionStorage.removeItem('oauth_return_url');
    throw error;
  }
};

/**
 * Complete OAuth flow for social platform connection
 */
export const connectSocialAccount = async (
  platform: SocialPlatform,
  callbacks: {
    onLinkingStart?: () => void;
    onLinkingEnd?: () => void;
    onSuccess?: () => void;
    onError?: (error: string) => void;
  }
): Promise<void> => {
  const { onLinkingStart, onLinkingEnd, onSuccess, onError } = callbacks;

  try {
    onLinkingStart?.();

    // Get authorization URL from API with redirect_uri
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const authUrl = await authService.getAuthorizationUrl(platform, redirectUri);

    // Open popup window
    const popup = openOAuthPopup(authUrl, `${platform}_oauth`);

    const currentOrigin = window.location.origin;

    // Monitor popup for callback
    const { cleanup } = monitorOAuthPopup(popup, currentOrigin, {
      onSuccess: async () => {
        try {
          // Get callback parameters from popup URL
          // Note: We need to get these from the popup before it closes
          // This is handled in the monitorOAuthPopup function
          // For now, we'll need to pass the params differently
          // This is a limitation - we'll handle it in the component
          onSuccess?.();
        } catch (error: any) {
          onError?.(error.message || i18n.t('auth.messages.connectionFailed', { platform }));
        } finally {
          onLinkingEnd?.();
        }
      },
      onError: (error) => {
        toast({
          title: i18n.t('common.toast.error'),
          description: error || i18n.t('auth.messages.connectionFailed', { platform }),
          variant: 'destructive',
        });
        onError?.(error);
        onLinkingEnd?.();
      },
      onTimeout: () => {
        toast({
          title: i18n.t('common.toast.timeout'),
          description: i18n.t('auth.messages.authorizationTimeout'),
          variant: 'destructive',
        });
        onError?.(i18n.t('auth.messages.authorizationTimeout'));
        onLinkingEnd?.();
      },
    });

    // Return cleanup function
    return cleanup as any;
  } catch (error: any) {
    toast({
      title: i18n.t('common.toast.error'),
      description: error.message || i18n.t('auth.messages.connectionFailed', { platform }),
      variant: 'destructive',
    });
    onError?.(error.message || i18n.t('auth.messages.connectionFailed', { platform }));
    onLinkingEnd?.();
    throw error;
  }
};

