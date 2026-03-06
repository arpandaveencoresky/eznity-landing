/**
 * useEditorAPI Hook
 * 
 * Handles API operations for the editor: loading reel data, saving configs, exporting.
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useVideoExport } from '@/hooks/useVideoExport';
import apiService from '@/services/api';
import { logger } from '@/utils/logger';
import { buildEditorPayload, extractFontInfo } from '@/utils/editorPayload';
import { SubtitleConfig, TitleConfig, SubtitleSegment, CSSProperties, TitlePosition } from '@/types/subtitle';
import { ReelData, ReelCustomization, ReelStylingConfig } from '@/types';
import { allSubtitleStyles, getSubtitleStyleConfig } from '@/data/subtitleTemplates';
import subtitleStylesData from '@/data/subtitleStyles.json';

// Template style interface for font extraction
interface TemplateStyleData {
  id: string;
  name: string;
  fontId: string;
  fontFileName: string;
  config: {
    word?: { 'font-family'?: string };
  };
}

export interface EditorAPIState {
  isLoadingReel: boolean;
  currentReel: ReelData | null;
}

export interface SaveConfigOptions {
  reelId: string;
  selectedSubtitleStyleId: string;
  subtitleConfig: SubtitleConfig;
  wordSubtitlePosition: { x: number; y: number; centered: boolean };
  titleText: string;
  titleDuration: number;
  showTitle: boolean;
  titleConfig: TitleConfig;
  titlePosition: { x: number; y: number; centered: boolean };
}

export interface UseEditorAPIReturn extends EditorAPIState {
  loadReelData: (reelId: string) => Promise<{
    reel: ReelData | null;
    segments: SubtitleSegment[];
    styleId?: string;
    styleSkinId?: number;
    config?: SubtitleConfig;
    position?: { x: number; y: number; centered: boolean };
    title?: string;
    fontId?: string;
    fontName?: string;
    titleConfig?: TitleConfig;
    titlePosition?: { x: number; y: number; centered: boolean };
    titleDuration?: number;
    showTitle?: boolean;
  }>;
  saveConfig: (options: SaveConfigOptions) => Promise<boolean>;
  exportVideo: (reelId: string, styleSkinId?: number) => Promise<void>;
  isExporting: boolean;
  setCurrentReel: (reel: ReelData | null) => void;
}

/**
 * Converts ReelStylingConfig to SubtitleConfig
 */
function convertToSubtitleConfig(reelConfig: ReelStylingConfig): SubtitleConfig {
  return {
    'subtitle-container': reelConfig['subtitle-container'] as CSSProperties,
    'word': reelConfig['word'] as CSSProperties,
    'word-being-narrated': reelConfig['word-being-narrated'] as CSSProperties,
  };
}

export function useEditorAPI(): UseEditorAPIReturn {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { exportVideo: exportVideoWithToast, isExporting } = useVideoExport();
  const [isLoadingReel, setIsLoadingReel] = useState(false);
  const [currentReel, setCurrentReel] = useState<ReelData | null>(null);

  // Parse style_skin_json from API
  const parseStyleSkinJson = useCallback((
    styleSkinJson: Record<string, unknown>,
    styleSkinId?: string | number
  ): { config?: SubtitleConfig; styleId?: string; position?: { x: number; y: number; centered: boolean } } => {
    // Support both 'skin' (new) and 'config' (legacy) field names
    const subtitleData = styleSkinJson?.subtitle as Record<string, unknown> | undefined;
    const skinData = subtitleData?.skin || subtitleData?.config || styleSkinJson?.skin || styleSkinJson?.config;
    if (!skinData) return {};

    const styleConfig = skinData as Record<string, Record<string, string>>;
    
    // Parse position from container
    let position: { x: number; y: number; centered: boolean } | undefined;
    const container = styleConfig['subtitle-container'];
    if (container?.left && container?.top) {
      const leftPercent = parseFloat(String(container.left).replace('%', ''));
      const topPercent = parseFloat(String(container.top).replace('%', ''));
      if (!isNaN(leftPercent) && !isNaN(topPercent)) {
        const transform = container?.transform || '';
        const isCentered = transform.includes('translateX(-50%)');
        position = { x: leftPercent, y: topPercent, centered: isCentered };
      }
    }

    // Determine style ID (check nested subtitle first, then root level)
    const effectiveStyleId = subtitleData?.style_skin_id || styleSkinJson.style_skin_id || styleSkinId;
    let styleId: string | undefined;
    if (effectiveStyleId !== undefined && effectiveStyleId !== null) {
      styleId = String(effectiveStyleId);
    }

    // Convert to SubtitleConfig
    const subtitleConfig: SubtitleConfig = {
      'subtitle-container': styleConfig['subtitle-container'] as CSSProperties,
      'word': styleConfig['word'] as CSSProperties,
      'word-being-narrated': styleConfig['word-being-narrated'] as CSSProperties,
    };

    return {
      config: subtitleConfig,
      styleId,
      position,
    };
  }, []);

  // Parse customization from API (legacy format)
  const parseCustomization = useCallback((
    customization: ReelCustomization
  ): { config?: SubtitleConfig; styleId?: string; position?: { x: number; y: number; centered: boolean } } => {
    if (!customization?.config) return {};

    const reelConfig = customization.config;
    let position: { x: number; y: number; centered: boolean } | undefined;

    if (reelConfig['subtitle-container']?.left && reelConfig['subtitle-container']?.top) {
      const leftPercent = parseFloat(String(reelConfig['subtitle-container'].left).replace('%', ''));
      const topPercent = parseFloat(String(reelConfig['subtitle-container'].top).replace('%', ''));
      if (!isNaN(leftPercent) && !isNaN(topPercent)) {
        const transform = reelConfig['subtitle-container']?.transform || '';
        const isCentered = transform.includes('translateX(-50%)');
        position = { x: leftPercent, y: topPercent, centered: isCentered };
      }
    }

    // Convert ReelStylingConfig to SubtitleConfig
    const subtitleConfig = convertToSubtitleConfig(reelConfig);

    return {
      config: subtitleConfig,
      styleId: customization.styleId,
      position,
    };
  }, []);

  // Load reel data from API using three separate endpoints with progressive loading
  const loadReelData = useCallback(async (reelId: string) => {
    logger.log('[useEditorAPI] Fetching reel data for reelId:', reelId);
    setIsLoadingReel(true);

    // Start all three API calls in parallel - each resolves independently
    // This allows progressive loading: data appears as soon as each API responds
    
    const resolvedData: {
      reel: ReelData | null;
      segments: SubtitleSegment[];
      styleId?: string;
      styleSkinId?: number;
      config?: SubtitleConfig;
      position?: { x: number; y: number; centered: boolean };
      title?: string;
      fontId?: string;
      fontName?: string;
      titleConfig?: TitleConfig;
      titlePosition?: { x: number; y: number; centered: boolean };
      titleDuration?: number;
      showTitle?: boolean;
    } = {
      reel: null,
      segments: [],
    };

    // 1. Fetch reel info (critical - needed for basic display)
    const reelInfoPromise = apiService
      .getReelInfo(reelId)
      .then((reelInfo) => {
        // Create reel data with empty segments initially (will be updated when segments load)
        const reelData: ReelData = {
          public_id: reelInfo.public_id,
          video_url: reelInfo.video_url,
          poster_url: reelInfo.poster_url,
          title: reelInfo.title,
          duration: reelInfo.duration,
          transcript: reelInfo.transcript,
          streamer_name: reelInfo.streamer_name,
          viral_score: reelInfo.viral_score,
          viral_reason: reelInfo.viral_reason,
          caption: reelInfo.caption || undefined,
          instagram_posted: reelInfo.instagram_posted,
          tiktok_posted: reelInfo.tiktok_posted,
          youtube_posted: reelInfo.youtube_posted,
          created_on: reelInfo.created_on,
          updated_on: reelInfo.updated_on || undefined,
          segments: [], // Will be updated when segments API completes
        };
        
        resolvedData.reel = reelData;
        resolvedData.title = reelInfo.title;
        // Extract title_duration from API if available, default to 5 seconds
        if (reelInfo.title_duration !== undefined) {
          resolvedData.titleDuration = reelInfo.title_duration;
        } else {
          resolvedData.titleDuration = 5; // Default
        }
        setCurrentReel(reelData);
        setIsLoadingReel(false);
        
        toast({
          title: t('editor.reelLoaded'),
          description: reelInfo.title || t('editor.reelLoadedDescription'),
        });
        
        return reelInfo;
      })
      .catch((error) => {
        logger.error('[useEditorAPI] Failed to fetch reel info:', error);
        setIsLoadingReel(false);
        toast({
          title: t('common.toast.error'),
          description: t('editor.errors.loadFailed'),
          variant: 'destructive',
        });
        throw error;
      });

    // 2. Fetch segments (non-critical - can load independently)
    const segmentsPromise = apiService
      .getReelSegments(reelId)
      .then((segmentsData) => {
        resolvedData.segments = segmentsData.segments;
        // Update reel with segments (spread previous state to preserve other fields)
        setCurrentReel((prev) => prev ? { ...prev, segments: segmentsData.segments } : prev);
        return segmentsData;
      })
      .catch((error) => {
        logger.warn('[useEditorAPI] Failed to fetch reel segments:', error);
        // Use empty segments as fallback
        resolvedData.segments = [];
        return { reel_id: reelId, segments: [] };
      });

    // 3. Fetch style skin (non-critical - can load independently)
    const styleSkinPromise = apiService
      .getReelStyleSkin(reelId)
      .then((styleSkinData) => {
        // Capture the numeric style_skin_id for export/publish
        if (styleSkinData?.style_skin_id !== undefined) {
          resolvedData.styleSkinId = styleSkinData.style_skin_id;
        }
        
        if (styleSkinData?.style_skin) {
          const styleSkin = styleSkinData.style_skin;
          let subtitleSkin: Record<string, Record<string, string>> | undefined;
          let styleId: string | undefined;
          let fontId: string | undefined;
          let fontName: string | undefined;

          // Handle nested structure: style_skin.subtitle.skin
          if (styleSkin.subtitle) {
            const subtitle = styleSkin.subtitle;
            subtitleSkin = subtitle.skin || subtitle.config;
            styleId = subtitle.theme_name || subtitle.style_skin_id || styleSkinData.theme_name;
            fontId = subtitle.font_id;
            fontName = subtitle.font_name;
          }
          // Handle flat structure: style_skin.skin (for default styles)
          else if (styleSkin.skin) {
            subtitleSkin = styleSkin.skin;
            // For flat structure, use style_skin.id (e.g., "default") or fallback to theme_name
            styleId = styleSkin.id || styleSkinData.theme_name || 'default';
            // For flat structure, font info might not be available
          }

          // Apply subtitle config if found
          if (subtitleSkin) {
            // Convert to SubtitleConfig format - REPLACE completely, don't merge
            const subtitleConfig: SubtitleConfig = {
              'subtitle-container': subtitleSkin['subtitle-container'] as CSSProperties,
              'word': subtitleSkin['word'] as CSSProperties,
              'word-being-narrated': subtitleSkin['word-being-narrated'] as CSSProperties,
            };

            resolvedData.config = subtitleConfig;

            // Extract position from subtitleSkin if available
            const containerStyles = subtitleSkin['subtitle-container'];
            if (containerStyles?.left && containerStyles?.top) {
              const leftPercent = parseFloat(String(containerStyles.left).replace('%', ''));
              const topPercent = parseFloat(String(containerStyles.top).replace('%', ''));
              if (!isNaN(leftPercent) && !isNaN(topPercent)) {
                const transform = containerStyles?.transform || '';
                const isCentered = transform.includes('translateX(-50%)');
                resolvedData.position = { x: leftPercent, y: topPercent, centered: isCentered };
              }
            }
          }

          if (styleId) {
            resolvedData.styleId = styleId;
          }

          // Extract font info from API response
          if (fontId) {
            resolvedData.fontId = fontId;
          }
          if (fontName) {
            resolvedData.fontName = fontName;
          }

          if (subtitleSkin) {
            logger.log('[useEditorAPI] Applied subtitle style_skin from API', styleSkin.subtitle ? '(nested structure)' : '(flat structure)');
          }

          // Extract title data from nested structure
          if (styleSkin.title) {
            const title = styleSkin.title;
            // Primary: use skin, fallback to config for backward compatibility
            const titleSkin = title.skin || title.config;
            
            if (titleSkin) {
              // Extract title config
              const titleConfigData: TitleConfig = {
                'title-container': titleSkin['title-container'] as CSSProperties,
                'title-text': titleSkin['title-text'] as CSSProperties,
              };
              resolvedData.titleConfig = titleConfigData;

              // Extract title position if available
              const containerStyles = titleSkin['title-container'];
              if (containerStyles?.left && containerStyles?.top) {
                const leftPercent = parseFloat(String(containerStyles.left).replace('%', ''));
                const topPercent = parseFloat(String(containerStyles.top).replace('%', ''));
                if (!isNaN(leftPercent) && !isNaN(topPercent)) {
                  const transform = containerStyles?.transform || '';
                  // Only centered if transform includes translateX(-50%), NOT when transform is 'none'
                  const isCentered = transform.includes('translateX(-50%)');
                  resolvedData.titlePosition = { x: leftPercent, y: topPercent, centered: isCentered };
                }
              }

              // Extract title visibility (duration comes from reel/{id} API, not style/skin)
              if (title.visible !== undefined) {
                resolvedData.showTitle = title.visible;
              }

              logger.log('[useEditorAPI] Title skin available from API', title.skin ? '(using skin)' : '(using config fallback)');
            }
          }
        }
        return styleSkinData;
      })
      .catch((error) => {
        logger.warn('[useEditorAPI] Failed to fetch reel style skin:', error);
        // Default to first template if no style skin
        const firstStyle = allSubtitleStyles[0];
        if (firstStyle) {
          const defaultConfig = getSubtitleStyleConfig(firstStyle.id);
          resolvedData.styleId = firstStyle.id;
          resolvedData.config = defaultConfig;
          logger.log('[useEditorAPI] Applied default template:', firstStyle.id);
        }
        return null;
      });

      // Wait for all promises - but they update state progressively as they complete
      // The critical reelInfo must succeed, but segments and styleSkin can fail gracefully
      try {
        // Wait for critical reel info first
        await reelInfoPromise;
        
        // Wait for segments and style skin in parallel (non-blocking if they fail)
        await Promise.allSettled([segmentsPromise, styleSkinPromise]);
        
        // Final update to ensure segments are in reel data (if reel exists and segments loaded)
        if (resolvedData.reel && resolvedData.segments.length > 0) {
          setCurrentReel({ ...resolvedData.reel, segments: resolvedData.segments });
        }
        
        return resolvedData;
    } catch (error) {
      // Reel info failed - return empty data with defaults
      const firstStyle = allSubtitleStyles[0];
      const defaultConfig = firstStyle ? getSubtitleStyleConfig(firstStyle.id) : undefined;
      return {
        reel: null,
        segments: [],
        styleId: firstStyle?.id,
        config: defaultConfig,
      };
    }
  }, [t, toast]);

  // Save config to server
  const saveConfig = useCallback(async (options: SaveConfigOptions): Promise<boolean> => {
    const {
      reelId,
      selectedSubtitleStyleId,
      subtitleConfig,
      wordSubtitlePosition,
      titleText,
      titleDuration,
      showTitle,
      titleConfig,
      titlePosition,
    } = options;

    if (!reelId) {
      toast({
        title: t('common.toast.error'),
        description: t('editor.errors.noReelId'),
        variant: 'destructive',
      });
      return false;
    }

    try {
      const isBlankStyle = selectedSubtitleStyleId === 'blank';
      const styleData = subtitleStylesData as TemplateStyleData[];

      // Extract font info
      const subtitleFontFamily = (subtitleConfig?.word as Record<string, string>)?.['font-family'] || '';
      const subtitleFontInfo = extractFontInfo(subtitleFontFamily, styleData);

      const titleFontFamily = (titleConfig?.['title-text'] as Record<string, string>)?.['font-family'] || '';
      const titleFontInfo = extractFontInfo(titleFontFamily, styleData);

      // Build payload using utility
      const editorPayload = buildEditorPayload({
        subtitle: {
          styleId: selectedSubtitleStyleId,
          config: subtitleConfig,
          position: wordSubtitlePosition,
          fontInfo: subtitleFontInfo,
          isBlank: isBlankStyle,
        },
        title: {
          content: titleText || '',
          duration: titleDuration,
          visible: showTitle,
          styleId: selectedSubtitleStyleId,
          config: titleConfig,
          position: titlePosition,
          fontInfo: titleFontInfo,
        },
      });

      // Transform to API expected format with nested subtitle and title
      const apiPayload = {
        subtitle: {
          style_skin_id: editorPayload.subtitle.style_skin_id,
          font_id: editorPayload.subtitle.font_id,
          font_name: editorPayload.subtitle.font_name,
          theme_name: editorPayload.subtitle.theme_name,
          skin: editorPayload.subtitle.skin as Record<string, unknown>,
        },
        title: {
          content: editorPayload.title.content,
          duration: editorPayload.title.duration,
          visible: editorPayload.title.visible,
          style_skin_id: editorPayload.title.style_skin_id,
          font_id: editorPayload.title.font_id,
          font_name: editorPayload.title.font_name,
          skin: editorPayload.title.skin as Record<string, unknown>,
        },
      };

      logger.log('[useEditorAPI] Saving config:', JSON.stringify(apiPayload, null, 2));

      const response = await apiService.saveStyleSkin(reelId, apiPayload);

      if (response?.data && currentReel) {
        const updatedReel = await apiService.getReel(reelId);
        setCurrentReel(updatedReel);
      }

      toast({
        title: t('editor.configSaved'),
        description: t('editor.configSavedDescription'),
      });

      return true;
    } catch (error) {
      logger.error('[useEditorAPI] Failed to save config:', error);
      toast({
        title: t('common.toast.error'),
        description: error instanceof Error ? error.message : t('editor.errors.saveFailed'),
        variant: 'destructive',
      });
      return false;
    }
  }, [t, toast, currentReel]);

  // Export video - using the shared hook
  const exportVideo = useCallback(async (reelId: string, styleSkinId?: number) => {
    await exportVideoWithToast(reelId, styleSkinId ?? 1);
  }, [exportVideoWithToast]);

  return {
    isLoadingReel,
    currentReel,
    loadReelData,
    saveConfig,
    exportVideo,
    isExporting,
    setCurrentReel,
  };
}
