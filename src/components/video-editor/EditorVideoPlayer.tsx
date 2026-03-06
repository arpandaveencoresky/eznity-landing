import { forwardRef, useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BaseVideoPlayer, DESIGN_WIDTH, DESIGN_HEIGHT } from "./BaseVideoPlayer";
import DraggableTextBlock from "./DraggableTextBlock";
import SubtitleOverlay from "./SubtitleOverlay";
import TitleOverlay from "./TitleOverlay";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { SubtitleSegment, SubtitleConfig, TitleConfig } from "@/types/subtitle";

interface EditorVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  subtitle?: string;
  subtitleStyleId?: string;
  background: string;
  textStyle?: string;
  zoom: number;
  aspectRatio?: string;
  isPlaying?: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause?: () => void;
  onReplay?: () => void;
  // Editor-specific props
  isDragging?: string | null;
  isResizing?: string | null;
  headlinePosition?: { x: number; y: number };
  subtitlePosition?: { x: number; y: number };
  headlineSize?: { width: number; height: number };
  subtitleSize?: { width: number; height: number };
  onDragStart?: (element: string, e: React.MouseEvent) => void;
  onDragEnd?: () => void;
  onDragMove?: (e: React.MouseEvent, element: string) => void;
  onResizeStart?: (element: string, direction: string, e: React.MouseEvent) => void;
  onResizeEnd?: () => void;
  selectedTextBlock?: string | null;
  onTextBlockClick?: (type: 'headline' | 'subtitle') => void;
  // Text styling props
  headlineStyles?: {
    textColor: string;
    backgroundColor: string;
    backgroundOpacity: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    textShadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
    textStroke: { enabled: boolean; color: string; width: number };
    textAlign: string;
    borderRadius: number;
  };
  subtitleStyles?: {
    textColor: string;
    backgroundColor: string;
    backgroundOpacity: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    textShadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
    textStroke: { enabled: boolean; color: string; width: number };
    textAlign: string;
    borderRadius: number;
  };
  // Word-by-word subtitle system
  subtitleSegments?: SubtitleSegment[];
  subtitleConfig?: Partial<SubtitleConfig>;
  useWordByWordSubtitles?: boolean;
  currentTime?: number;
  wordSubtitlePosition?: { x: number; y: number; centered?: boolean };
  onWordSubtitleDragStart?: (e: React.MouseEvent) => void;
  // Title block system
  titleText?: string;
  showTitle?: boolean;
  titleConfig?: Partial<TitleConfig>;
  titlePosition?: { x: number; y: number; centered?: boolean };
  onTitleDragStart?: (e: React.MouseEvent) => void;
  onTitleClick?: () => void;
  selectedTitleBlock?: boolean;
  isTitleDragging?: boolean;
}

/**
 * EditorVideoPlayer - Enhanced video player with editing capabilities.
 * Wraps BaseVideoPlayer and adds drag/resize functionality for text overlays.
 * Use this component in the Editor page for interactive video editing.
 */
export const EditorVideoPlayer = forwardRef<HTMLVideoElement, EditorVideoPlayerProps>(
  (
    {
      videoUrl,
      posterUrl,
      subtitle,
      subtitleStyleId,
      background,
      zoom,
      aspectRatio = "9:16",
      isPlaying = false,
      onTimeUpdate,
      onDurationChange,
      onPlayPause,
      onReplay,
      isDragging,
      isResizing,
      headlinePosition = { x: 50, y: 20 },
      subtitlePosition = { x: 50, y: 80 },
      headlineSize = { width: 200, height: 40 },
      subtitleSize = { width: 200, height: 40 },
      onDragStart,
      onDragEnd,
      onDragMove,
      onResizeStart,
      onResizeEnd,
      selectedTextBlock = null,
      onTextBlockClick,
      headlineStyles,
      subtitleStyles,
      subtitleSegments,
      subtitleConfig,
      useWordByWordSubtitles = false,
      currentTime = 0,
      wordSubtitlePosition,
      onWordSubtitleDragStart,
      // Title props
      titleText = "",
      showTitle = false,
      titleConfig,
      titlePosition,
      onTitleDragStart,
      onTitleClick,
      selectedTitleBlock = false,
      isTitleDragging = false,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayContainerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [overlayScale, setOverlayScale] = useState(1);

    // Convert aspect ratio string (e.g., "9:16") to CSS format (e.g., "9/16")
    const cssAspectRatio = aspectRatio.replace(":", "/");

    // Calculate scale factor for overlays
    const calculateScale = useCallback(() => {
      if (!overlayContainerRef.current) return;
      const rect = overlayContainerRef.current.getBoundingClientRect();
      const scale = rect.width / DESIGN_WIDTH;
      setOverlayScale(scale);
    }, []);

    useEffect(() => {
      calculateScale();
      
      const resizeObserver = new ResizeObserver(calculateScale);
      if (overlayContainerRef.current) {
        resizeObserver.observe(overlayContainerRef.current);
      }
      
      return () => resizeObserver.disconnect();
    }, [calculateScale]);

    // Apply zoom transform
    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.style.transform = `scale(${zoom / 100})`;
      }
    }, [zoom]);

    const handlePlayPauseClick = () => {
      if (onPlayPause) {
        onPlayPause();
      } else if (ref && typeof ref === 'object' && ref.current) {
        if (isPlaying) {
          ref.current.pause();
        } else {
          ref.current.play().catch(() => {});
        }
      }
    };

    const handleReplay = () => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.currentTime = 0;
        ref.current.play();
        onReplay?.();
      }
    };

    const handleMute = () => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    // Helper: clamp a numeric value
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    // Compute headline font size
    const isHeadlineTwoLines = (headlineSize?.height ?? 0) > 50;
    const padding = 8;
    const availableHeight = Math.max(0, (headlineSize?.height ?? 0) - padding);
    const availableWidth = Math.max(0, (headlineSize?.width ?? 0) - padding);
    const heightBasedFontSize = isHeadlineTwoLines ? availableHeight / 2 : availableHeight;
    const widthBasedFontSize = availableWidth / 10;
    const headlineFontComputed = clamp(
      Math.min(heightBasedFontSize, widthBasedFontSize),
      4,
      24
    );

    // Compute subtitle font size
    const isSubtitleTwoLines = (subtitleSize?.height ?? 0) > 40;
    const subAvailableHeight = Math.max(0, (subtitleSize?.height ?? 0) - 8);
    const subAvailableWidth = Math.max(0, (subtitleSize?.width ?? 0) - 8);
    const subHeightBased = isSubtitleTwoLines ? subAvailableHeight / 2 : subAvailableHeight;
    const subWidthBased = subAvailableWidth / 10;
    const subtitleFontComputed = clamp(
      Math.min(subHeightBased, subWidthBased),
      4,
      18
    );

    return (
      <div id="video-player" className="relative w-full h-full flex items-center justify-center overflow-hidden video-container">
        <div
          ref={containerRef}
          className="relative video-content"
          style={{ aspectRatio: cssAspectRatio, height: "85%", maxHeight: "100%", willChange: 'transform' }}
        >
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background: background || "linear-gradient(to bottom right, #1f2937, #000000)",
            }}
          >
            {/* Poster Image - Show until video loads */}
            {posterUrl && !videoLoaded && (
              <div className="absolute inset-0 z-10">
                <img 
                  src={posterUrl} 
                  alt="Video poster" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="text-white text-sm bg-black/50 px-4 py-2 rounded">
                    Loading video...
                  </div>
                </div>
              </div>
            )}

            <video
              ref={ref}
              src={videoUrl}
              className="w-full h-full object-cover"
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
              onDurationChange={(e) => onDurationChange(e.currentTarget.duration)}
              onLoadedData={() => setVideoLoaded(true)}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              preload="metadata"
              playsInline
              autoPlay={false}
              muted={false}
            />

            {/* Video Controls Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-4 bg-black/50 rounded-full px-6 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayPauseClick}
                  className="h-12 w-12 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMute}
                  className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReplay}
                  className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scaled Overlay Container - All overlays are rendered at DESIGN_WIDTH x DESIGN_HEIGHT
                and scaled down to fit the actual container. This ensures pixel values in styles
                match the backend rendering at 1080x1920. */}
            <div 
              ref={overlayContainerRef}
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ zIndex: 20 }}
            >
          <div 
            className="scaled-overlay-inner"
            style={{
              width: DESIGN_WIDTH,
              height: DESIGN_HEIGHT,
              transform: `scale(${overlayScale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
                  pointerEvents: 'auto'
                }}
              >
                {/* Title overlay - positioned at top, no word highlighting */}
                {showTitle && titleText && (
                  <TitleOverlay
                    text={titleText}
                    config={titleConfig}
                    videoWidth={DESIGN_WIDTH}
                    videoHeight={DESIGN_HEIGHT}
                    onClick={onTitleClick}
                    selected={selectedTitleBlock}
                    isDragging={isTitleDragging}
                    onDragStart={onTitleDragStart}
                    position={titlePosition}
                    visible={showTitle}
                  />
                )}

                {/* Headline overlay (if not using word-by-word subtitles) */}
                {!useWordByWordSubtitles && headlineStyles && (
                  <DraggableTextBlock
                    id="headline"
                    text="HERE IS A LINE OF HEADLINE"
                    position={headlinePosition}
                    size={headlineSize}
                    styles={{
                      textColor: headlineStyles.textColor,
                      backgroundColor: headlineStyles.backgroundColor,
                      backgroundOpacity: headlineStyles.backgroundOpacity,
                      fontFamily: headlineStyles.fontFamily,
                      fontWeight: headlineStyles.fontWeight,
                      fontStyle: headlineStyles.fontStyle,
                      textDecoration: headlineStyles.textDecoration,
                      textShadow: headlineStyles.textShadow,
                      textStroke: headlineStyles.textStroke,
                      textAlign: headlineStyles.textAlign,
                      borderRadius: headlineStyles.borderRadius,
                    }}
                    selected={selectedTextBlock === 'headline'}
                    isDragging={isDragging === 'headline'}
                    isResizing={isResizing === 'headline'}
                    computedFontSize={headlineFontComputed}
                    onDragStart={(id, e) => onDragStart?.(id, e)}
                    onResizeStart={(id, dir, e) => onResizeStart?.(id, dir, e)}
                    onClick={() => onTextBlockClick?.('headline')}
                  />
                )}

                {/* Subtitle System: New word-by-word overlay OR old draggable subtitle */}
                {useWordByWordSubtitles && subtitleSegments && subtitleSegments.length > 0 ? (
                  // New: Word-by-word subtitle overlay (backend format) - draggable in editor
                  <SubtitleOverlay
                    currentTime={currentTime}
                    segments={subtitleSegments}
                    config={subtitleConfig}
                    videoWidth={DESIGN_WIDTH}
                    videoHeight={DESIGN_HEIGHT}
                    styleId={subtitleStyleId}
                    onClick={() => onTextBlockClick?.('subtitle')}
                    selected={selectedTextBlock === 'subtitle'}
                    isDragging={isDragging === 'wordSubtitle'}
                    onDragStart={onWordSubtitleDragStart}
                    position={wordSubtitlePosition}
                  />
                ) : (
                  // Old: Draggable and Resizable Subtitle Overlay (for templates)
                  subtitle && (
                    <DraggableTextBlock
                      id="subtitle"
                      text={subtitle}
                      position={subtitlePosition}
                      size={subtitleSize}
                      styles={{
                        textColor: subtitleStyles?.textColor || '#ffffff',
                        backgroundColor: subtitleStyles?.backgroundColor || '#000000',
                        backgroundOpacity: subtitleStyles?.backgroundOpacity || 100,
                        fontFamily: subtitleStyles?.fontFamily || 'Arial, sans-serif',
                        fontWeight: subtitleStyles?.fontWeight || 'normal',
                        fontStyle: subtitleStyles?.fontStyle || 'normal',
                        textDecoration: subtitleStyles?.textDecoration || 'none',
                        textShadow: subtitleStyles?.textShadow || { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
                        textStroke: subtitleStyles?.textStroke || { enabled: false, color: '#000', width: 0 },
                        textAlign: subtitleStyles?.textAlign || 'center',
                        borderRadius: subtitleStyles?.borderRadius || 0,
                      }}
                      selected={selectedTextBlock === 'subtitle'}
                      isDragging={isDragging === 'subtitle'}
                      isResizing={isResizing === 'subtitle'}
                      computedFontSize={subtitleFontComputed}
                      onDragStart={(id, e) => onDragStart?.(id, e)}
                      onResizeStart={(id, dir, e) => onResizeStart?.(id, dir, e)}
                      onClick={() => onTextBlockClick?.('subtitle')}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

EditorVideoPlayer.displayName = "EditorVideoPlayer";

