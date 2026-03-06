import { useState, useEffect } from 'react';
import fontsData from '@/data/fonts.json';
import subtitleStyles from '@/data/subtitleStyles.json';
import apiService from '@/services/api';
import { FontData } from '@/types';
import { logger } from '@/utils/logger';

// Re-export FontData as Font for backwards compatibility
export type Font = FontData;

// API font structure from backend
interface ApiFontData {
  font_id: string;
  font_name: string;
}

// Subtitle style interface for template fonts
interface SubtitleStyle {
  id: string;
  name: string;
  fontId: string;
  fontFileName: string;
  config: Record<string, unknown>;
}

interface UseFontsReturn {
  fonts: Font[];
  loading: boolean;
  error: string | null;
  loadFont: (font: Font) => Promise<void>;
  loadFontById: (fontId: string) => Promise<void>;
  loadTemplateFonts: () => Promise<void>;
  loadApiFonts: () => Promise<void>;
  refetch: () => Promise<void>;
}

// Track which fonts have been loaded
const loadedFonts = new Set<string>();

// Font files base path (public folder for production builds)
const FONTS_PATH = '/fonts';

// Load a font from local TTF file using @font-face
const loadLocalFont = (fontId: string, fontName: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (loadedFonts.has(fontId)) {
      resolve();
      return;
    }

    // Check if the font style already exists
    const existingStyle = document.querySelector(`style[data-font-id="${fontId}"]`);
    if (existingStyle) {
      loadedFonts.add(fontId);
      resolve();
      return;
    }

    try {
      // Build the font file path
      const fontFileUrl = `${FONTS_PATH}/${fileName}`;

      // Create @font-face rule
      const style = document.createElement('style');
      style.setAttribute('data-font-id', fontId);
      style.textContent = `
        @font-face {
          font-family: '${fontName}';
          src: url('${fontFileUrl}') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: '${fontName}';
          src: url('${fontFileUrl}') format('truetype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
      `;
      document.head.appendChild(style);

      // Use FontFace API to detect when font is loaded
      const fontFace = new FontFace(fontName, `url(${fontFileUrl})`);
      fontFace.load().then(() => {
        document.fonts.add(fontFace);
        loadedFonts.add(fontId);
        logger.log(`[useFonts] Loaded local font: ${fontName} (${fileName})`);
        resolve();
      }).catch((err) => {
        // Font might still work even if FontFace API fails
        loadedFonts.add(fontId);
        logger.warn(`[useFonts] FontFace API failed for ${fontName}, but CSS might still work:`, err);
        resolve();
      });
    } catch (err) {
      logger.error(`[useFonts] Error loading local font ${fontName}:`, err);
      reject(err);
    }
  });
};

export const useFonts = (): UseFontsReturn => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFontsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to remove spaces from font name for file path
  const getFontFileName = (fontName: string): string => {
    return fontName.replace(/\s+/g, '');
  };

  // Transform API font to our Font structure
  const transformApiFont = (apiFont: ApiFontData): Font => {
    const fileNameWithoutSpaces = getFontFileName(apiFont.font_name);
    return {
      id: apiFont.font_id,
      name: apiFont.font_name,
      family: `'${apiFont.font_name}', sans-serif`,
      category: 'display' as const,
      source: 'custom' as const,
      fontFileUrl: `${FONTS_PATH}/${fileNameWithoutSpaces}.ttf`,
    };
  };

  const loadFontsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch fonts from backend API
      try {
        logger.log('[useFonts] Fetching fonts from API...');
        const response = await apiService.getFonts();
        
        // Handle API response with font_id and font_name structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiFonts = (response as any)?.fonts as ApiFontData[] | undefined;
        
        if (apiFonts && apiFonts.length > 0) {
          logger.log(`[useFonts] Loaded ${apiFonts.length} fonts from API`);
          
          // Transform API fonts to our Font structure
          const transformedFonts = apiFonts.map(transformApiFont);
          
          // Only use API fonts (no local fonts.json merge)
          setFonts(transformedFonts);
          
          // Auto-load all API fonts from local files
          transformedFonts.forEach(font => {
            // Remove spaces from font name for file path
            const fileName = `${getFontFileName(font.name)}.ttf`;
            loadLocalFont(font.id, font.name, fileName).catch(err => {
              logger.warn(`[useFonts] Failed to auto-load font ${font.name}:`, err);
            });
          });
          
          return;
        }
      } catch (apiError) {
        logger.warn('[useFonts] API fetch failed, falling back to local fonts:', apiError);
      }
      
      // Fallback to local JSON file (only if API fails)
      logger.log('[useFonts] Using local fonts.json as fallback');
      const localFonts = fontsData.fonts as Font[];
      setFonts(localFonts);
      
    } catch (err) {
      logger.error('[useFonts] Error loading fonts:', err);
      setError('Failed to load fonts');
      
      // Last resort: use local fonts even on error
      try {
        const localFonts = fontsData.fonts as Font[];
        setFonts(localFonts);
      } catch {
        setFonts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFont = async (font: Font): Promise<void> => {
    // System fonts don't need to be loaded
    if (font.source === 'system') {
      return Promise.resolve();
    }

    // Check if font is already loaded
    if (loadedFonts.has(font.id)) {
      return Promise.resolve();
    }

    // Google fonts - load via stylesheet link
    if (font.googleFont && font.url) {
      return new Promise((resolve, reject) => {
        try {
          const existingLink = document.querySelector(`link[data-font-id="${font.id}"]`);
          if (existingLink) {
            loadedFonts.add(font.id);
            resolve();
            return;
          }

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = font.url;
          link.setAttribute('data-font-id', font.id);
          
          link.onload = () => {
            loadedFonts.add(font.id);
            logger.log(`[useFonts] Loaded Google Font: ${font.name}`);
            resolve();
          };
          
          link.onerror = () => {
            logger.error(`[useFonts] Failed to load Google Font: ${font.name}`);
            reject(new Error(`Failed to load font: ${font.name}`));
          };

          document.head.appendChild(link);
        } catch (err) {
          logger.error(`[useFonts] Error loading font ${font.name}:`, err);
          reject(err);
        }
      });
    }

    // Custom/local fonts - load via @font-face from local files
    if (font.source === 'custom' || font.fontFileUrl) {
      // Remove spaces from font name for file path
      const fileName = `${getFontFileName(font.name)}.ttf`;
      return loadLocalFont(font.id, font.name, fileName);
    }

    return Promise.resolve();
  };

  // Load a font by its fontId
  const loadFontById = async (fontId: string): Promise<void> => {
    // First, try to find in the fonts list
    const font = fonts.find(f => f.id === fontId);
    if (font) {
      return loadFont(font);
    }

    // If not found in fonts list, try to find in subtitle styles (template fonts)
    const style = (subtitleStyles as SubtitleStyle[]).find(s => s.fontId === fontId);
    if (style && style.fontFileName) {
      // Extract font name from font-family in config
      const fontFamily = (style.config?.word as Record<string, string>)?.['font-family'] || '';
      const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      return loadLocalFont(fontId, fontName, style.fontFileName);
    }

    logger.warn(`[useFonts] Font not found: ${fontId}`);
    return Promise.resolve();
  };

  // Load all template fonts from subtitleStyles.json (local TTF files)
  const loadTemplateFonts = async (): Promise<void> => {
    logger.log('[useFonts] Loading all template fonts from local files...');
    const styles = subtitleStyles as SubtitleStyle[];
    
    const loadPromises = styles.map(style => {
      if (style.fontFileName && style.fontId) {
        // Extract font name from font-family in config
        const fontFamily = (style.config?.word as Record<string, string>)?.['font-family'] || '';
        const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
        
        return loadLocalFont(style.fontId, fontName, style.fontFileName).catch(err => {
          logger.warn(`[useFonts] Failed to load template font ${style.fontId}:`, err);
        });
      }
      return Promise.resolve();
    });

    await Promise.all(loadPromises);
    logger.log('[useFonts] All template fonts loaded');
  };

  // Load all fonts from API (local TTF files)
  const loadApiFonts = async (): Promise<void> => {
    logger.log('[useFonts] Loading all API fonts from local files...');
    
    const apiFonts = fonts.filter(f => f.source === 'custom');
    
    const loadPromises = apiFonts.map(font => {
      // Remove spaces from font name for file path
      const fileName = `${getFontFileName(font.name)}.ttf`;
      return loadLocalFont(font.id, font.name, fileName).catch(err => {
        logger.warn(`[useFonts] Failed to load API font ${font.name}:`, err);
      });
    });

    await Promise.all(loadPromises);
    logger.log('[useFonts] All API fonts loaded');
  };

  // Manual refetch function
  const refetch = async () => {
    await loadFontsData();
  };

  return {
    fonts,
    loading,
    error,
    loadFont,
    loadFontById,
    loadTemplateFonts,
    loadApiFonts,
    refetch,
  };
};

export default useFonts;
