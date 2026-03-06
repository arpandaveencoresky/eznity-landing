import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { logger } from '@/utils/logger';

const EXPORT_STORAGE_KEY = 'video_export_state';

interface ExportState {
  reelId: string;
  status: 'exporting' | 'success' | 'error';
  startTime: number;
  errorMessage?: string;
}

/**
 * Hook for exporting videos with persistent toast notifications
 * The toast will persist across page navigation and show again on success
 */
export function useVideoExport() {
  const { t } = useTranslation();
  const toastUpdateRef = useRef<ReturnType<typeof toast> | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Check for pending exports on mount and show toast if needed
  useEffect(() => {
    const checkPendingExport = () => {
      // If the page was hard reloaded, skip restoring export state to avoid re-opening the popup
      const navEntry = performance.getEntriesByType?.('navigation')?.[0] as PerformanceNavigationTiming | undefined;
      const isReload = navEntry?.type === 'reload' || (performance as Performance & { navigation?: { type?: number; TYPE_RELOAD?: number } }).navigation?.type === (performance as Performance & { navigation?: { TYPE_RELOAD?: number } }).navigation?.TYPE_RELOAD;
      if (isReload) {
        localStorage.removeItem(EXPORT_STORAGE_KEY);
        return;
      }

      const storedState = localStorage.getItem(EXPORT_STORAGE_KEY);
      if (!storedState) return;

      try {
        const state: ExportState = JSON.parse(storedState);
        
        if (state.status === 'exporting') {
          setIsExporting(true);
          // Export is in progress, show the toast again
          const toastInstance = toast({
            title: t('reelDetails.exporting'),
            description: t('reelDetails.exportingDescription'),
            variant: 'progress',
            duration: 3000,
          });
          toastUpdateRef.current = toastInstance;
          setTimeout(() => {
            if (toastUpdateRef.current === toastInstance) {
              toastUpdateRef.current = null;
            }
          }, 3000);
        } else if (state.status === 'success') {
          // Export completed successfully, show success toast
          const successToast = toast({
            title: t('reelDetails.exportSuccessful'),
            description: t('reelDetails.exportSuccessfulDescription'),
            variant: 'success',
            duration: 3000,
          });
          setTimeout(() => successToast.dismiss(), 3000);
          // Clean up
          localStorage.removeItem(EXPORT_STORAGE_KEY);
          setIsExporting(false);
        } else if (state.status === 'error') {
          // Export failed, show error toast
          const errorToast = toast({
            title: t('reelDetails.exportFailed'),
            description: state.errorMessage || t('reelDetails.errors.exportFailed'),
            variant: 'destructive',
            duration: 3000,
          });
          setTimeout(() => errorToast.dismiss(), 3000);
          // Clean up
          localStorage.removeItem(EXPORT_STORAGE_KEY);
          setIsExporting(false);
        }
      } catch (error) {
        logger.error('[useVideoExport] Error parsing stored export state:', error);
        localStorage.removeItem(EXPORT_STORAGE_KEY);
        setIsExporting(false);
      }
    };

    checkPendingExport();
  }, [t]);

  const exportVideo = useCallback(async (reelId: string, styleSkinId: number = 1) => {
    if (isExporting) return;
    if (!reelId) {
      toast({
        title: t('reelDetails.exportError'),
        description: t('reelDetails.exportErrorDescription'),
        variant: 'destructive',
      });
      return;
    }
    setIsExporting(true);

    // Store export state
    const exportState: ExportState = {
      reelId,
      status: 'exporting',
      startTime: Date.now(),
    };
    localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(exportState));

    // Create progress toast (auto hides after 3s)
    const toastInstance = toast({
      title: t('reelDetails.exporting'),
      description: t('reelDetails.exportingDescription'),
      variant: 'progress',
      duration: 3000,
    });

    toastUpdateRef.current = toastInstance;
    setTimeout(() => {
      if (toastUpdateRef.current === toastInstance) {
        toastUpdateRef.current = null;
      }
    }, 3000);

    try {
      const videoBlob = await apiService.exportVideo(reelId, styleSkinId);

      // Create a download link
      const url = window.URL.createObjectURL(videoBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reel-${reelId}-export.mp4`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update export state to success
      exportState.status = 'success';
      localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(exportState));

      // Close progress toast and show success
      if (toastUpdateRef.current) {
        toastUpdateRef.current.dismiss();
        toastUpdateRef.current = null;
      }
      toast({
        title: t('reelDetails.exportSuccessful'),
        description: t('reelDetails.exportSuccessfulDescription'),
        variant: 'success',
        duration: 3000,
      });

      localStorage.removeItem(EXPORT_STORAGE_KEY);
      setIsExporting(false);
    } catch (error: unknown) {
      logger.error('[useVideoExport] Export error:', error);
      const errorMessage = error instanceof Error ? error.message : t('reelDetails.errors.exportFailed');

      // Update export state to error
      exportState.status = 'error';
      exportState.errorMessage = errorMessage;
      localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(exportState));

      // Close progress toast and show error
      if (toastUpdateRef.current) {
        toastUpdateRef.current.dismiss();
        toastUpdateRef.current = null;
      }
      toast({
        title: t('reelDetails.exportFailed'),
        description: errorMessage,
        variant: 'destructive',
        duration: 3000,
      });

      localStorage.removeItem(EXPORT_STORAGE_KEY);
      setIsExporting(false);
    }
  }, [isExporting, t]);

  return { exportVideo, isExporting };
}

