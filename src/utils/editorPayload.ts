/**
 * Editor Payload Builder Utilities
 * 
 * Builds structured payloads for saving subtitle and title configurations to the API.
 * Follows consistent structure for both subtitle and title data.
 */

import { SubtitleConfig, TitleConfig, CSSProperties } from '@/types/subtitle';

// ============================================================================
// Types
// ============================================================================

export interface FontInfo {
  font_id: string;
  font_name: string;
}

export interface Position {
  x: number;
  y: number;
  centered: boolean;
}

export interface SubtitlePayload {
  style_skin_id: string;
  font_id: string;
  font_name: string;
  theme_name: string;
  skin: Record<string, Record<string, string>>;
}

export interface TitlePayload {
  content: string;
  duration: number;
  visible: boolean;
  style_skin_id: string;
  font_id: string;
  font_name: string;
  skin: Record<string, Record<string, string>>;
}

export interface EditorPayload {
  subtitle: SubtitlePayload;
  title: TitlePayload;
}

// ============================================================================
// Position Helpers
// ============================================================================

/**
 * Calculates CSS transform based on centered flag
 */
export const getTransform = (centered: boolean): string => {
  return centered ? 'translateX(-50%)' : 'none';
};

/**
 * Builds position CSS properties from position object
 */
export const buildPositionStyles = (position: Position): Record<string, string> => ({
  position: 'absolute',
  left: `${position.x}%`,
  top: `${position.y}%`,
  transform: getTransform(position.centered),
});

// ============================================================================
// Font Helpers
// ============================================================================

/**
 * Extracts font info from font-family string
 */
export const extractFontInfo = (
  fontFamily: string,
  styleData?: Array<{ fontId?: string; config?: { word?: { 'font-family'?: string } } }>
): FontInfo => {
  if (!fontFamily) {
    return { font_id: 'default', font_name: 'Arial' };
  }

  // Try to find matching style from data
  if (styleData) {
    const matchedStyle = styleData.find(s => {
      const styleFontFamily = s.config?.word?.['font-family'] || '';
      const fontId = s.fontId || '';
      return (
        (fontId && fontFamily.toLowerCase().includes(fontId.toLowerCase())) ||
        styleFontFamily.toLowerCase() === fontFamily.toLowerCase()
      );
    });

    if (matchedStyle) {
      const styleFontFamily = matchedStyle.config?.word?.['font-family'] || '';
      const fontName = styleFontFamily.replace(/['"]/g, '').split(',')[0].trim();
      return {
        font_id: matchedStyle.fontId || fontName.toLowerCase().replace(/\s+/g, '') || 'default',
        font_name: fontName || 'Arial',
      };
    }
  }

  // Fallback: extract from font-family string
  const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
  return {
    font_id: fontName.toLowerCase().replace(/\s+/g, ''),
    font_name: fontName || 'Arial',
  };
};

// ============================================================================
// Subtitle Payload Builder
// ============================================================================

export interface SubtitlePayloadOptions {
  styleId: string;
  config: SubtitleConfig;
  position: Position;
  fontInfo: FontInfo;
  isBlank?: boolean;
}

/**
 * Builds subtitle payload for API
 */
export const buildSubtitlePayload = ({
  styleId,
  config,
  position,
  fontInfo,
  isBlank = false,
}: SubtitlePayloadOptions): SubtitlePayload => {
  if (isBlank) {
    return {
      style_skin_id: styleId,
      font_id: '',
      font_name: '',
      theme_name: '',
      skin: {},
    };
  }

  const containerStyles = (config?.['subtitle-container'] as CSSProperties) || {};
  const wordStyles = (config?.['word'] as CSSProperties) || {};
  const highlightStyles = (config?.['word-being-narrated'] as CSSProperties) || {};

  return {
    style_skin_id: styleId,
    font_id: fontInfo.font_id,
    font_name: fontInfo.font_name,
    theme_name: styleId,
    skin: {
      'subtitle-container': {
        ...containerStyles,
        display: containerStyles.display || 'inline-block',
        'box-sizing': containerStyles['box-sizing'] || 'border-box',
        width: containerStyles.width || 'fit-content',
        ...buildPositionStyles(position),
      },
      'word': {
        ...wordStyles,
        display: wordStyles.display || 'inline',
        'white-space': wordStyles['white-space'] || 'nowrap',
      },
      'word-being-narrated': {
        ...highlightStyles,
      },
    },
  };
};

// ============================================================================
// Title Payload Builder
// ============================================================================

export interface TitlePayloadOptions {
  content: string;
  duration: number;
  visible: boolean;
  styleId: string;
  config: TitleConfig;
  position: Position;
  fontInfo: FontInfo;
}

/**
 * Builds title payload for API
 */
export const buildTitlePayload = ({
  content,
  duration,
  visible,
  styleId,
  config,
  position,
  fontInfo,
}: TitlePayloadOptions): TitlePayload => {
  const containerStyles = (config?.['title-container'] as CSSProperties) || {};
  const textStyles = (config?.['title-text'] as CSSProperties) || {};

  return {
    content,
    duration,
    visible,
    style_skin_id: styleId,
    font_id: fontInfo.font_id,
    font_name: fontInfo.font_name,
    skin: {
      'title-container': {
        ...containerStyles,
        ...buildPositionStyles(position),
      },
      'title-text': {
        ...textStyles,
      },
    },
  };
};

// ============================================================================
// Combined Payload Builder
// ============================================================================

export interface EditorPayloadOptions {
  subtitle: SubtitlePayloadOptions;
  title: TitlePayloadOptions;
}

/**
 * Builds complete editor payload for API
 */
export const buildEditorPayload = ({
  subtitle,
  title,
}: EditorPayloadOptions): EditorPayload => ({
  subtitle: buildSubtitlePayload(subtitle),
  title: buildTitlePayload(title),
});

