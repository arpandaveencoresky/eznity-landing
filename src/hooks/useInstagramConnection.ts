// Reusable hook for Instagram connection
// Can be used in Dashboard, Settings, and other components

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  initiateOAuthRedirect,
} from '@/utils/oauth';

export const useInstagramConnection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  const [isLinking, setIsLinking] = useState(false);

  const connectInstagram = async () => {
    if (isLinking) return;

    setIsLinking(true);
    try {
      // Initiate OAuth redirect (in-window instead of popup)
      // Use current path as return URL so user comes back to the same page
      await initiateOAuthRedirect('instagram', location.pathname);
      // Note: User will be redirected away, so setIsLinking won't be called
      // The OAuthCallback page will handle the completion
    } catch (error: any) {
      toast({
        title: t('common.toast.error'),
        description: error.message || t('auth.messages.connectionFailed', { platform: 'instagram' }),
        variant: 'destructive',
      });
      setIsLinking(false);
    }
  };

  return {
    connectInstagram,
    isLinking,
  };
};

