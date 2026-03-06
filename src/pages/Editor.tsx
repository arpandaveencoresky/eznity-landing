import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppHeader } from "@/components/layout/AppHeader";
import { HeaderConfigProvider, useHeaderConfig } from "@/contexts/HeaderConfigContext";
import { useToast } from "@/hooks/use-toast";
import { useDevice } from "@/hooks/use-device";
import { useFonts } from "@/hooks/useFonts";
import { useVideoControls } from "@/hooks/useVideoControls";
import { useEditorAPI } from "@/hooks/useEditorAPI";
import { SubtitleConfig, SubtitleSegment, TitleConfig } from "@/types/subtitle";
import { allSubtitleStyles, getSubtitleStyleConfig, getTitleStyleConfig } from "@/data/subtitleTemplates";
import { DesktopTabletLayout } from "@/components/video-editor/layouts/DesktopTabletLayout";
import { MobileLayout } from "@/components/video-editor/layouts/MobileLayout";
import { LoadingOverlay } from "@/components/video-editor/LoadingOverlay";
import { CustomTemplateModal } from "@/components/video-editor/modals/CustomTemplateModal";
import {
  DEFAULT_HEADLINE_STYLES,
  DEFAULT_SUBTITLE_STYLES,
  DEFAULT_HEADLINE_POSITION,
  DEFAULT_SUBTITLE_POSITION,
  DEFAULT_WORD_SUBTITLE_POSITION,
  DEFAULT_TITLE_POSITION,
  DEFAULT_HEADLINE_SIZE,
  DEFAULT_SUBTITLE_SIZE,
  DEFAULT_BACKGROUND,
  DEFAULT_TITLE_DURATION,
  EditorPanel,
  TextStyles,
  Position,
  Size,
  cloneTextStyles,
} from "@/constants/editorDefaults";
import { Type, Layout } from "lucide-react";

// Saved template interface
interface SavedTemplate {
  id: string;
  name: string;
  aspectRatio: string;
  headlineText: string;
  subtitleText: string;
  headlinePosition: Position;
  subtitlePosition: Position;
  headlineSize: Size;
  subtitleSize: Size;
  headlineStyles: TextStyles;
  subtitleStyles: TextStyles;
  styleId?: string;
  thumbnail: string;
}

const EditorContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { reelId: urlReelId } = useParams<{ reelId: string }>();
  const { toast } = useToast();
  const { loadTemplateFonts, loadApiFonts, loadFontById } = useFonts();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { deviceType, isMobile, isTablet } = useDevice();

  // Navigation state from Upload/Dashboard
  const navigationState = location.state as {
    video?: { url?: string; poster_url?: string };
    videoUrl?: string;
    videoId?: string;
    publicId?: string;
    templateId?: string;
    styleId?: string;
    posterUrl?: string;
    projectId?: string;
  } | null;

  // ============================================================================
  // Core State
  // ============================================================================

  const [activePanel, setActivePanel] = useState<EditorPanel>("templates");
  const [zoom, setZoom] = useState(100);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [selectedSubtitleStyleId, setSelectedSubtitleStyleId] = useState("style-1");
  const [selectedBackground, setSelectedBackground] = useState(DEFAULT_BACKGROUND);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState("9:16");

  // ============================================================================
  // Position & Size State
  // ============================================================================

  const [headlinePosition, setHeadlinePosition] = useState({ ...DEFAULT_HEADLINE_POSITION });
  const [subtitlePosition, setSubtitlePosition] = useState({ ...DEFAULT_SUBTITLE_POSITION });
  const [headlineSize, setHeadlineSize] = useState({ ...DEFAULT_HEADLINE_SIZE });
  const [subtitleSize, setSubtitleSize] = useState({ ...DEFAULT_SUBTITLE_SIZE });
  const [wordSubtitlePosition, setWordSubtitlePosition] = useState({ ...DEFAULT_WORD_SUBTITLE_POSITION });
  const [titlePosition, setTitlePosition] = useState({ ...DEFAULT_TITLE_POSITION });

  // ============================================================================
  // Text Styling State
  // ============================================================================

  const [headlineStyles, setHeadlineStyles] = useState<TextStyles>(cloneTextStyles(DEFAULT_HEADLINE_STYLES));
  const [subtitleStyles, setSubtitleStyles] = useState<TextStyles>(cloneTextStyles(DEFAULT_SUBTITLE_STYLES));
  const [selectedTextBlock, setSelectedTextBlock] = useState<string | null>(null);
  const [showRightSlider, setShowRightSlider] = useState(false);

  // ============================================================================
  // Subtitle System State
  // ============================================================================

  const [subtitleData, setSubtitleData] = useState<SubtitleSegment[]>([]);
  const [subtitleConfig, setSubtitleConfig] = useState<SubtitleConfig>({} as SubtitleConfig);
  const [useWordByWordSubtitles] = useState(true);

  // ============================================================================
  // Title State
  // ============================================================================

  const [titleText, setTitleText] = useState<string>("");
  const [showTitle, setShowTitle] = useState<boolean>(true);
  const [titleConfig, setTitleConfig] = useState<TitleConfig>({} as TitleConfig);
  const [titleDuration, setTitleDuration] = useState<number>(DEFAULT_TITLE_DURATION);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [apiConfigLoaded, setApiConfigLoaded] = useState(false);
  const [styleSkinId, setStyleSkinId] = useState<number | undefined>(undefined);

  // ============================================================================
  // Drag State
  // ============================================================================

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [dragStartElementPos, setDragStartElementPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    direction: string;
  } | null>(null);

  // ============================================================================
  // Template Modal State
  // ============================================================================

  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isCustomTemplateModalOpen, setCustomTemplateModalOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateLayout, setTemplateLayout] = useState<"auto" | "fill" | "fit" | "other">("auto");
  const [templateAutoPosition, setTemplateAutoPosition] = useState(true);
  const [templateSubtitleStyle, setTemplateSubtitleStyle] = useState("style-1");
  const [templateHeadlineColor, setTemplateHeadlineColor] = useState("#ffffff");
  const [templateSubtitleColor, setTemplateSubtitleColor] = useState("#000000");
  const [templateBackground, setTemplateBackground] = useState(selectedBackground);

  // ============================================================================
  // Custom Hooks
  // ============================================================================

  const {
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    handlePlayPause,
    handleReplay,
    handleSeek,
    handleFullscreen,
    setPlaybackSpeed,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  } = useVideoControls({ videoRef, containerRef, selection });

  const {
    isLoadingReel,
    currentReel,
    loadReelData,
    saveConfig,
    exportVideo,
    isExporting,
  } = useEditorAPI();

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Use titleDuration from state if available, otherwise use default
  const effectiveTitleDuration = titleDuration || DEFAULT_TITLE_DURATION;
  const isTitleVisible = showTitle && titleText && currentTime <= effectiveTitleDuration;
  const videoUrl = currentReel?.video_url || navigationState?.videoUrl || navigationState?.video?.url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const posterUrl = currentReel?.poster_url || navigationState?.posterUrl || navigationState?.video?.poster_url;

  const menuItems = [
    { id: "templates" as EditorPanel, icon: Type, label: t("editor.templates") },
    { id: "subtitles" as EditorPanel, icon: Layout, label: t("editor.subtitles") },
  ];

  const { setHeaderConfig } = useHeaderConfig();

  // ============================================================================
  // Effects
  // ============================================================================

  // Load fonts on mount
  useEffect(() => {
    loadTemplateFonts();
    loadApiFonts();
  }, []);

  // Sync subtitle config with selected style
  // Skip ONLY during initial load to prevent overwriting API-loaded config
  // After initial load completes, allow template changes to work
  useEffect(() => {
    if (isInitialLoad) return; // Don't overwrite during initial load

    if (selectedSubtitleStyleId) {
      console.log('[Editor] Template changed, updating config for styleId:', selectedSubtitleStyleId);
      const cfg = getSubtitleStyleConfig(selectedSubtitleStyleId);
      setSubtitleConfig(cfg);
      const titleCfg = getTitleStyleConfig(selectedSubtitleStyleId);
      setTitleConfig(titleCfg);
      // Reset apiConfigLoaded flag when user manually changes template
      setApiConfigLoaded(false);
    }
  }, [selectedSubtitleStyleId, isInitialLoad]);

  // Sync position with config presets
  // Skip during initial load to prevent overwriting API-loaded position
  useEffect(() => {
    if (isInitialLoad) return; // Don't overwrite during initial load
    const preset = subtitleConfig?.position;
    // Only handle string presets, skip if it's an object (SubtitlePosition)
    if (!preset || typeof preset === 'object') return;

    let y = wordSubtitlePosition.y;
    if (preset === 'top') y = 20;
    if (preset === 'center') y = 50;
    if (preset === 'bottom') y = 80;

    setWordSubtitlePosition({ x: 50, centered: true, y });
  }, [subtitleConfig, wordSubtitlePosition.y, isInitialLoad]);

  // Watch currentReel from hook and extract data progressively
  // This allows users to see data as it loads, not just after all APIs complete
  useEffect(() => {
    if (!currentReel || !urlReelId || isInitialLoad) return; // Skip during initial load to prevent conflicts

    // Extract title from currentReel (loads first from reelInfo API)
    // Only update if titleText is empty to prevent overriding user edits
    if (currentReel.title && !titleText) {
      setTitleText(currentReel.title);
    }

    // Extract segments from currentReel (loads from segments API)
    if (currentReel.segments && currentReel.segments.length > 0 && subtitleData.length === 0) {
      setSubtitleData(currentReel.segments as SubtitleSegment[]);
    }
  }, [currentReel, urlReelId, titleText, subtitleData, isInitialLoad]);

  // Load reel data from URL - hybrid progressive loading
  useEffect(() => {
    const loadData = async () => {
      if (!urlReelId) {
        return;
      }

      setIsInitialLoad(true);
      setApiConfigLoaded(false); // Reset flag for new reel

      try {
        // Start all three APIs - they update currentReel state progressively in the hook
        // The useEffect above watches currentReel and updates Editor state as data arrives
        const result = await loadReelData(urlReelId);

        // Apply style and config data (these don't come from currentReel, so apply from result)
        // IMPORTANT: Set config FIRST, then styleId to prevent useEffect from overwriting
        if (result.config) {
          // REPLACE config completely, don't merge - to override template defaults
          setSubtitleConfig(result.config);
          setApiConfigLoaded(true); // Mark that API config was loaded
        }

        // Load font from API response if available
        if (result.fontId) {
          loadFontById(result.fontId).catch(err => {
            console.warn('Failed to load font from API:', err);
          });
        }

        // Set styleId AFTER config to prevent useEffect from overwriting API config
        if (result.styleId) {
          console.log('[Editor] Setting selectedSubtitleStyleId from API:', result.styleId);
          setSelectedSubtitleStyleId(result.styleId);
        } else {
          console.warn('[Editor] No styleId in API result:', result);
        }

        // Position can load independently
        if (result.position) {
          setWordSubtitlePosition(result.position);
        }

        // Apply title data from API (only if not already set by user to prevent overriding edits)
        if (result.title && !titleText) {
          setTitleText(result.title);
        }
        if (result.titleConfig) {
          setTitleConfig(result.titleConfig);
        }
        if (result.titlePosition) {
          setTitlePosition(result.titlePosition);
        }
        if (result.titleDuration !== undefined) {
          setTitleDuration(result.titleDuration);
        }
        if (result.showTitle !== undefined) {
          setShowTitle(result.showTitle);
        }
        // Capture numeric style_skin_id for export
        if (result.styleSkinId !== undefined) {
          setStyleSkinId(result.styleSkinId);
        }
      } catch (error) {
        // Error already handled in hook
        console.error('Failed to load reel data:', error);
      } finally {
        // Re-enable useEffects after initial load completes
        // Use setTimeout to ensure state updates are applied first
        setTimeout(() => {
          setIsInitialLoad(false);
        }, 0);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlReelId]);

  // Ensure video stays paused on load
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [videoUrl]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleConfigUpdate = useCallback((newConfig: SubtitleConfig) => {
    setSubtitleConfig(newConfig);
  }, []);

  const handleTitleConfigUpdate = useCallback((newConfig: TitleConfig) => {
    setTitleConfig(newConfig);
  }, []);

  const handleSaveConfigToServer = useCallback(async () => {
    const reelIdToUse = urlReelId || currentReel?.public_id;
    if (!reelIdToUse) {
      toast({
        title: t("common.toast.error"),
        description: t("editor.errors.noReelId"),
        variant: "destructive",
      });
      return;
    }

    await saveConfig({
      reelId: reelIdToUse,
      selectedSubtitleStyleId,
      subtitleConfig,
      wordSubtitlePosition,
      titleText,
      titleDuration,
      showTitle,
      titleConfig,
      titlePosition,
    });
  }, [urlReelId, currentReel, selectedSubtitleStyleId, subtitleConfig, wordSubtitlePosition, titleText, titleDuration, showTitle, titleConfig, titlePosition, saveConfig]);

  const handleExportVideo = useCallback(async () => {
    if (!urlReelId) {
      toast({
        title: t("reelDetails.exportError"),
        description: t("reelDetails.exportErrorDescription"),
        variant: "destructive",
      });
      return;
    }
    // Pass the same style_skin_id used for Instagram publish
    await exportVideo(urlReelId, styleSkinId);
  }, [urlReelId, exportVideo, styleSkinId, t, toast]);

  const handleBack = useCallback(() => {
    if (urlReelId) {
      // When going back from editor to reel details, preserve projectId if available
      const projectId = navigationState?.projectId;
      navigate(`/reel/${urlReelId}`, {
        state: projectId ? { projectId } : undefined
      });
    } else {
      const projectId = navigationState?.projectId;
      if (projectId) {
        navigate(`/product/project/${projectId}/reels`);
      } else {
        navigate(-1);
      }
    }
  }, [urlReelId, navigationState, navigate]);

  // Set header actions for this page (variant and ui are handled by route defaults)
  useEffect(() => {
    setHeaderConfig({
      actions: {
        onSaveStyle: handleSaveConfigToServer,
        onExportVideo: handleExportVideo,
        onBack: handleBack,
        isExporting,
      },
    });
  }, [setHeaderConfig, handleSaveConfigToServer, handleExportVideo, handleBack, isExporting]);

  const handleCut = useCallback(() => {
    if (selection) {
      toast({
        title: t("editor.selectionCut"),
        description: t("editor.selectionCutDescription", { start: selection.start.toFixed(1), end: selection.end.toFixed(1) }),
      });
    } else {
      toast({
        title: t("editor.noSelection"),
        description: t("editor.noSelectionDescription"),
        variant: "destructive",
      });
    }
  }, [selection, toast, t]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);

    if (templateId === 'template-1' || templateId === 'template-2') {
      setSelectedSubtitleStyleId("style-1");
      setHeadlinePosition({ ...DEFAULT_HEADLINE_POSITION });
      setSubtitlePosition({ ...DEFAULT_SUBTITLE_POSITION });
      toast({
        title: t("editor.templateApplied"),
        description: t("editor.templateAppliedDescription", { name: `Template ${templateId.slice(-1)}` }),
      });
    } else if (templateId.startsWith('custom-')) {
      const template = savedTemplates.find(t => t.id === templateId);
      if (template) {
        if (template.styleId) setSelectedSubtitleStyleId(template.styleId);
        setHeadlinePosition(template.headlinePosition);
        setSubtitlePosition(template.subtitlePosition);
        setHeadlineSize(template.headlineSize);
        setSubtitleSize(template.subtitleSize);
        setHeadlineStyles(template.headlineStyles);
        setSubtitleStyles(template.subtitleStyles);
        toast({
          title: t("editor.customTemplateApplied"),
          description: t("editor.customTemplateAppliedDescription", { name: template.name }),
        });
      }
    }
  }, [savedTemplates, toast, t]);

  const handleSaveCustomTemplate = useCallback((template: SavedTemplate) => {
    setSavedTemplates(prev => {
      const existingIndex = prev.findIndex(t => t.id === template.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = template;
        return updated;
      }
      return [...prev, template];
    });
    toast({
      title: t("editor.templateSaved"),
      description: t("editor.templateSavedDescription", { name: template.name }),
    });
  }, [toast, t]);

  // ============================================================================
  // Drag & Resize Handlers
  // ============================================================================

  const getPositionForElement = useCallback((element: string) => {
    switch (element) {
      case 'headline': return headlinePosition;
      case 'wordSubtitle': return wordSubtitlePosition;
      case 'title': return titlePosition;
      default: return subtitlePosition;
    }
  }, [headlinePosition, subtitlePosition, wordSubtitlePosition, titlePosition]);

  const handleDragStart = useCallback((element: string, e: React.MouseEvent) => {
    setDragOffset({ x: e.clientX, y: e.clientY });
    setDragTarget(element);
    const startPos = getPositionForElement(element);
    setDragStartElementPos({ x: startPos.x, y: startPos.y });
  }, [getPositionForElement]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
    setDragOffset(null);
    setDragTarget(null);
  }, []);

  const handleResizeStart = useCallback((element: string, direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(element);

    const currentSize = element === 'headline' ? headlineSize : subtitleSize;
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: currentSize.width,
      height: currentSize.height,
      direction,
    });
  }, [headlineSize, subtitleSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    setResizeStart(null);
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent, element: string) => {
    if (!isDragging || isDragging !== element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (element === 'headline') {
      setHeadlinePosition(prev => ({ ...prev, x, y }));
    } else if (element === 'subtitle') {
      setSubtitlePosition(prev => ({ ...prev, x, y }));
    }
  }, [isDragging]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    // Start dragging if moved more than 5px
    if (dragOffset && !isDragging && !isResizing) {
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 5 && dragTarget) {
        setIsDragging(dragTarget);
      }
    }

    if (isDragging && dragOffset) {
      const videoContainer = document.querySelector('.video-container');
      if (!videoContainer) return;

      const content = document.querySelector('.video-container .video-content') as HTMLElement | null;
      const rect = (content || videoContainer).getBoundingClientRect();
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;

      const calculateNewPosition = (startPos: { x: number; y: number }, centered = true) => {
        const deltaPercentX = (deltaX / rect.width) * 100;
        const deltaPercentY = (deltaY / rect.height) * 100;
        return {
          x: Math.max(0, Math.min(100, startPos.x + deltaPercentX)),
          y: Math.max(0, Math.min(100, startPos.y + deltaPercentY)),
          centered,
        };
      };

      const startPos = dragStartElementPos ?? getPositionForElement(isDragging);

      switch (isDragging) {
        case 'headline':
          setHeadlinePosition(calculateNewPosition(startPos));
          break;
        case 'subtitle':
          setSubtitlePosition(calculateNewPosition(startPos));
          break;
        case 'wordSubtitle':
          setWordSubtitlePosition(calculateNewPosition(startPos, false));
          break;
        case 'title':
          setTitlePosition(calculateNewPosition(startPos, false));
          break;
      }
    }

    if (isResizing && resizeStart) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      switch (resizeStart.direction) {
        case 'left':
          newWidth = Math.max(60, Math.min(400, resizeStart.width - deltaX));
          break;
        case 'right':
          newWidth = Math.max(60, Math.min(400, resizeStart.width + deltaX));
          break;
        case 'top':
          newHeight = Math.max(24, Math.min(200, resizeStart.height - deltaY));
          break;
        case 'bottom':
          newHeight = Math.max(24, Math.min(200, resizeStart.height + deltaY));
          break;
      }

      if (isResizing === 'headline') {
        setHeadlineSize({ width: newWidth, height: newHeight });
      } else if (isResizing === 'subtitle') {
        setSubtitleSize({ width: newWidth, height: newHeight });
      }
    }
  }, [dragOffset, isDragging, isResizing, dragTarget, dragStartElementPos, resizeStart, getPositionForElement]);

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(null);
    setIsResizing(null);
    setResizeStart(null);
    setDragOffset(null);
    setDragTarget(null);
  }, []);

  const handleTextBlockClick = useCallback((type: 'headline' | 'subtitle' | 'title') => {
    setSelectedTextBlock(type);
    if (isMobile) {
      setActivePanel("text");
    } else {
      setShowRightSlider(true);
    }
  }, [isMobile]);

  // Global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing || dragOffset) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Handle outside click to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if any Radix portal/dropdown is currently open in the DOM
      // If so, don't close anything as user might be interacting with it
      const hasOpenPortal = document.querySelector(
        '[data-radix-popper-content-wrapper], [data-radix-portal], [data-state="open"][role="listbox"]'
      );
      if (hasOpenPortal) return;

      // Check if click is inside editor-related containers
      const isInsideEditor = target.closest(
        '.text-overlay-container, .right-slider-panel, .text-editor-panel, .title-overlay-root, .subtitle-overlay'
      );
      if (isInsideEditor) return;

      // Check for interactive elements (inputs, buttons, selects, textareas, etc.)
      const isInteractiveElement = target.closest(
        'input, button, select, textarea, [role="button"], [role="listbox"], [role="combobox"], [role="tab"], [role="tabpanel"]'
      );
      if (isInteractiveElement && isInteractiveElement.closest('.right-slider-panel, .text-editor-panel')) {
        return;
      }

      // Check for color input (native color picker)
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'color') {
        return;
      }

      setSelectedTextBlock(null);
      setShowRightSlider(false);
    };

    // Use mousedown to catch the event before Radix closes the portal
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LoadingOverlay isVisible={isLoadingReel} message={t("editor.loadingReel")} />

      <div>
        <AppHeader />
      </div>

      {/* Desktop & Tablet Layout */}
      {!isMobile && (
        <>
          <DesktopTabletLayout
            deviceType={deviceType}
            isTablet={isTablet}
            menuItems={menuItems}
            activePanel={activePanel}
            onPanelChange={(panelId) => setActivePanel(panelId as EditorPanel)}
            onBack={handleBack}
            subtitleSegments={subtitleData}
            currentTime={currentTime}
            onSeek={handleSeek}
            selectedTemplate={selectedTemplate}
            selectedSubtitleStyleId={selectedSubtitleStyleId}
            onTemplateChange={(templateId, styleId) => {
              setSelectedTemplate(templateId);
              if (styleId) {
                setSelectedSubtitleStyleId(styleId);
                // Hide title when "No Text" (blank) style is selected
                setShowTitle(styleId !== 'blank');
              }
            }}
            videoRef={videoRef}
            containerRef={containerRef}
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            selectedBackground={selectedBackground}
            zoom={zoom}
            videoAspectRatio={videoAspectRatio}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onPlayPause={handlePlayPause}
            onReplay={handleReplay}
            isDragging={isDragging}
            isResizing={isResizing}
            headlinePosition={headlinePosition}
            subtitlePosition={subtitlePosition}
            headlineSize={headlineSize}
            subtitleSize={subtitleSize}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
            selectedTextBlock={selectedTextBlock}
            onTextBlockClick={handleTextBlockClick}
            headlineStyles={headlineStyles}
            subtitleStyles={subtitleStyles}
            subtitleConfig={subtitleConfig}
            useWordByWordSubtitles={useWordByWordSubtitles}
            wordSubtitlePosition={wordSubtitlePosition}
            onWordSubtitleDragStart={(e) => handleDragStart('wordSubtitle', e)}
            titleText={titleText}
            showTitle={isTitleVisible}
            titleConfig={titleConfig}
            titlePosition={titlePosition}
            onTitleDragStart={(e) => handleDragStart('title', e)}
            onTitleClick={() => handleTextBlockClick('title')}
            selectedTitleBlock={selectedTextBlock === 'title'}
            isTitleDragging={isDragging === 'title'}
            duration={duration}
            selection={selection}
            onSelectionChange={(start, end) => setSelection({ start, end })}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            onCut={handleCut}
            onFullscreen={handleFullscreen}
            onZoomChange={setZoom}
            showRightSlider={showRightSlider}
            onCloseRightSlider={() => {
              setSelectedTextBlock(null);
              setShowRightSlider(false);
            }}
            onConfigUpdate={handleConfigUpdate}
            onTitleConfigUpdate={handleTitleConfigUpdate}
            onTitleTextChange={setTitleText}
          />

          {/* Template Modal */}
          {isTemplateModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
              <div className="bg-background w-[95vw] max-w-5xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                <div className="w-full md:w-64 bg-muted/40 border-r p-4 space-y-2">
                  <h3 className="text-base font-semibold mb-2">{t("editor.customTemplate")}</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'layout', label: t("editor.modal.layout") },
                      { key: 'text', label: t("editor.modal.text") },
                      { key: 'background', label: t("editor.modal.background") },
                      { key: 'logo', label: t("editor.modal.logo") },
                      { key: 'outro', label: t("editor.modal.outro") }
                    ].map(item => (
                      <button key={item.key} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted">
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 p-4 overflow-auto">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">{t("editor.templateName")}</label>
                      <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder={t("editor.templateNamePlaceholder")} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t("editor.modal.layout")}</label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {(["auto", "fill", "fit", "other"] as const).map(k => (
                          <button key={k} onClick={() => setTemplateLayout(k)} className={`px-3 py-2 rounded-md border ${templateLayout === k ? "bg-primary text-primary-foreground" : "bg-background"}`}>
                            {k[0].toUpperCase() + k.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={templateAutoPosition} onChange={(e) => setTemplateAutoPosition(e.target.checked)} />
                        <span className="text-sm">{t("editor.autoPosition")}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t("editor.textStyle")}</label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {allSubtitleStyles.slice(0, 6).map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setTemplateSubtitleStyle(style.id)}
                            className={`h-16 rounded-md border text-xs px-2 ${templateSubtitleStyle === style.id ? "ring-2 ring-primary" : ""}`}
                          >
                            {style.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">{t("editor.headlineColor")}</label>
                        <Input type="color" value={templateHeadlineColor} onChange={(e) => setTemplateHeadlineColor(e.target.value)} className="mt-1 h-9 p-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("editor.subtitleColor")}</label>
                        <Input type="color" value={templateSubtitleColor} onChange={(e) => setTemplateSubtitleColor(e.target.value)} className="mt-1 h-9 p-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t("editor.backgroundColor")}</label>
                      <Input value={templateBackground} onChange={(e) => setTemplateBackground(e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-3">
                    <div className="mx-auto aspect-[9/16] rounded-xl overflow-hidden flex items-center justify-center" style={{ background: templateBackground }}>
                      <div className="w-[85%] h-[85%] relative">
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-2 bg-yellow-400 text-black text-xs rounded font-bold">{t("editor.title")}</div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/80 text-white text-xs rounded font-bold">{t("editor.subtitle")}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-full flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => setTemplateModalOpen(false)}>{t("editor.cancel")}</Button>
                    <Button onClick={() => {
                      setSelectedSubtitleStyleId(templateSubtitleStyle || 'style-1');
                      setSelectedBackground(templateBackground);
                      setTemplateModalOpen(false);
                    }}>{t("editor.save")}</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <MobileLayout
          videoRef={videoRef}
          containerRef={containerRef}
          videoUrl={videoUrl}
          posterUrl={posterUrl}
          selectedSubtitleStyleId={selectedSubtitleStyleId}
          selectedBackground={selectedBackground}
          zoom={zoom}
          videoAspectRatio={videoAspectRatio}
          isPlaying={isPlaying}
          onTimeUpdate={setCurrentTime}
          onDurationChange={setDuration}
          onPlayPause={handlePlayPause}
          onReplay={handleReplay}
          isDragging={isDragging}
          isResizing={isResizing}
          headlinePosition={headlinePosition}
          subtitlePosition={subtitlePosition}
          headlineSize={headlineSize}
          subtitleSize={subtitleSize}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          onResizeStart={handleResizeStart}
          onResizeEnd={handleResizeEnd}
          selectedTextBlock={selectedTextBlock}
          onTextBlockClick={handleTextBlockClick}
          headlineStyles={headlineStyles}
          subtitleStyles={subtitleStyles}
          subtitleSegments={subtitleData}
          subtitleConfig={subtitleConfig}
          useWordByWordSubtitles={useWordByWordSubtitles}
          currentTime={currentTime}
          wordSubtitlePosition={wordSubtitlePosition}
          onWordSubtitleDragStart={(e) => handleDragStart('wordSubtitle', e)}
          titleText={titleText}
          showTitle={isTitleVisible}
          titleConfig={titleConfig}
          titlePosition={titlePosition}
          onTitleDragStart={(e) => handleDragStart('title', e)}
          onTitleClick={() => handleTextBlockClick('title')}
          selectedTitleBlock={selectedTextBlock === 'title'}
          isTitleDragging={isDragging === 'title'}
          onTitleConfigUpdate={handleTitleConfigUpdate}
          onTitleTextChange={setTitleText}
          duration={duration}
          onSeek={handleSeek}
          selection={selection}
          onSelectionChange={(start, end) => setSelection({ start, end })}
          playbackSpeed={playbackSpeed}
          onSpeedChange={setPlaybackSpeed}
          onCut={handleCut}
          onFullscreen={handleFullscreen}
          onZoomChange={setZoom}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          selectedTemplate={selectedTemplate}
          onTemplateChange={(templateId, styleId) => {
            setSelectedTemplate(templateId);
            if (styleId) {
              setSelectedSubtitleStyleId(styleId);
              // Hide title when "No Text" (blank) style is selected
              setShowTitle(styleId !== 'blank');
            }
          }}
          onConfigUpdate={handleConfigUpdate}
        />
      )}


      {/* Custom Template Modal */}
      <CustomTemplateModal
        isOpen={isCustomTemplateModalOpen}
        onClose={() => setCustomTemplateModalOpen(false)}
        onSave={handleSaveCustomTemplate}
        selectedSubtitleStyleId={selectedSubtitleStyleId}
      />
    </div>
  );
};

const Editor = () => (
  <HeaderConfigProvider>
    <EditorContent />
  </HeaderConfigProvider>
);

export default Editor;
