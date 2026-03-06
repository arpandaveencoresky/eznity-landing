import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { logger } from '@/utils/logger';

const INSTAGRAM_PUBLISH_STORAGE_KEY = 'instagram_publish_state';

interface PublishState {
  reelId: string;
  status: 'publishing' | 'success' | 'error';
  startTime: number;
  errorMessage?: string;
}

interface PublishResult {
  success: boolean;
  message?: string;
}

/**
 * Hook for publishing reels to Instagram with persistent toast notifications
 * The toast will persist across page navigation and show status on success/error
 */
export function useInstagramPublish() {
  const { t } = useTranslation();
  const toastUpdateRef = useRef<{ 
    update: (props: { title?: string; description?: string; variant?: string }) => void; 
    dismiss: () => void 
  } | null>(null);

  // Check for pending publish on mount and show toast if needed
  useEffect(() => {
    const checkPendingPublish = () => {
      const storedState = localStorage.getItem(INSTAGRAM_PUBLISH_STORAGE_KEY);
      if (!storedState) return;

      try {
        const state: PublishState = JSON.parse(storedState);
        
        if (state.status === 'publishing') {
          // Publish is in progress, show the toast again
          const toastInstance = toast({
            title: t('reelDetails.instagramPublishing'),
            description: t('reelDetails.instagramPublishingDescription'),
            variant: 'progress',
            duration: Infinity,
          });
          toastUpdateRef.current = toastInstance;
        } else if (state.status === 'success') {
          // Publish completed successfully, show success toast
          toast({
            title: t('reelDetails.instagramPublishSuccess'),
            description: t('reelDetails.instagramPublishSuccessDescription'),
            variant: 'success',
          });
          // Clean up
          localStorage.removeItem(INSTAGRAM_PUBLISH_STORAGE_KEY);
        } else if (state.status === 'error') {
          // Publish failed, show error toast
          toast({
            title: t('reelDetails.instagramPublishFailed'),
            description: state.errorMessage || t('reelDetails.errors.instagramPublishFailed'),
            variant: 'destructive',
          });
          // Clean up
          localStorage.removeItem(INSTAGRAM_PUBLISH_STORAGE_KEY);
        }
      } catch (error) {
        logger.error('[useInstagramPublish] Error parsing stored publish state:', error);
        localStorage.removeItem(INSTAGRAM_PUBLISH_STORAGE_KEY);
      }
    };

    checkPendingPublish();
  }, [t]);

  const publishToInstagram = useCallback(async (
    reelId: string, 
    styleSkinId: number = 1
  ): Promise<PublishResult> => {
    if (!reelId) {
      toast({
        title: t('reelDetails.instagramPublishError'),
        description: t('reelDetails.instagramPublishErrorDescription'),
        variant: 'destructive',
      });
      return { success: false };
    }

    // Store publish state
    const publishState: PublishState = {
      reelId,
      status: 'publishing',
      startTime: Date.now(),
    };
    localStorage.setItem(INSTAGRAM_PUBLISH_STORAGE_KEY, JSON.stringify(publishState));

    // Create persistent toast
    const toastInstance = toast({
      title: t('reelDetails.instagramPublishing'),
      description: t('reelDetails.instagramPublishingDescription'),
      variant: 'progress',
      duration: Infinity, // Keep it open until manually dismissed or updated
    });

    toastUpdateRef.current = toastInstance;

    try {
      const response = await apiService.publishToInstagram(reelId, styleSkinId);

      // Update publish state to success
      publishState.status = 'success';
      localStorage.setItem(INSTAGRAM_PUBLISH_STORAGE_KEY, JSON.stringify(publishState));

      // Update toast to success
      if (toastUpdateRef.current) {
        toastUpdateRef.current.update({
          title: t('reelDetails.instagramPublishSuccess'),
          description: response.message || t('reelDetails.instagramPublishSuccessDescription'),
          variant: 'success',
        });
      } else {
        // Fallback: create new toast if update ref is lost
        toast({
          title: t('reelDetails.instagramPublishSuccess'),
          description: response.message || t('reelDetails.instagramPublishSuccessDescription'),
          variant: 'success',
        });
      }

      // Clean up after a delay to allow the success toast to be seen
      setTimeout(() => {
        localStorage.removeItem(INSTAGRAM_PUBLISH_STORAGE_KEY);
        toastUpdateRef.current = null;
      }, 3000);

      return { success: true, message: response.message };
    } catch (error: unknown) {
      logger.error('[useInstagramPublish] Publish error:', error);
      const errorMessage = error instanceof Error ? error.message : t('reelDetails.errors.instagramPublishFailed');

      // Update publish state to error
      publishState.status = 'error';
      publishState.errorMessage = errorMessage;
      localStorage.setItem(INSTAGRAM_PUBLISH_STORAGE_KEY, JSON.stringify(publishState));

      // Update toast to error
      if (toastUpdateRef.current) {
        toastUpdateRef.current.update({
          title: t('reelDetails.instagramPublishFailed'),
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        // Fallback: create new toast if update ref is lost
        toast({
          title: t('reelDetails.instagramPublishFailed'),
          description: errorMessage,
          variant: 'destructive',
        });
      }

      // Clean up after error
      setTimeout(() => {
        localStorage.removeItem(INSTAGRAM_PUBLISH_STORAGE_KEY);
        toastUpdateRef.current = null;
      }, 5000);

      return { success: false, message: errorMessage };
    }
  }, [t]);

  return { publishToInstagram };
}

