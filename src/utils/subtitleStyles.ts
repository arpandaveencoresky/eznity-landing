// Utility functions for managing dynamic CSS injection for subtitle styles

const injectedStyles = new Map<string, HTMLStyleElement>();

// Import CSS files as raw text
import style1Css from '@/styles/subtitles/style1.css?raw';
import style2Css from '@/styles/subtitles/style2.css?raw';
import style3Css from '@/styles/subtitles/style3.css?raw';
import style4Css from '@/styles/subtitles/style4.css?raw';
import style5Css from '@/styles/subtitles/style5.css?raw';
import style6Css from '@/styles/subtitles/style6.css?raw';
import style7Css from '@/styles/subtitles/style7.css?raw';
import style8Css from '@/styles/subtitles/style8.css?raw';
import style9Css from '@/styles/subtitles/style9.css?raw';
import style10Css from '@/styles/subtitles/style10.css?raw';

// Map style IDs to CSS file content
const cssFileMap: Record<string, string> = {
  'style-1': style1Css,
  'style-2': style2Css,
  'style-3': style3Css,
  'style-4': style4Css,
  'style-5': style5Css,
  'style-6': style6Css,
  'style-7': style7Css,
  'style-8': style8Css,
  'style-9': style9Css,
  'style-10': style10Css,
};

/**
 * Gets CSS from file for a given style ID
 * @param styleId - Unique identifier for the style
 * @returns CSS string from file, or undefined if not found
 */
const getCssFromFile = (styleId: string): string | undefined => {
  return cssFileMap[styleId];
};

/**
 * Injects CSS styles into the document head, scoped by style ID
 * @param styleId - Unique identifier for the style
 * @param css - CSS string to inject (generic, will be scoped by ID)
 */
export const injectSubtitleStyle = (styleId: string, css: string): void => {
  // Remove existing style if present
  removeSubtitleStyle(styleId);

  console.log(`[SubtitleStyles] Injecting style: ${styleId}`);
  console.log(`[SubtitleStyles] Original CSS length: ${css.length} characters`);

  // Scope the CSS by wrapping it with the style ID class
  // Replace generic selectors with scoped ones (pycaps compatible classes)
  // Order matters: replace more specific selectors first
  const scopedCss = css
    .replace(/\.line-being-narrated/g, `.${styleId} .line-being-narrated`)
    .replace(/\.word-being-narrated/g, `.${styleId} .word-being-narrated`)
    .replace(/\.line(?!-)/g, `.${styleId} .line`)
    .replace(/\.word(?!-)/g, `.${styleId} .word`);

  console.log(`[SubtitleStyles] Scoped CSS preview (first 500 chars):`, scopedCss.substring(0, 500));

  // Create style element
  const styleElement = document.createElement('style');
  styleElement.id = `subtitle-style-${styleId}`;
  styleElement.textContent = scopedCss;

  // Inject into document head
  document.head.appendChild(styleElement);

  // Store reference for cleanup
  injectedStyles.set(styleId, styleElement);

  console.log(`[SubtitleStyles] Style element injected with id: subtitle-style-${styleId}`);
};

/**
 * Removes injected CSS style from the document
 * @param styleId - Unique identifier for the style
 */
export const removeSubtitleStyle = (styleId: string): void => {
  const existingStyle = injectedStyles.get(styleId);
  if (existingStyle && existingStyle.parentNode) {
    existingStyle.parentNode.removeChild(existingStyle);
    injectedStyles.delete(styleId);
  } else {
    // Fallback: try to find and remove by ID
    const styleElement = document.getElementById(`subtitle-style-${styleId}`);
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }
};

/**
 * Injects all subtitle styles from CSS files
 * Uses CSS files first, falls back to JSON CSS if file not found
 * @param styles - Array of subtitle styles with IDs
 */
export const injectAllSubtitleStyles = (styles: Array<{ id: string; css?: string }>): void => {
  styles.forEach((style) => {
    // Try to load from CSS file first
    const cssFromFile = getCssFromFile(style.id);
    if (cssFromFile) {
      injectSubtitleStyle(style.id, cssFromFile);
    } else if (style.css) {
      // Fallback to JSON CSS if file not found (CSS kept in JSON as requested)
      injectSubtitleStyle(style.id, style.css);
    }
  });
};

/**
 * Cleans up all injected subtitle styles
 */
export const cleanupAllSubtitleStyles = (): void => {
  injectedStyles.forEach((styleElement, styleId) => {
    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  });
  injectedStyles.clear();
};
