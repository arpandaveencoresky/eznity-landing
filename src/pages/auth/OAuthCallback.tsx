// OAuth callback handler page for in-window redirect flow
// Handles OAuth callback when user is redirected back from OAuth provider

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { extractOAuthParams, extractOAuthError, type SocialPlatform } from '@/utils/oauth';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get platform and return URL from sessionStorage
        const platform = sessionStorage.getItem('oauth_platform') as SocialPlatform | null;
        const returnUrl = sessionStorage.getItem('oauth_return_url') || '/dashboard';

        if (!platform) {
          throw new Error('OAuth platform not found in session');
        }

        // Get current URL
        const currentUrl = window.location.href;

        // Check for OAuth errors first
        const error = extractOAuthError(currentUrl);
        if (error) {
          throw new Error(error);
        }

        // Extract OAuth callback parameters
        const callbackParams = extractOAuthParams(currentUrl);
        if (!callbackParams) {
          throw new Error(t('auth.messages.authorizationFailed'));
        }

        // Send callback to server
        await authService.handleSocialCallback(callbackParams, platform);

        // Refresh user data to get updated connected accounts
        await refreshUser();

        // Clear sessionStorage
        sessionStorage.removeItem('oauth_platform');
        sessionStorage.removeItem('oauth_return_url');

        // Show success message
        toast({
          title: t('common.toast.success'),
          description: t('auth.messages.accountConnected', {
            platform: platform.charAt(0).toUpperCase() + platform.slice(1)
          }),
        });

        setStatus('success');

        // Redirect back to the original page or settings
        setTimeout(() => {
          navigate(returnUrl);
        }, 1500);
      } catch (error: any) {
        const errorMsg = error.message || t('auth.messages.connectionFailed', { platform: 'social account' });
        setErrorMessage(errorMsg);
        setStatus('error');

        // Clear sessionStorage on error
        sessionStorage.removeItem('oauth_platform');
        sessionStorage.removeItem('oauth_return_url');

        toast({
          title: t('common.toast.error'),
          description: errorMsg,
          variant: 'destructive',
        });

        // Redirect back to dashboard after showing error
        setTimeout(() => {
          navigate('/product/dashboard');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, refreshUser, t]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      gap: '1rem'
    }}>
      {status === 'processing' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("auth.processingAuthorization")}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-600">{t('auth.messages.accountConnected', { platform: 'account' })}</p>
          <p className="text-sm text-muted-foreground">{t('auth.redirecting')}</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600">{errorMessage}</p>
          <p className="text-sm text-muted-foreground">{t('auth.redirecting')}</p>
        </>
      )}
    </div>
  );
};

export default OAuthCallback;
