/**
 * Editor Default Values
 * 
 * Centralized constants for default text styling, positions, and sizes.
 */

export interface TextShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface TextStrokeConfig {
  enabled: boolean;
  color: string;
  width: number;
}

export interface TextStyles {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow: TextShadowConfig;
  textStroke: TextStrokeConfig;
  textAlign: string;
  borderRadius: number;
}

export interface Position {
  x: number;
  y: number;
  centered: boolean;
}

export interface Size {
  width: number;
  height: number;
}

// Default headline styles
export const DEFAULT_HEADLINE_STYLES: TextStyles = {
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 100,
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontStyle: 'normal',
  textDecoration: 'none',
  textTransform: 'none',
  textShadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  textStroke: { enabled: false, color: '#000000', width: 1 },
  textAlign: 'center',
  borderRadius: 0,
};

// Default subtitle styles
export const DEFAULT_SUBTITLE_STYLES: TextStyles = {
  textColor: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 100,
  fontSize: 14,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textTransform: 'none',
  textShadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  textStroke: { enabled: false, color: '#000000', width: 1 },
  textAlign: 'center',
  borderRadius: 0,
};

// Default positions
export const DEFAULT_HEADLINE_POSITION: Position = { x: 50, y: 20, centered: true };
export const DEFAULT_SUBTITLE_POSITION: Position = { x: 50, y: 80, centered: true };
export const DEFAULT_WORD_SUBTITLE_POSITION: Position = { x: 50, y: 80, centered: true };
export const DEFAULT_TITLE_POSITION: Position = { x: 50, y: 15, centered: true };

// Default sizes
export const DEFAULT_HEADLINE_SIZE: Size = { width: 200, height: 40 };
export const DEFAULT_SUBTITLE_SIZE: Size = { width: 200, height: 40 };

// Default background
export const DEFAULT_BACKGROUND = 'linear-gradient(to bottom right, #1f2937, #000000)';

// Title duration (in seconds)
export const DEFAULT_TITLE_DURATION = 5;

// Editor panel types
export type EditorPanel = 'subtitles' | 'text' | 'templates' | 'background';

// Clone helper for creating fresh copies of default styles
export const cloneTextStyles = (styles: TextStyles): TextStyles => ({
  ...styles,
  textShadow: { ...styles.textShadow },
  textStroke: { ...styles.textStroke },
});

