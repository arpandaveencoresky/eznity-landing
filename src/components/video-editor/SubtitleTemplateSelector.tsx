// Subtitle Template Selector Component
// Grid-based style selector with horizontal slider
// Uses class-based CSS from JSON data structure

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { allSubtitleStyles, getStyleByStyleId, mergeSubtitleConfig, BLANK_STYLE_CONFIG } from '@/data/subtitleTemplates';
import { Check, Ban } from 'lucide-react';
import { SubtitleConfig } from '@/types/subtitle';
import { useFonts } from '@/hooks/useFonts';

// Component to render text with proper -webkit-text-stroke support
const TemplatePreviewText = ({ 
  text, 
  styles, 
  webkitTextStroke,
  originalFontSize,
  fontSize, 
  transform, 
  whiteSpace 
}: { 
  text: string; 
  styles: React.CSSProperties; 
  webkitTextStroke?: string;
  originalFontSize?: string;
  fontSize?: string; 
  transform?: string; 
  whiteSpace?: string;
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current && webkitTextStroke && webkitTextStroke !== 'none') {
      // Parse stroke value (e.g., "4px #000000" or "2px rgba(255,255,255,0.5)")
      const strokeMatch = webkitTextStroke.match(/^(\d+(?:\.\d+)?)px\s+(.+)$/);
      
      if (strokeMatch && originalFontSize && fontSize) {
        // Extract stroke width and color
        const originalStrokeWidth = parseFloat(strokeMatch[1]);
        const strokeColor = strokeMatch[2];
        
        // Parse original font size (e.g., "52px" -> 52)
        const originalSizeMatch = originalFontSize.match(/(\d+(?:\.\d+)?)/);
        const originalSize = originalSizeMatch ? parseFloat(originalSizeMatch[1]) : null;
        
        // Calculate scale factor
        // For clamp() values, we'll use a reasonable estimate or measure actual rendered size
        // Since we're using clamp(16px, 3vw, 20px) with scale(0.6), effective size is roughly 9.6-12px
        // But to be more accurate, let's use the transform scale if present
        let scaleFactor = 1;
        
        if (originalSize) {
          // Extract numeric value from fontSize (handle clamp() by taking min value as estimate)
          const fontSizeMatch = fontSize.match(/(\d+(?:\.\d+)?)/);
          const renderedSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 16;
          
          // Extract scale from transform if present (e.g., "scale(0.6)" -> 0.6)
          const transformMatch = transform?.match(/scale\(([\d.]+)\)/);
          const transformScale = transformMatch ? parseFloat(transformMatch[1]) : 1;
          
          // Calculate effective rendered size
          const effectiveRenderedSize = renderedSize * transformScale;
          
          // Scale factor is rendered size / original size
          scaleFactor = effectiveRenderedSize / originalSize;
        }
        
        // Scale the stroke width
        const scaledStrokeWidth = originalStrokeWidth * scaleFactor;
        const scaledStroke = `${scaledStrokeWidth}px ${strokeColor}`;
        
        textRef.current.style.setProperty('-webkit-text-stroke', scaledStroke);
      } else {
        // Fallback: use original stroke value if we can't parse it
        textRef.current.style.setProperty('-webkit-text-stroke', webkitTextStroke);
      }
    } else if (textRef.current && (!webkitTextStroke || webkitTextStroke === 'none')) {
      // Remove the property if it's set to none or undefined
      textRef.current.style.removeProperty('-webkit-text-stroke');
    }
  }, [webkitTextStroke, originalFontSize, fontSize, transform]);

  return (
    <div
      ref={textRef}
      style={{
        ...styles,
        fontSize,
        transform,
        whiteSpace,
      }}
    >
      {text}
    </div>
  );
};

interface SubtitleTemplateSelectorProps {
  selectedTemplateId?: string;
  selectedStyleId?: string;
  onTemplateChange?: (templateId: string, styleId: string, config: SubtitleConfig) => void;
  className?: string;
}

export const SubtitleTemplateSelector = ({
  selectedTemplateId,
  selectedStyleId,
  onTemplateChange,
  className = '',
}: SubtitleTemplateSelectorProps) => {
  const { t } = useTranslation();
  // Use prop value directly if provided, otherwise fallback to first style
  const [styleId, setStyleId] = useState<string>('');
  const currentStyle = styleId ? getStyleByStyleId(styleId) : null;
  const currentConfig = mergeSubtitleConfig(currentStyle?.config);
  
  // Load fonts for template previews
  const { loadTemplateFonts } = useFonts();
  
  // Load template fonts on mount for preview rendering
  useEffect(() => {
    loadTemplateFonts();
  }, [loadTemplateFonts]);

  const handleStyleSelect = (newStyleId: string) => {
    setStyleId(newStyleId);
    const style = getStyleByStyleId(newStyleId);
    const templateId = style?.category ? `template-${style.category}` : 'template-1';
    
    // For blank style, pass empty config object
    if (newStyleId === 'blank') {
      onTemplateChange?.(templateId, newStyleId, BLANK_STYLE_CONFIG as SubtitleConfig);
    } else {
      onTemplateChange?.(templateId, newStyleId, mergeSubtitleConfig(style?.config));
    }
  };

  // Sync internal state with prop - always update when prop changes
  useEffect(() => {
    if (selectedStyleId) {
      // Prop is provided, use it - ensure it matches a valid style ID
      const validStyle = getStyleByStyleId(selectedStyleId);
      if (validStyle) {
        console.log('[SubtitleTemplateSelector] Setting styleId from prop:', selectedStyleId);
        setStyleId(selectedStyleId);
      } else {
        console.warn('[SubtitleTemplateSelector] Invalid styleId from prop:', selectedStyleId, 'Available styles:', allSubtitleStyles.map(s => s.id));
        // Try to find a matching style by name or use default
        const matchingStyle = allSubtitleStyles.find(s => s.id === selectedStyleId || s.name.toLowerCase() === selectedStyleId.toLowerCase());
        if (matchingStyle) {
          setStyleId(matchingStyle.id);
        } else if (allSubtitleStyles.length > 0) {
          const defaultStyleId = allSubtitleStyles.find(s => s.id === 'default')?.id || allSubtitleStyles[0].id;
          setStyleId(defaultStyleId);
        }
      }
    } else if (allSubtitleStyles.length > 0 && !styleId) {
      // No prop and no internal state, default to 'default' style
      const defaultStyleId = allSubtitleStyles.find(s => s.id === 'default')?.id || allSubtitleStyles[0].id;
      setStyleId(defaultStyleId);
      // Also notify parent of the default selection
      const style = getStyleByStyleId(defaultStyleId);
      const templateId = style?.category ? `template-${style.category}` : 'template-1';
      onTemplateChange?.(templateId, defaultStyleId, mergeSubtitleConfig(style?.config));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStyleId]);

  // Helper to get preview styles from flat config
  const getPreviewStyles = (config: SubtitleConfig) => {
    const containerStyles = (config["subtitle-container"] as Record<string, string>) || {};
    const wordStyles = (config["word"] as Record<string, string>) || {};
    
    return {
      container: {
        background: containerStyles["background"] || "transparent",
        padding: containerStyles["padding"] || "0px",
        borderRadius: containerStyles["border-radius"] || "0px",
      },
      text: {
        color: wordStyles["color"] || "#ffffff",
        fontFamily: wordStyles["font-family"] || "Arial, sans-serif",
        lineHeight: wordStyles["line-height"] || "1.4",
        fontWeight: wordStyles["font-weight"] || "normal",
        fontStyle: wordStyles["font-style"] || "normal",
        textTransform: wordStyles["text-transform"] || "none",
        textShadow: wordStyles["text-shadow"] || "none",
        WebkitTextStroke: wordStyles["-webkit-text-stroke"] || undefined,
        opacity: wordStyles["opacity"] || "1",
      } as React.CSSProperties
    };
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("subtitleSelector.title")}</CardTitle>
          <CardDescription>{t("subtitleSelector.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-1 sm:gap-1">
            {allSubtitleStyles.map((style) => {
              const isSelected = styleId === style.id;
              const isBlank = style.id === 'blank';
              const config = mergeSubtitleConfig(style.config);
              const previewStyles = getPreviewStyles(config);
              const wordStyles = (config["word"] as Record<string, string>) || {};
              
              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className={`relative group rounded-lg border-2 transition-all duration-200 w-full h-fit ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card hover:border-primary/50 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="relative bg-gray-700 rounded-md h-[60px] flex items-center justify-center overflow-hidden">
                    {isBlank ? (
                      // Special rendering for blank template
                      <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
                        <Ban className="h-5 w-5" />
                        <span className="text-xs font-medium">{t("subtitleSelector.noText")}</span>
                      </div>
                    ) : (
                      <div style={previewStyles.container}>
                        <TemplatePreviewText
                          text={style.name}
                          styles={previewStyles.text}
                          webkitTextStroke={wordStyles["-webkit-text-stroke"]}
                          originalFontSize={wordStyles["font-size"]}
                          fontSize="clamp(16px, 3vw, 20px)"
                          transform="scale(0.6)"
                        />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubtitleTemplateSelector;
