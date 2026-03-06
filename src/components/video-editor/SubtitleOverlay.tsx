import React, { useEffect, useMemo } from 'react';
import { SubtitleSegment, SubtitleConfig, CSSProperties, SubtitlePosition } from '@/types/subtitle';
import { getStyleByStyleId } from '@/data/subtitleTemplates';
import { useFonts } from '@/hooks/useFonts';

interface SubtitleOverlayProps {
  currentTime: number;
  segments: SubtitleSegment[];
  config?: Partial<SubtitleConfig>;
  videoWidth?: number;
  videoHeight?: number;
  styleId?: string;
  onClick?: () => void;
  // Drag support props
  selected?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  position?: SubtitlePosition; // Override position for dragging
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  currentTime,
  segments,
  config: customConfig,
  videoWidth = 1920,
  videoHeight = 1080,
  styleId,
  onClick,
  selected = false,
  isDragging = false,
  onDragStart,
  position: overridePosition,
}) => {
  // Use only API-provided config, no defaults
  const config: SubtitleConfig = useMemo(() => {
    if (!customConfig || Object.keys(customConfig).length === 0) {
      console.log('[SubtitleOverlay] No custom config provided or empty config');
      // Return empty config but still allow rendering if segments exist
      return {} as SubtitleConfig;
    }
    
    // Use config as-is from API
    console.log('[SubtitleOverlay] Using config:', customConfig, 'Keys:', Object.keys(customConfig));
    return customConfig as SubtitleConfig;
  }, [customConfig]);

  // Load fonts hook
  const { loadFontById } = useFonts();

  const fontUrl = useMemo(() => {
    if (!styleId) return undefined;
    const style = getStyleByStyleId(styleId);
    return style?.fontUrl;
  }, [styleId]);

  // Get fontId from style for local font loading
  const fontId = useMemo(() => {
    if (!styleId) return undefined;
    const style = getStyleByStyleId(styleId);
    return style?.fontId;
  }, [styleId]);

  // Load local font when style changes (for fonts from local TTF files)
  useEffect(() => {
    if (!fontId) return;
    loadFontById(fontId).catch((err) => {
      console.warn(`[SubtitleOverlay] Failed to load font ${fontId}:`, err);
    });
  }, [fontId, loadFontById]);

  // Inject Google font link when a style with fontUrl is selected (fallback for Google Fonts)
  useEffect(() => {
    if (!styleId || !fontUrl) return;
    const existing = document.querySelector<HTMLLinkElement>(`link[data-subtitle-font-id="${styleId}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.setAttribute('data-subtitle-font-id', styleId);
    document.head.appendChild(link);
  }, [styleId, fontUrl]);

  // Find current segment based on time
  const currentSegment = useMemo(() => {
    return segments.find(
      (segment) => currentTime >= segment.start && currentTime < segment.end
    );
  }, [segments, currentTime]);

  // Note: Font scaling is now handled by the parent container's CSS transform scale.
  // All pixel values in styles are designed for 1080x1920 base resolution.
  // The parent VideoPlayer scales the overlay container to fit the actual viewport.

  // Generate position CSS - supports both legacy string positions and new percentage-based
  // 
  // Positioning modes:
  // - centered=true (default): use translateX(-50%), x is where CENTER of element is placed
  // - centered=false (after drag): no transform, x is where LEFT EDGE of element is placed
  // - y always refers to TOP EDGE position
  const positionCss = useMemo(() => {
    // Use override position if provided (for dragging), otherwise use config position
    const pos = overridePosition || config.position;
    
    // If no position provided, don't render (API should provide position)
    if (!pos) {
      return {};
    }
    
    // Handle legacy string positions
    if (typeof pos === 'string') {
      if (pos === 'top') {
        return {
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      } else if (pos === 'center') {
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      } else {
        // Bottom position
        return {
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      }
    }
    
    // Check if centered mode (default) or left-edge mode (after user drags)
    const isCentered = pos.centered !== false; // Default to true if undefined
    
    if (isCentered) {
      // Centered: use translateX(-50%), x is where CENTER of element is placed
      return {
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        transform: 'translateX(-50%)',
      };
    } else {
      // Left-edge: no transform, x is where LEFT EDGE of element is placed
      return {
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        transform: 'none',
      };
    }
  }, [config.position, overridePosition]);

  // Generate CSS from flat config (class names directly on config)
  // Note: No scaling is applied here - pixel values are used as-is.
  // Scaling is handled by the parent container's CSS transform.
  // 
  // IMPORTANT: Backend uses `.word.highlighted` for highlighted words,
  // so we generate CSS for both `.word-being-narrated` AND `.word.highlighted`
  // to ensure compatibility.
  const generateCssFromConfig = useMemo(() => {
    let css = '';
    
    console.log('[SubtitleOverlay] Generating CSS from config:', config);
    
    // Iterate over config keys (excluding 'position')
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'position' || !value || typeof value !== 'object') {
        console.log(`[SubtitleOverlay] Skipping key "${key}":`, value);
        return;
      }
      
      const styles = value as CSSProperties;
      const declarations = Object.entries(styles)
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ');
      
      console.log(`[SubtitleOverlay] Generating CSS for "${key}":`, declarations);
      css += `.subtitle-overlay-root .${key} { ${declarations}; }\n`;
      
      // Also generate backend-compatible class for highlighted words
      if (key === 'word-being-narrated') {
        css += `.subtitle-overlay-root .word.highlighted { ${declarations}; }\n`;
      }
    });
    
    console.log('[SubtitleOverlay] Generated CSS:', css);
    return css;
  }, [config]);

  // Don't render anything if blank style is selected or no current segment
  console.log('[SubtitleOverlay] Render check:', {
    styleId,
    currentSegment: currentSegment ? { start: currentSegment.start, end: currentSegment.end, text: currentSegment.text?.substring(0, 50) } : null,
    segmentsCount: segments.length,
    configKeys: Object.keys(config),
    currentTime
  });
  
  // Only skip if explicitly 'blank', not if styleId is undefined
  if (styleId === 'blank') {
    console.log('[SubtitleOverlay] Not rendering - styleId is blank');
    return null;
  }
  
  if (!currentSegment) {
    console.log('[SubtitleOverlay] Not rendering - no current segment for currentTime:', currentTime);
    return null;
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="subtitle-overlay-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Root doesn't capture clicks
        zIndex: 10,
      }}
    >
      <style>
        {`
          .subtitle-overlay-root {
            margin: 0;
            padding: 0;
            background: transparent !important;
            overflow: hidden !important;
            clip-path: inset(0);
            contain: layout;
          }
          .subtitle-overlay-root .wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent !important;
            position: relative;
            overflow: hidden !important;
            clip-path: inset(0);
          }
          .subtitle-overlay-root .subtitle-container {
            position: absolute;
            display: inline-block;
            box-sizing: border-box;
            width: fit-content;
            max-width: 95%;
            min-width: 0;
            overflow: hidden;
            cursor: ${onDragStart ? 'move' : onClick ? 'pointer' : 'default'};
            pointer-events: ${onClick || onDragStart ? 'auto' : 'none'};
            user-select: none;
            word-wrap: break-word;
            overflow-wrap: break-word;
            left: clamp(0%, var(--subtitle-left, 50%), 100%);
            right: clamp(0%, var(--subtitle-right, auto), 100%);
          }
          .subtitle-overlay-root .subtitle-container:hover {
            ${onClick || onDragStart ? 'outline: 2px solid rgba(59, 130, 246, 0.5); outline-offset: 4px;' : ''}
          }
          .subtitle-overlay-root .subtitle-container.selected {
            outline: 2px solid #3b82f6;
            outline-offset: 4px;
          }
          .subtitle-overlay-root .subtitle-container.dragging {
            opacity: 0.8;
            cursor: grabbing;
          }
          .subtitle-overlay-root .line {
            background: transparent;
            padding: 0;
            margin: 0;
            border-radius: 0;
            display: block;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            white-space: normal !important;      /* allow wrapping */
            word-break: normal !important;       /* do not break inside words */
            overflow-wrap: normal !important;    /* wrap only at spaces */
            word-wrap: normal !important;
            box-sizing: border-box;
            /* structural clipping */
            overflow: hidden !important;
            clip-path: inset(0) !important;
            -webkit-clip-path: inset(0) !important;
            contain: layout;
          }
          .subtitle-overlay-root .word {
            display: inline;
            white-space: normal !important;     /* allow wrapping to next line */
            word-break: normal !important;      /* do not break inside words */
            overflow-wrap: normal !important;   /* wrap only at spaces */
            word-wrap: normal !important;
            transition: color 0.1s ease, opacity 0.1s ease, font-weight 0.1s ease;
          }
          ${generateCssFromConfig}
          /* Ensure wrapping even after server CSS */
          .subtitle-overlay-root .line {
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            word-wrap: normal !important;
          }
          .subtitle-overlay-root .word {
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            word-wrap: normal !important;
          }
        `}
      </style>
      <div className={`wrapper ${styleId || ''}`}>
        <div
          className={`subtitle-container ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
          style={positionCss}
          onClick={handleContainerClick}
          onMouseDown={handleMouseDown}
        >
          <div className="line">
            {currentSegment.words.map((wordObj, index) => {
              const isHighlighted = 
                currentTime >= wordObj.start && currentTime < wordObj.end;
              
              // Use both class names for compatibility:
              // - 'highlighted' matches backend's .word.highlighted
              // - 'word-being-narrated' matches our CSS files
              return (
                <React.Fragment key={index}>
                  <span
                    className={`word ${isHighlighted ? 'highlighted word-being-narrated' : ''}`}
                  >
                    {wordObj.word}
                  </span>
                  {/* Insert a real space so words can wrap between words (not mid-word) */}
                  {index < currentSegment.words.length - 1 ? ' ' : ''}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleOverlay;
