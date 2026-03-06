import React, { useState, useMemo } from 'react';
import { useFonts } from '@/hooks/useFonts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubtitleConfig, CSSProperties, TitleConfig } from '@/types/subtitle';
import subtitleStyles from '@/data/subtitleStyles.json';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette,
  Square,
  Circle,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  CaseSensitive,
  CaseUpper,
  CaseLower,
  Highlighter,
  SunDim,
  MoveVertical,
  Space,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Legacy TextStyles interface for backward compatibility (demo modal)
export interface TextStyles {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
  textStroke: { enabled: boolean; color: string; width: number };
  textAlign: string;
  borderRadius: number;
}

// Props for editing subtitle config classes directly (new approach)
// All props are optional to support both legacy and new modes
interface TextEditorPanelProps {
  selectedTextBlock: 'headline' | 'subtitle' | 'title' | null;
  // New mode props (optional)
  subtitleConfig?: SubtitleConfig;
  onUpdateConfig?: (config: SubtitleConfig) => void;
  title?: string;
  // Title editing props (optional)
  titleConfig?: TitleConfig;
  onUpdateTitleConfig?: (config: TitleConfig) => void;
  titleText?: string;
  onTitleTextChange?: (text: string) => void;
  // Legacy props (optional, for backward compatibility)
  currentStyles?: TextStyles;
  onUpdateStyles?: (updates: Partial<TextStyles>) => void;
  showTextBlockSelection?: boolean;
}

export const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  selectedTextBlock,
  subtitleConfig,
  onUpdateConfig,
  title = "Edit Text",
  // Title editing props
  titleConfig,
  onUpdateTitleConfig,
  titleText,
  onTitleTextChange,
  // Legacy props
  currentStyles,
  onUpdateStyles,
  showTextBlockSelection,
}) => {
  const { t } = useTranslation();
  
  const alignmentOptions = [
    { id: 'left', value: 'left', icon: <AlignLeft className="w-4 h-4" />, label: t('textEditor.alignment.left') },
    { id: 'center', value: 'center', icon: <AlignCenter className="w-4 h-4" />, label: t('textEditor.alignment.center') },
    { id: 'right', value: 'right', icon: <AlignRight className="w-4 h-4" />, label: t('textEditor.alignment.right') },
  ];

  const positionOptions = [
    { id: 'top', label: t('textEditor.alignment.top'), icon: <ArrowUp className="w-4 h-4" /> },
    { id: 'center', label: t('textEditor.alignment.center'), icon: <Minus className="w-4 h-4" /> },
    { id: 'bottom', label: t('textEditor.alignment.bottom'), icon: <ArrowDown className="w-4 h-4" /> },
  ];
  const { fonts: apiFonts, loading } = useFonts();
  const [activeTab, setActiveTab] = useState('settings');

  // Check if using legacy mode (for custom template modal)
  const isLegacyMode = Boolean(currentStyles && onUpdateStyles);
  
  // Check if using new mode (subtitle config editing)
  const isNewMode = Boolean(subtitleConfig && onUpdateConfig);

  // Check if editing title (title mode - no highlight section)
  const isTitleMode = selectedTextBlock === 'title' && Boolean(titleConfig && onUpdateTitleConfig);

  // Title config helpers
  const titleContainerStyles = (titleConfig?.["title-container"] as CSSProperties) || {};
  const titleTextStyles = (titleConfig?.["title-text"] as CSSProperties) || {};

  // Helper to update title container styles
  const updateTitleContainer = (updates: CSSProperties) => {
    if (!titleConfig || !onUpdateTitleConfig) return;
    const currentStyles = (titleConfig["title-container"] as CSSProperties) || {};
    const newConfig: TitleConfig = {
      ...titleConfig,
      "title-container": {
        ...currentStyles,
        ...updates
      }
    };
    onUpdateTitleConfig(newConfig);
  };

  // Helper to update title text styles
  const updateTitleText = (updates: CSSProperties) => {
    if (!titleConfig || !onUpdateTitleConfig) return;
    const currentStyles = (titleConfig["title-text"] as CSSProperties) || {};
    const newConfig: TitleConfig = {
      ...titleConfig,
      "title-text": {
        ...currentStyles,
        ...updates
      }
    };
    onUpdateTitleConfig(newConfig);
  };

  // Parse title values
  const titleFontSize = parseInt(titleTextStyles["font-size"] || "64", 10);
  const titleFontFamily = titleTextStyles["font-family"] || "'Arial Black', sans-serif";
  const titleColor = titleTextStyles["color"] || "#ffffff";
  const titleBgColor = titleContainerStyles["background"] || "transparent";
  const titleBorderRadius = titleContainerStyles["border-radius"] || "0px";
  const titlePadding = titleContainerStyles["padding"] || "16px 32px";
  const titleTextAlign = titleContainerStyles["text-align"] || "center";
  
  // Helper to check if font-weight is bold (handles "bold", "700", "800", "900", etc.)
  const isTitleFontWeightBold = (weight: string | undefined): boolean => {
    if (!weight) return false;
    const normalized = String(weight).toLowerCase().trim();
    return normalized === "bold" || 
           normalized === "700" || 
           normalized === "800" || 
           normalized === "900" ||
           parseInt(normalized, 10) >= 700;
  };
  
  const titleIsBold = isTitleFontWeightBold(titleTextStyles["font-weight"]);
  const titleIsItalic = titleTextStyles["font-style"] === "italic";
  const titleIsUnderline = titleTextStyles["text-decoration"] === "underline";
  const titleTextTransform = titleTextStyles["text-transform"] || "none";

  // Template font interface
  interface TemplateStyle {
    id: string;
    name: string;
    fontId: string;
    fontFileName: string;
    config: {
      word?: { 'font-family'?: string };
    };
  }

  // Only use fonts from API (no template fonts)
  const fonts = useMemo(() => {
    return (apiFonts || []).filter(font => font && font.id && font.name);
  }, [apiFonts]);

  // Get current class properties (new mode - flat structure)
  const containerStyles = (subtitleConfig?.["subtitle-container"] as CSSProperties) || {};
  const wordStyles = (subtitleConfig?.["word"] as CSSProperties) || {};
  const highlightStyles = (subtitleConfig?.["word-being-narrated"] as CSSProperties) || {};

  // Helper to update a specific class (flat structure)
  const updateClass = (className: string, updates: CSSProperties) => {
    if (!subtitleConfig || !onUpdateConfig) return;
    const currentClassStyles = (subtitleConfig[className] as CSSProperties) || {};
    const newConfig: SubtitleConfig = {
      ...subtitleConfig,
      [className]: {
        ...currentClassStyles,
        ...updates
      }
    };
    onUpdateConfig(newConfig);
  };

  // Helper to update container styles
  const updateContainer = (updates: CSSProperties) => updateClass("subtitle-container", updates);
  
  // Helper to update word styles
  const updateWord = (updates: CSSProperties) => updateClass("word", updates);
  
  // Helper to update highlight styles
  const updateHighlight = (updates: CSSProperties) => updateClass("word-being-narrated", updates);

  // Helper to update position
  const updatePosition = (position: 'top' | 'center' | 'bottom') => {
    if (!subtitleConfig || !onUpdateConfig) return;
    onUpdateConfig({
      ...subtitleConfig,
      position
    });
  };

  // Parse current values
  const currentFontSize = parseInt(wordStyles["font-size"] || "16", 10);
  const currentFontFamily = wordStyles["font-family"] || "Arial, sans-serif";
  const currentColor = wordStyles["color"] || "#ffffff";
  const currentHighlightColor = highlightStyles["color"] || "#fbbf24";
  const currentBgColor = containerStyles["background"] || "transparent";
  const currentBorderRadius = containerStyles["border-radius"] || "0px";
  const currentPadding = containerStyles["padding"] || "0px";
  const currentOpacity = wordStyles["opacity"] || "1";
  const currentTextAlign = containerStyles["text-align"] || "center";
  
  // Helper to check if font-weight is bold (handles "bold", "700", "800", "900", etc.)
  const isFontWeightBold = (weight: string | undefined): boolean => {
    if (!weight) return false;
    const normalized = String(weight).toLowerCase().trim();
    return normalized === "bold" || 
           normalized === "700" || 
           normalized === "800" || 
           normalized === "900" ||
           parseInt(normalized, 10) >= 700;
  };
  
  const isBold = isFontWeightBold(wordStyles["font-weight"]);
  const isItalic = wordStyles["font-style"] === "italic";
  const isUnderline = wordStyles["text-decoration"] === "underline";
  const textTransform = wordStyles["text-transform"] || "none";
  
  // Highlight text values
  const currentHighlightFontSize = parseInt(highlightStyles["font-size"] || wordStyles["font-size"] || "16", 10);
  const currentHighlightOpacity = highlightStyles["opacity"] || wordStyles["opacity"] || "1";
  const isHighlightBold = isFontWeightBold(highlightStyles["font-weight"]);
  const isHighlightItalic = highlightStyles["font-style"] === "italic";
  const isHighlightUnderline = highlightStyles["text-decoration"] === "underline";
  const highlightTextTransform = highlightStyles["text-transform"] || wordStyles["text-transform"] || "none";

  // Helpers for text-shadow parsing / formatting
  const parseTextShadow = (value: string | undefined) => {
    if (!value || value === 'none') {
      return { offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0.6)' };
    }

    // Match patterns like "2px 3px 4px rgba(...)" or "2px 3px rgba(...)"
    const regex = /(-?\d+)px\s+(-?\d+)px(?:\s+(\d+)px)?\s+(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|\w+)/;
    const match = value.match(regex);

    if (!match) {
      return { offsetX: 0, offsetY: 0, blur: 0, color: 'rgba(0,0,0,0.6)' };
    }

    const [, x, y, blur, color] = match;
    return {
      offsetX: parseInt(x, 10) || 0,
      offsetY: parseInt(y, 10) || 0,
      blur: blur ? parseInt(blur, 10) || 0 : 0,
      color: color || 'rgba(0,0,0,0.6)',
    };
  };

  const formatTextShadow = (offsetX: number, offsetY: number, color: string, blur: number = 0) => {
    const safeColor = color || 'rgba(0,0,0,0.6)';
    const safeBlur = Number.isFinite(blur) ? blur : 0;
    return `${offsetX || 0}px ${offsetY || 0}px ${safeBlur}px ${safeColor}`;
  };

  // Load a font when it's selected
  const handleFontChange = async (fontId: string) => {
    const selectedFont = fonts.find(f => f.id === fontId);
    if (selectedFont) {
      if (isLegacyMode && onUpdateStyles) {
        onUpdateStyles({ fontFamily: selectedFont.family });
      } else {
        // Use the font family directly from the font data
        updateWord({ "font-family": selectedFont.family });
      }
    }
  };

  // Get current font family (for selection by family name)
  const getCurrentFontFamily = (): string => {
    // If current font-family matches an API font, return it
    if (currentFontFamily && fonts.length > 0) {
      // Try to find matching font by family string
      const matchingFont = fonts.find(font => {
        if (!font || !font.family) return false;
        // Compare normalized font family strings
        const currentNormalized = currentFontFamily.toLowerCase().replace(/['"]/g, '').trim();
        const fontNormalized = font.family.toLowerCase().replace(/['"]/g, '').trim();
        return currentNormalized === fontNormalized || 
               currentNormalized.includes(fontNormalized.split(',')[0].trim()) ||
               fontNormalized.includes(currentNormalized.split(',')[0].trim());
      });
      
      if (matchingFont) {
        return matchingFont.family;
      }
    }
    
    // Return first API font family as fallback, or current if no match
    return fonts[0]?.family || currentFontFamily || "Arial, sans-serif";
  };

  // If neither mode is configured, show a placeholder
  if (!isLegacyMode && !isNewMode) {
  return (
      <div className="h-full flex flex-col bg-white p-4">
        <div className="text-sm text-gray-500 text-center py-8">
          No configuration provided
        </div>
      </div>
    );
  }

  // If in legacy mode, render the old UI
  if (isLegacyMode && currentStyles && onUpdateStyles) {
    const shadowSettings = currentStyles.textShadow || { enabled: false, color: '#000000', blur: 4, offsetX: 0, offsetY: 0 };
    const strokeSettings = currentStyles.textStroke || { enabled: false, color: '#000000', width: 1 };
    const activeCase = currentStyles.textTransform || 'none';

    const handleCasing = (value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => {
      onUpdateStyles({ textTransform: value === 'none' ? undefined : value });
    };

    const handleAlignment = (value: string) => {
      onUpdateStyles({ textAlign: value });
    };

    return (
      <div className="h-full flex flex-col bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 bg-transparent border-b rounded-none p-0 h-auto">
            <TabsTrigger 
              value="presets" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Presets
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="flex-1 overflow-y-auto p-4">
            <div className="text-sm text-gray-500">
              Preset templates will appear here
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto p-4 space-y-6">
            {!selectedTextBlock ? (
              <div className="text-sm text-gray-500 text-center py-8">
                Click on text in the video to edit
              </div>
            ) : (
              <>
                {/* Font and Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Select
                      value={fonts.find(f => f.family === currentStyles.fontFamily)?.family || fonts[0]?.family || currentStyles.fontFamily || 'Arial, sans-serif'}
                      onValueChange={(selectedFamily) => {
                        const selectedFont = fonts.find(f => f.family === selectedFamily);
                        if (selectedFont) {
                          handleFontChange(selectedFont.id);
                        } else {
                          onUpdateStyles({ fontFamily: selectedFamily });
                        }
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full h-10 text-sm">
                        <SelectValue>
                          {(() => {
                            const currentFont = fonts.find(f => f.family === currentStyles.fontFamily);
                            return currentFont ? (
                              <span style={{ fontFamily: currentFont.family }}>{currentFont.name}</span>
                            ) : (
                              <span>{currentStyles.fontFamily?.split(',')[0].replace(/['"]/g, '') || 'Arial'}</span>
                            );
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="font-select-dropdown">
                        {fonts.map(font => (
                          <SelectItem 
                            key={font.id} 
                            value={font.family}
                          >
                            <span style={{ fontFamily: font.family }}>{font.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <select
                      value={currentStyles.fontSize || 14}
                      onChange={(e) => onUpdateStyles({ fontSize: Number(e.target.value) })}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50"
                    >
                      {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
          </div>
        </div>

                {/* Formatting Buttons Row */}
                <div className="grid grid-cols-6 gap-2">
                  {alignmentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAlignment(option.value)}
                      className={`p-3 rounded-lg border flex items-center justify-center ${currentStyles.textAlign === option.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-gray-100 hover:bg-gray-200 border-transparent'}`}
                      title={option.label}
                    >
                      {option.icon}
                    </button>
                  ))}
            <button
                    onClick={() => onUpdateStyles({ fontWeight: currentStyles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`p-3 rounded-lg ${currentStyles.fontWeight === 'bold' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title={t("textEditor.bold")}
            >
                    <Bold className="w-4 h-4" />
            </button>
            <button
                    onClick={() => onUpdateStyles({ fontStyle: currentStyles.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`p-3 rounded-lg ${currentStyles.fontStyle === 'italic' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title={t("textEditor.italic")}
            >
                    <Italic className="w-4 h-4" />
            </button>
            <button
                    onClick={() => onUpdateStyles({ textDecoration: currentStyles.textDecoration === 'underline' ? 'none' : 'underline' })}
                    className={`p-3 rounded-lg ${currentStyles.textDecoration === 'underline' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title={t("textEditor.underline")}
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Color */}
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{t("textEditor.color")}</span>
                  <input
                    type="color"
                    value={currentStyles.textColor}
                    onChange={(e) => onUpdateStyles({ textColor: e.target.value })}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer"
                  />
                </div>

                {/* Background */}
                <div className="flex items-center gap-3">
                  <Square className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{t("textEditor.background")}</span>
                  <input
                    type="color"
                    value={currentStyles.backgroundColor}
                    onChange={(e) => onUpdateStyles({ backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentStyles.backgroundOpacity || 100}
                    onChange={(e) => onUpdateStyles({ backgroundOpacity: Number(e.target.value) })}
                    className="w-20"
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Title mode - simplified editor without highlight section
  if (isTitleMode && titleConfig && onUpdateTitleConfig) {
    return (
      <div className="h-full flex flex-col bg-white text-[13px]">
        {/* Title Text Input */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-medium">{t("textEditor.titleText")}</h4>
          </div>
          <textarea
            value={titleText || ''}
            onChange={(e) => onTitleTextChange?.(e.target.value)}
            placeholder={t("textEditor.enterTitleText")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 bg-transparent border-b rounded-none p-0 h-9">
            <TabsTrigger 
              value="container" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1 px-2 text-xs"
            >
              <Square className="w-4 h-4" />
              Container
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1 px-2 text-xs"
            >
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
          </TabsList>

          {/* Title Container Tab */}
          <TabsContent value="container" className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Background */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.background")}</h4>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={titleBgColor.startsWith('rgba') ? '#000000' : (titleBgColor === 'transparent' ? '#ffffff' : titleBgColor)}
                  onChange={(e) => updateTitleContainer({ "background": e.target.value })}
                  className="w-8 h-7 border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={titleBgColor}
                  onChange={(e) => updateTitleContainer({ "background": e.target.value })}
                  placeholder="transparent, #000, rgba(0,0,0,0.5)"
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            {/* Padding */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Maximize2 className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.padding")}</h4>
              </div>
              <input
                type="text"
                value={titlePadding}
                onChange={(e) => updateTitleContainer({ "padding": e.target.value })}
                placeholder="16px 32px"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>

            {/* Border Radius */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Circle className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.borderRadius")}</h4>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {["0px", "12px", "24px", "999px"].map((radius) => (
                  <button
                    key={radius}
                    onClick={() => updateTitleContainer({ "border-radius": radius })}
                    className={`p-2 rounded border ${
                      titleBorderRadius === radius ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    title={radius}
                  >
                    <div 
                      className="w-full h-6 bg-gray-400" 
                      style={{ borderRadius: radius }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlignCenter className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.textAlignment")}</h4>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {alignmentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateTitleContainer({ "text-align": option.value })}
                    className={`py-1.5 px-2 rounded border flex items-center justify-center gap-1.5 text-xs ${
                      titleTextAlign === option.value 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-gray-100 hover:bg-gray-200 border-transparent'
                    }`}
                    title={option.label}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Width */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Maximize2 className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.maxWidth")}</h4>
              </div>
              {(() => {
                const raw = titleContainerStyles["max-width"] || "90%";
                const numeric = parseInt(String(raw).replace('%', ''), 10) || 90;
                const handleChange = (val: number) => {
                  const clamped = Math.max(10, Math.min(100, val));
                  updateTitleContainer({ "max-width": `${clamped}%` });
                };
                return (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={numeric}
                      onChange={(e) => {
                        const v = parseInt(e.target.value || "0", 10);
                        if (Number.isNaN(v)) return;
                        handleChange(v);
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                    <span className="text-xs text-gray-500 font-medium">%</span>
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* Title Text Tab - No highlight section */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Font Family */}
            <div className='flex flex-row justify-between items-center'>
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.fontFamily")}</h4>
              </div>
              <Select
                value={(() => {
                  if (titleFontFamily && fonts.length > 0) {
                    const matchingFont = fonts.find(font => {
                      if (!font || !font.family) return false;
                      const currentNormalized = titleFontFamily.toLowerCase().replace(/['"]/g, '').trim();
                      const fontNormalized = font.family.toLowerCase().replace(/['"]/g, '').trim();
                      return currentNormalized === fontNormalized || 
                             currentNormalized.includes(fontNormalized.split(',')[0].trim()) ||
                             fontNormalized.includes(currentNormalized.split(',')[0].trim());
                    });
                    if (matchingFont) return matchingFont.family;
                  }
                  return fonts[0]?.family || titleFontFamily;
                })()}
                onValueChange={(selectedFamily) => {
                  const selectedFont = fonts.find(f => f.family === selectedFamily);
                  if (selectedFont) {
                    updateTitleText({ "font-family": selectedFont.family });
                  } else {
                    updateTitleText({ "font-family": selectedFamily });
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs px-2 py-1.5">
                  <SelectValue>
                    {(() => {
                      const currentFont = fonts.find(f => f.family === titleFontFamily);
                      return currentFont ? (
                        <span style={{ fontFamily: currentFont.family }}>{currentFont.name}</span>
                      ) : (
                        <span>{titleFontFamily.split(',')[0].replace(/['"]/g, '')}</span>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="font-select-dropdown">
                  {fonts.map(font => (
                    <SelectItem 
                      key={font.id} 
                      value={font.family}
                      className="text-xs"
                    >
                      <span style={{ fontFamily: font.family }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-600">{t("textEditor.fontSize")}</span>
                <span className="text-[11px] text-gray-500">({titleFontSize}px)</span>
              </div>
              <input
                type="range"
                min={16}
                max={120}
                step={1}
                value={titleFontSize}
                onChange={(e) => updateTitleText({ "font-size": `${e.target.value}px` })}
                className="w-full accent-primary"
              />
            </div>

            {/* Text Color */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">{t("textEditor.textColor")}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={titleColor}
                  onChange={(e) => updateTitleText({ "color": e.target.value })}
                  className="w-8 h-7 border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={titleColor}
                  onChange={(e) => updateTitleText({ "color": e.target.value })}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            {/* Formatting */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium">{t("textEditor.formatting")}</h4>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const currentWeight = String(titleTextStyles["font-weight"] || "").trim();
                    const isCurrentlyBold = isTitleFontWeightBold(currentWeight);
                    const newWeight = isCurrentlyBold ? "normal" : "bold";
                    updateTitleText({ "font-weight": newWeight });
                  }}
                  className={`p-2 rounded transition-colors ${titleIsBold ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t("textEditor.bold")}
                >
                  <Bold className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateTitleText({ "font-style": titleIsItalic ? "normal" : "italic" })}
                  className={`p-2 rounded ${titleIsItalic ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t("textEditor.italic")}
                >
                  <Italic className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateTitleText({ "text-decoration": titleIsUnderline ? "none" : "underline" })}
                  className={`p-2 rounded ${titleIsUnderline ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t("textEditor.underline")}
                >
                  <Underline className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateTitleText({ "text-transform": titleTextTransform === "uppercase" ? "none" : "uppercase" })}
                  className={`p-2 rounded ${titleTextTransform === "uppercase" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t("textEditor.uppercase")}
                >
                  <CaseUpper className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={() => updateTitleText({ "text-transform": titleTextTransform === "lowercase" ? "none" : "lowercase" })}
                  className={`p-2 rounded ${titleTextTransform === "lowercase" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t("textEditor.lowercase")}
                >
                  <CaseLower className="w-4 h-4 mx-auto" />
                </button>
                <button 
                  onClick={() => updateTitleText({ "text-transform": titleTextTransform === "capitalize" ? "none" : "capitalize" })}
                  className={`p-2 rounded ${titleTextTransform === "capitalize" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  title={t("textEditor.capitalize")}
                >
                  <CaseSensitive className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Text Shadow */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium text-gray-700">{t("textEditor.textShadow")}</h4>
              </div>
              {(() => {
                const { offsetX, offsetY, blur, color } = parseTextShadow(titleTextStyles["text-shadow"] as string | undefined);
                return (
                  <div className="grid grid-cols-4 gap-1">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">X</label>
                      <input
                        type="number"
                        value={offsetX}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "0", 10) || 0;
                          updateTitleText({ "text-shadow": formatTextShadow(v, offsetY, color, blur) });
                        }}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Y</label>
                      <input
                        type="number"
                        value={offsetY}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "0", 10) || 0;
                          updateTitleText({ "text-shadow": formatTextShadow(offsetX, v, color, blur) });
                        }}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.blur")}</label>
                      <input
                        type="number"
                        min={0}
                        value={blur}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "0", 10) || 0;
                          const safe = v < 0 ? 0 : v;
                          updateTitleText({ "text-shadow": formatTextShadow(offsetX, offsetY, color, safe) });
                        }}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.color")}</label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          const v = e.target.value || color;
                          updateTitleText({ "text-shadow": formatTextShadow(offsetX, offsetY, v, blur) });
                        }}
                        className="w-full h-7 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Text Stroke */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Type className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-medium text-gray-700">{t("textEditor.textStroke")}</h4>
              </div>
              {(() => {
                const strokeValue = titleTextStyles["-webkit-text-stroke"] || "0px #000000";
                const match = strokeValue.match(/(\d+)px\s+(#[0-9a-fA-F]{6}|rgba?\([^)]+\)|\w+)/);
                const strokeWidth = match ? parseInt(match[1], 10) : 0;
                const strokeColor = match ? match[2] : "#000000";
                
                return (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.width")}</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={strokeWidth}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "0", 10) || 0;
                          updateTitleText({ "-webkit-text-stroke": `${v}px ${strokeColor}` });
                        }}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.color")}</label>
                      <input
                        type="color"
                        value={strokeColor.startsWith('#') ? strokeColor : '#000000'}
                        onChange={(e) => {
                          updateTitleText({ "-webkit-text-stroke": `${strokeWidth}px ${e.target.value}` });
                        }}
                        className="w-full h-7 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // New mode - class-based config editing
  return (
    <div className="h-full flex flex-col bg-white text-[13px]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 bg-transparent border-b rounded-none p-0 h-9">
          <TabsTrigger 
            value="container" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1 px-2 text-xs"
          >
            <Square className="w-4 h-4" />
            Container
          </TabsTrigger>
          <TabsTrigger 
            value="settings"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center gap-1 px-2 text-xs"
          >
            <Type className="w-4 h-4" />
            Text
          </TabsTrigger>
        </TabsList>

        {/* Container Tab - Background, Position, Padding */}
        <TabsContent value="container" className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Position */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MoveVertical className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.position")}</h4>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {positionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => updatePosition(option.id as 'top' | 'center' | 'bottom')}
                  className={`py-1.5 px-2 rounded border text-xs flex items-center justify-center gap-1.5 ${
                    subtitleConfig?.position === option.id 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-gray-100 hover:bg-gray-200 border-transparent'
                  }`}
                  title={option.label}
                >
                  {option.icon}
                  {option.label}
            </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.background")}</h4>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentBgColor.startsWith('rgba') ? '#000000' : (currentBgColor === 'transparent' ? '#ffffff' : currentBgColor)}
                onChange={(e) => updateContainer({ "background": e.target.value })}
                className="w-8 h-7 border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={currentBgColor}
                onChange={(e) => updateContainer({ "background": e.target.value })}
                placeholder="transparent, #000, rgba(0,0,0,0.5)"
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Padding */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.padding")}</h4>
            </div>
            <input
              type="text"
              value={currentPadding}
              onChange={(e) => updateContainer({ "padding": e.target.value })}
              placeholder="12px 24px"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
            />
          </div>

          {/* Border Radius */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.borderRadius")}</h4>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {["0px", "12px", "24px", "999px"].map((radius) => (
                <button
                  key={radius}
                  onClick={() => updateContainer({ "border-radius": radius })}
                  className={`p-2 rounded border ${
                    currentBorderRadius === radius ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  title={radius}
                >
                  <div 
                    className="w-full h-6 bg-gray-400" 
                    style={{ borderRadius: radius }}
                  />
                </button>
              ))}
            </div>
            <input
              type="number"
              value={parseInt(currentBorderRadius || "0", 10)}
              onChange={(e) => {
                const val = parseInt(e.target.value || "0", 10);
                if (Number.isNaN(val)) return;
                updateContainer({ "border-radius": `${val}px` });
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              placeholder={t("textEditor.customRadiusPx")}
            />
          </div>

          {/* Text Alignment */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlignCenter className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.textAlignment")}</h4>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {alignmentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateContainer({ "text-align": option.value })}
                  className={`py-1.5 px-2 rounded border flex items-center justify-center gap-1.5 text-xs ${
                    currentTextAlign === option.value 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-gray-100 hover:bg-gray-200 border-transparent'
                  }`}
                  title={option.label}
                >
                  {option.icon}
                </button>
              ))}
          </div>
        </div>

          {/* Max Width (% only, incremental) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.maxWidth")}</h4>
            </div>
            {(() => {
              const raw = containerStyles["max-width"] || "85%";
              const numeric = parseInt(String(raw).replace('%', ''), 10) || 85;
              const handleChange = (val: number) => {
                const clamped = Math.max(10, Math.min(100, val));
                updateContainer({ "max-width": `${clamped}%` });
              };
              return (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={numeric}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "0", 10);
                      if (Number.isNaN(v)) return;
                      handleChange(v);
                    }}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                  />
                  <span className="text-xs text-gray-500 font-medium">%</span>
                </div>
              );
            })()}
          </div>
        </TabsContent>

        {/* Text Tab - Font, Colors, Formatting */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Shared font (applies to both normal & highlight text) */}
          <div className='flex flex-row justify-between items-center'>
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-medium">{t("textEditor.fontFamily")}</h4>
            </div>
            <Select
              value={getCurrentFontFamily()}
              onValueChange={(selectedFamily) => {
                const selectedFont = fonts.find(f => f.family === selectedFamily);
                if (selectedFont) {
                  // Keep font-family same for normal and highlight
                  updateWord({ "font-family": selectedFont.family });
                  updateHighlight({ "font-family": selectedFont.family });
                  handleFontChange(selectedFont.id);
                } else {
                  // Fallback: use the selected family string directly
                  updateWord({ "font-family": selectedFamily });
                  updateHighlight({ "font-family": selectedFamily });
                }
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs px-2 py-1.5">
                <SelectValue>
                  {(() => {
                    const currentFamily = getCurrentFontFamily();
                    const currentFont = fonts.find(f => f.family === currentFamily);
                    return currentFont ? (
                      <span style={{ fontFamily: currentFont.family }}>{currentFont.name}</span>
                    ) : (
                      <span>{currentFamily.split(',')[0].replace(/['"]/g, '')}</span>
                    );
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="font-select-dropdown">
                {fonts.map(font => (
                  <SelectItem 
                    key={font.id} 
                    value={font.family}
                    className="text-xs"
                  >
                    <span style={{ fontFamily: font.family }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sections for normal and highlight text */}
          <Accordion type="single" collapsible defaultValue="normal">
            {/* Normal text section */}
            <AccordionItem value="normal">
              <AccordionTrigger className="py-2 px-3 text-xs font-medium text-gray-800 data-[state=open]:bg-gray-100">
                <span className="flex items-center gap-2 text-sm font-semibold py-2">
                  <Type className="w-3 h-3 text-gray-500" />
                  Normal Text
                </span>
              </AccordionTrigger>
              <AccordionContent>
          {/* Font size slider + value */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">{t("textEditor.fontSize")}</span>
                    <span className="text-[11px] text-gray-500">({currentFontSize}px)</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={80}
                    step={1}
                    value={currentFontSize}
                    onChange={(e) => updateWord({ "font-size": `${e.target.value}px` })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Text Color */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">{t("textEditor.textColor")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => updateWord({ "color": e.target.value })}
                      className="w-8 h-7 border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(e) => updateWord({ "color": e.target.value })}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SunDim className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-medium">Opacity ({currentOpacity})</h4>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentOpacity}
                    onChange={(e) => updateWord({ "opacity": e.target.value })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Formatting */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-medium">{t("textEditor.formatting")}</h4>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const currentWeight = String(wordStyles["font-weight"] || "").trim();
                        const isCurrentlyBold = isFontWeightBold(currentWeight);
                        const newWeight = isCurrentlyBold ? "normal" : "bold";
                        updateWord({ "font-weight": newWeight });
                      }}
                      className={`p-2 rounded transition-colors ${isBold ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.bold")}
                    >
                      <Bold className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateWord({ "font-style": isItalic ? "normal" : "italic" })}
                      className={`p-2 rounded ${isItalic ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.italic")}
                    >
                      <Italic className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateWord({ "text-decoration": isUnderline ? "none" : "underline" })}
                      className={`p-2 rounded ${isUnderline ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.underline")}
                    >
                      <Underline className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateWord({ "text-transform": textTransform === "uppercase" ? "none" : "uppercase" })}
                      className={`p-2 rounded ${textTransform === "uppercase" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.uppercase")}
                    >
                      <CaseUpper className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                      onClick={() => updateWord({ "text-transform": textTransform === "lowercase" ? "none" : "lowercase" })}
                      className={`p-2 rounded ${textTransform === "lowercase" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.lowercase")}
                    >
                      <CaseLower className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                      onClick={() => updateWord({ "text-transform": textTransform === "capitalize" ? "none" : "capitalize" })}
                      className={`p-2 rounded ${textTransform === "capitalize" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.capitalize")}
                    >
                      <CaseSensitive className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              
                {/* Line Height */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MoveVertical className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-medium">{t("textEditor.lineHeight")}</h4>
                  </div>
                  {(() => {
                    const currentLineHeight = parseFloat(wordStyles["line-height"] || "1.4");
                    
                    const handleLineHeightChange = (delta: number) => {
                      const newValue = Math.max(0.8, Math.min(3, currentLineHeight + delta));
                      updateWord({ "line-height": newValue.toFixed(1) });
                    };
                    
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLineHeightChange(-0.1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t("textEditor.decreaseLineHeight")}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0.8"
                          max="3"
                          step="0.1"
                          value={currentLineHeight}
                          onChange={(e) => {
                            const newValue = Math.max(0.8, Math.min(3, parseFloat(e.target.value) || 1.4));
                            updateWord({ "line-height": newValue.toFixed(1) });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs text-center"
                        />
                        <button
                          onClick={() => handleLineHeightChange(0.1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t("textEditor.increaseLineHeight")}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Word Spacing (margin) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Space className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-medium">{t("textEditor.wordSpacing")}</h4>
                  </div>
                  {(() => {
                    const marginValue = wordStyles["margin"] || "0 2px";
                    const match = marginValue.match(/(\d+)/g);
                    const currentSpacing = match ? parseInt(match[match.length - 1], 10) : 2;
                    
                    const handleSpacingChange = (delta: number) => {
                      const newValue = Math.max(0, Math.min(50, currentSpacing + delta));
                      updateWord({ "margin": `0 ${newValue}px` });
                    };
                    
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpacingChange(-1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t('textEditor.spacing.decrease')}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={currentSpacing}
                          onChange={(e) => {
                            const newValue = Math.max(0, Math.min(50, parseInt(e.target.value, 10) || 0));
                            updateWord({ "margin": `0 ${newValue}px` });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs text-center"
                        />
                        <button 
                          onClick={() => handleSpacingChange(1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t('textEditor.spacing.increase')}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {/* <span className="text-xs text-gray-500">px</span> */}
                      </div>
                    );
                  })()}
                </div>

                {/* Text Shadow (structured, compact) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-medium text-gray-700">{t("textEditor.textShadow")}</h4>
                  </div>
                  {(() => {
                    const { offsetX, offsetY, blur, color } = parseTextShadow(wordStyles["text-shadow"] as string | undefined);
                    return (
                      <div className="grid grid-cols-4 gap-1">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">X</label>
                          <input
                            type="number"
                            value={offsetX}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10) || 0;
                              updateWord({ "text-shadow": formatTextShadow(v, offsetY, color, blur) });
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Y</label>
                          <input
                            type="number"
                            value={offsetY}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10) || 0;
                              updateWord({ "text-shadow": formatTextShadow(offsetX, v, color, blur) });
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.blur")}</label>
                          <input
                            type="number"
                            min={0}
                            value={blur}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10) || 0;
                              const safe = v < 0 ? 0 : v;
                              updateWord({ "text-shadow": formatTextShadow(offsetX, offsetY, color, safe) });
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.color")}</label>
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const v = e.target.value || color;
                              updateWord({ "text-shadow": formatTextShadow(offsetX, offsetY, v, blur) });
                            }}
                            className="w-full h-7 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Highlight text section */}
            <AccordionItem value="highlight">
            <AccordionTrigger className="py-2 px-3 text-xs font-medium text-gray-800 data-[state=open]:bg-gray-100">
                <span className="flex items-center gap-2 text-sm font-semibold py-2">
                  <Type className="w-3 h-3 text-gray-500" />
                  Highlight Text
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {/* Font size slider + value */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">{t("textEditor.fontSize")}</span>
                    <span className="text-[11px] text-gray-500">({currentHighlightFontSize}px)</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={80}
                    step={1}
                    value={currentHighlightFontSize}
                    onChange={(e) => updateHighlight({ "font-size": `${e.target.value}px` })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Text Color */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">{t("textEditor.textColor")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentHighlightColor}
                      onChange={(e) => updateHighlight({ "color": e.target.value })}
                      className="w-8 h-7 border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentHighlightColor}
                      onChange={(e) => updateHighlight({ "color": e.target.value })}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>

                {/* Opacity */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SunDim className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-medium">Opacity ({currentHighlightOpacity})</h4>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentHighlightOpacity}
                    onChange={(e) => updateHighlight({ "opacity": e.target.value })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Formatting */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-medium">{t("textEditor.formatting")}</h4>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const currentWeight = String(highlightStyles["font-weight"] || "").trim();
                        const isCurrentlyBold = isFontWeightBold(currentWeight);
                        const newWeight = isCurrentlyBold ? "normal" : "bold";
                        updateHighlight({ "font-weight": newWeight });
                      }}
                      className={`p-2 rounded transition-colors ${isHighlightBold ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.bold")}
                    >
                      <Bold className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateHighlight({ "font-style": isHighlightItalic ? "normal" : "italic" })}
                      className={`p-2 rounded ${isHighlightItalic ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.italic")}
                    >
                      <Italic className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateHighlight({ "text-decoration": isHighlightUnderline ? "none" : "underline" })}
                      className={`p-2 rounded ${isHighlightUnderline ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.underline")}
                    >
                      <Underline className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateHighlight({ "text-transform": highlightTextTransform === "uppercase" ? "none" : "uppercase" })}
                      className={`p-2 rounded ${highlightTextTransform === "uppercase" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.uppercase")}
                    >
                      <CaseUpper className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                      onClick={() => updateHighlight({ "text-transform": highlightTextTransform === "lowercase" ? "none" : "lowercase" })}
                      className={`p-2 rounded ${highlightTextTransform === "lowercase" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.lowercase")}
                    >
                      <CaseLower className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                      onClick={() => updateHighlight({ "text-transform": highlightTextTransform === "capitalize" ? "none" : "capitalize" })}
                      className={`p-2 rounded ${highlightTextTransform === "capitalize" ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={t("textEditor.capitalize")}
                    >
                      <CaseSensitive className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              
                {/* Line Height */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MoveVertical className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-medium">{t("textEditor.lineHeight")}</h4>
                  </div>
                  {(() => {
                    const currentLineHeight = parseFloat(highlightStyles["line-height"] || wordStyles["line-height"] || "1.4");
                    
                    const handleLineHeightChange = (delta: number) => {
                      const newValue = Math.max(0.8, Math.min(3, currentLineHeight + delta));
                      updateHighlight({ "line-height": newValue.toFixed(1) });
                    };
                    
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLineHeightChange(-0.1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t("textEditor.decreaseLineHeight")}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0.8"
                          max="3"
                          step="0.1"
                          value={currentLineHeight}
                          onChange={(e) => {
                            const newValue = Math.max(0.8, Math.min(3, parseFloat(e.target.value) || 1.4));
                            updateHighlight({ "line-height": newValue.toFixed(1) });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs text-center"
                        />
                        <button
                          onClick={() => handleLineHeightChange(0.1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t("textEditor.increaseLineHeight")}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Word Spacing (margin) */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Space className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-medium">{t("textEditor.wordSpacing")}</h4>
                  </div>
                  {(() => {
                    const marginValue = highlightStyles["margin"] || wordStyles["margin"] || "0 2px";
                    const match = marginValue.match(/(\d+)/g);
                    const currentSpacing = match ? parseInt(match[match.length - 1], 10) : 2;
                    
                    const handleSpacingChange = (delta: number) => {
                      const newValue = Math.max(0, Math.min(50, currentSpacing + delta));
                      updateHighlight({ "margin": `0 ${newValue}px` });
                    };
                    
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpacingChange(-1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t('textEditor.spacing.decrease')}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={currentSpacing}
                          onChange={(e) => {
                            const newValue = Math.max(0, Math.min(50, parseInt(e.target.value, 10) || 0));
                            updateHighlight({ "margin": `0 ${newValue}px` });
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs text-center"
                        />
                        <button 
                          onClick={() => handleSpacingChange(1)}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
                          title={t('textEditor.spacing.increase')}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Text Shadow (structured, compact) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-medium text-gray-700">{t("textEditor.textShadow")}</h4>
                  </div>
                  {(() => {
                    const { offsetX, offsetY, blur, color } = parseTextShadow(highlightStyles["text-shadow"] as string | undefined);
                    return (
                      <div className="grid grid-cols-4 gap-1">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">X</label>
                          <input
                            type="number"
                            value={offsetX}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10) || 0;
                              updateHighlight({ "text-shadow": formatTextShadow(v, offsetY, color, blur) });
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Y</label>
                          <input
                            type="number"
                            value={offsetY}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10) || 0;
                              updateHighlight({ "text-shadow": formatTextShadow(offsetX, v, color, blur) });
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.blur")}</label>
                          <input
                            type="number"
                            min={0}
                            value={blur}
                            onChange={(e) => {
                              const v = parseInt(e.target.value || "0", 10) || 0;
                              const safe = v < 0 ? 0 : v;
                              updateHighlight({ "text-shadow": formatTextShadow(offsetX, offsetY, color, safe) });
                            }}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">{t("textEditor.color")}</label>
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const v = e.target.value || color;
                              updateHighlight({ "text-shadow": formatTextShadow(offsetX, offsetY, v, blur) });
                            }}
                            className="w-full h-7 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextEditorPanel;
