// Subtitle types matching backend format

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words: SubtitleWord[];
}

export interface SubtitleData {
  text: string;
  segments: SubtitleSegment[];
}

// CSS properties as key-value pairs
export interface CSSProperties {
  [cssProperty: string]: string;
}

// Title configuration (simpler than subtitle - no word highlighting)
export interface TitleConfig {
  // Position as percentage coordinates (CSS-compatible: left: x%, top: y%)
  position?: TitlePosition | 'top' | 'center' | 'bottom';
  // Container styles
  "title-container"?: CSSProperties;
  // Text styles (no highlighting)
  "title-text"?: CSSProperties;
  // Allow any other class names
  [className: string]: CSSProperties | TitlePosition | 'top' | 'center' | 'bottom' | undefined;
}

// Title position type (same as subtitle)
export interface TitlePosition {
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  centered?: boolean; // If true, use translateX(-50%) for center-based horizontal positioning
}

// Position type for subtitle placement (percentage-based for CSS compatibility)
export interface SubtitlePosition {
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  centered?: boolean; // If true, use translateX(-50%) for center-based horizontal positioning
                      // If false/undefined after drag, use left-edge positioning (no transform)
}

// Flat config - class names are directly under config
// Example:
// {
//   "position": { "x": 50, "y": 80 },
//   "subtitle-container": { "background": "...", "padding": "..." },
//   "word": { "color": "...", "font-size": "..." },
//   "word-being-narrated": { "color": "...", "font-weight": "..." }
// }
export interface SubtitleConfig {
  // Position as percentage coordinates (CSS-compatible: left: x%, top: y%)
  position?: SubtitlePosition | 'top' | 'center' | 'bottom';
  // Class styles directly on config
  "subtitle-container"?: CSSProperties;
  "word"?: CSSProperties;
  "word-being-narrated"?: CSSProperties;
  // Additional optional classes
  "line"?: CSSProperties;
  "wrapper"?: CSSProperties;
  // Allow any other class names
  [className: string]: CSSProperties | SubtitlePosition | 'top' | 'center' | 'bottom' | undefined;
}

export const DEFAULT_SUBTITLE_CONFIG: SubtitleConfig = {
  position: { x: 50, y: 80 }, // Centered horizontally, 80% from top (bottom area)
  "subtitle-container": {
    "background": "transparent",
    "padding": "0px",
    "border-radius": "0px",
    "min-width": "200px",
    "max-width": "90%",
    "text-align": "center"
  },
  "word": {
    "color": "#ffffff",
    "font-size": "16px",
    "font-family": "Arial, sans-serif",
    "line-height": "1.4",
    "margin": "0 2px",
    "opacity": "0.6"
  },
  "word-being-narrated": {
    "color": "#fbbf24",
    "font-weight": "bold",
    "opacity": "1"
  }
};

// Default title config - positioned at top, larger font size, no highlighting
// Uses stroke and shadow for visibility (no background)
export const DEFAULT_TITLE_CONFIG: TitleConfig = {
  position: { x: 50, y: 15, centered: true }, // Centered horizontally, 15% from top
  "title-container": {
    "background": "transparent",
    "padding": "16px 32px",
    "border-radius": "0px",
    "width": "90%",
    "max-width": "90%",
    "text-align": "center"
  },
  "title-text": {
    "color": "#ffffff",
    "font-size": "70px",
    "font-family": "'Arial Black', sans-serif",
    "font-weight": "900",
    "line-height": "1.1",
    "-webkit-text-stroke": "4px #000000",
    "text-shadow": "4px 4px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000"
  }
};
