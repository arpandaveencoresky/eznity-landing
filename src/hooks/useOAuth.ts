// Custom hook for OAuth social account connection

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';
import {
  openOAuthPopup,
  monitorOAuthPopup,
  extractOAuthParams,
  extractOAuthError,
  type SocialPlatform,
} from '@/utils/oauth';

interface UseOAuthOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useOAuth = (options: UseOAuthOptions = {}) => {
  const { t } = useTranslation();
  const { onSuccess: onSuccessCallback, onError: onErrorCallback } = options;
  const [isLinking, setIsLinking] = useState<SocialPlatform | null>(null);

  const connectAccount = async (platform: SocialPlatform) => {
    if (isLinking) return;

    setIsLinking(platform);

    try {
      // Get authorization URL from API with redirect_uri
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const authUrl = await authService.getAuthorizationUrl(platform, redirectUri);

      // Open popup window
      const popup = openOAuthPopup(authUrl, `${platform}_oauth`);

      const currentOrigin = window.location.origin;
      let callbackParams: { code: string; state: string } | null = null;

      // Monitor popup for callback
      const { cleanup } = monitorOAuthPopup(popup, currentOrigin, {
        onSuccess: async () => {
          try {
            // Get the final URL before popup closes
            // We need to extract params from the popup URL
            let popupUrl = '';
            try {
              popupUrl = popup.location.href;
            } catch {
              // Popup already closed or cross-origin
            }

            if (popupUrl) {
              callbackParams = extractOAuthParams(popupUrl);
            }

            if (!callbackParams) {
              throw new Error(t('auth.messages.authorizationFailed'));
            }

            // Send callback to our server
            await authService.handleSocialCallback(callbackParams, platform);

            toast({
              title: t('common.toast.success'),
              description: t('auth.messages.accountConnected', {
                platform: platform.charAt(0).toUpperCase() + platform.slice(1)
              }),
            });

            onSuccessCallback?.();
          } catch (error: any) {
            const errorMessage =
              error.message || t('auth.messages.connectionFailed', { platform });
            toast({
              title: t('common.toast.error'),
              description: errorMessage,
              variant: 'destructive',
            });
            onErrorCallback?.(errorMessage);
          } finally {
            setIsLinking(null);
          }
        },
        onError: (error) => {
          toast({
            title: t('common.toast.error'),
            description: error || t('auth.messages.connectionFailed', { platform }),
            variant: 'destructive',
          });
          onErrorCallback?.(error);
          setIsLinking(null);
        },
        onTimeout: () => {
          toast({
            title: t('common.toast.timeout'),
            description: t('auth.messages.authorizationTimeout'),
            variant: 'destructive',
          });
          onErrorCallback?.(t('auth.messages.authorizationTimeout'));
          setIsLinking(null);
        },
      });

      // Store cleanup function (component can call it if needed)
      return cleanup;
    } catch (error: any) {
      const errorMessage =
        error.message || t('auth.messages.connectionFailed', { platform });
      toast({
        title: t('common.toast.error'),
        description: errorMessage,
        variant: 'destructive',
      });
      onErrorCallback?.(errorMessage);
      setIsLinking(null);
      throw error;
    }
  };

  return {
    connectAccount,
    isLinking,
  };
};

