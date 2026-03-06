import { forwardRef, useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import SubtitleOverlay from "./SubtitleOverlay";
import TitleOverlay from "./TitleOverlay";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { SubtitleSegment, SubtitleConfig, SubtitlePosition, TitleConfig, TitlePosition } from "@/types/subtitle";

// Base resolution for design - all px values in styles are designed for this resolution
// Backend renders at this resolution, frontend scales to fit container
export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;

interface BaseVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  subtitleStyleId?: string;
  background: string;
  zoom?: number;
  aspectRatio?: string;
  isPlaying?: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause?: () => void;
  onReplay?: () => void;
  // Word-by-word subtitle system
  subtitleSegments?: SubtitleSegment[];
  subtitleConfig?: Partial<SubtitleConfig>;
  currentTime?: number;
  wordSubtitlePosition?: SubtitlePosition;
  // Title system
  titleText?: string;
  titleConfig?: Partial<TitleConfig>;
  titleDuration?: number;
  titlePosition?: TitlePosition;
  showTitle?: boolean;
  // Optional: Show controls overlay
  showControls?: boolean;
  // Optional: Container ref for external access
  containerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * BaseVideoPlayer - Optimized video player component for display-only use cases.
 * Handles video playback and subtitle rendering without editing capabilities.
 * Use this component for:
 * - Video detail pages
 * - Preview screens
 * - Read-only video displays
 */
export const BaseVideoPlayer = forwardRef<HTMLVideoElement, BaseVideoPlayerProps>(
  (
    {
      videoUrl,
      posterUrl,
      subtitleStyleId,
      background,
      zoom = 100,
      aspectRatio = "9:16",
      isPlaying = false,
      onTimeUpdate,
      onDurationChange,
      onPlayPause,
      onReplay,
      subtitleSegments,
      subtitleConfig,
      currentTime = 0,
      wordSubtitlePosition = { x: 50, y: 80, centered: true },
      titleText = "",
      titleConfig,
      titleDuration = 5,
      titlePosition = { x: 50, y: 15, centered: true },
      showTitle = false,
      showControls = true,
      containerRef: externalContainerRef,
    },
    ref
  ) => {
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = externalContainerRef || internalContainerRef;
    const overlayContainerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showControlsOverlay, setShowControlsOverlay] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [overlayScale, setOverlayScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Convert aspect ratio string (e.g., "9:16") to CSS format (e.g., "9/16")
    const cssAspectRatio = aspectRatio.replace(":", "/");

    // Calculate scale factor based on actual container size vs design resolution
    const calculateScale = useCallback(() => {
      if (!overlayContainerRef.current) return;
      const rect = overlayContainerRef.current.getBoundingClientRect();
      const scale = rect.width / DESIGN_WIDTH;
      setOverlayScale(scale);
    }, []);

    // Recalculate scale on mount and resize
    useEffect(() => {
      calculateScale();
      
      const resizeObserver = new ResizeObserver(calculateScale);
      if (overlayContainerRef.current) {
        resizeObserver.observe(overlayContainerRef.current);
      }
      
      return () => resizeObserver.disconnect();
    }, [calculateScale]);

    // Handle fullscreen changes to show/hide native controls
    useEffect(() => {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isCurrentlyFullscreen);
        
        // Enable native controls when in fullscreen, disable when not
        if (ref && typeof ref === 'object' && ref.current) {
          if (isCurrentlyFullscreen) {
            ref.current.controls = true;
          } else {
            ref.current.controls = false;
          }
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }, [ref]);

    // Apply zoom transform
    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.style.transform = `scale(${zoom / 100})`;
      }
    }, [zoom, containerRef]);


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
              onMouseEnter={() => showControls && setShowControlsOverlay(true)}
              onMouseLeave={() => showControls && setShowControlsOverlay(false)}
              preload="metadata"
              playsInline
              autoPlay={false}
              muted={false}
            />

            {/* Video Controls Overlay */}
            {showControls && (
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControlsOverlay ? 'opacity-100' : 'opacity-0'}`}>
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
            )}

            {/* Scaled Overlay Container - Title and Subtitle rendering */}
            {(() => {
              // Title should show if: visible, has text, within duration, and has config OR position
              const hasTitleConfig = titleConfig && (Object.keys(titleConfig).length > 0 || titlePosition);
              const shouldShowTitle = showTitle && titleText && currentTime <= titleDuration && hasTitleConfig;
              // Subtitle should show if segments exist
              const shouldShowSubtitle = subtitleSegments && subtitleSegments.length > 0;
              const shouldRender = shouldShowTitle || shouldShowSubtitle;
              
              console.log('[BaseVideoPlayer] Rendering check:', {
                showTitle,
                titleText,
                currentTime,
                titleDuration,
                titleConfig: titleConfig ? Object.keys(titleConfig) : null,
                hasTitleConfig,
                subtitleSegments: subtitleSegments?.length || 0,
                subtitleConfig: subtitleConfig ? Object.keys(subtitleConfig) : null,
                shouldShowTitle,
                shouldShowSubtitle,
                shouldRender
              });
              
              return shouldRender ? (
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
                    }}
                  >
                    {/* Title overlay - shown during first few seconds */}
                    {shouldShowTitle && (
                      <TitleOverlay
                        text={titleText}
                        config={titleConfig}
                        videoWidth={DESIGN_WIDTH}
                        videoHeight={DESIGN_HEIGHT}
                        position={titlePosition}
                        visible={true}
                      />
                    )}
                    
                    {/* Word-by-word subtitle overlay */}
                    {shouldShowSubtitle && (
                      <SubtitleOverlay
                        currentTime={currentTime}
                        segments={subtitleSegments}
                        config={subtitleConfig}
                        videoWidth={DESIGN_WIDTH}
                        videoHeight={DESIGN_HEIGHT}
                        styleId={subtitleStyleId}
                        position={wordSubtitlePosition}
                      />
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    );
  }
);

BaseVideoPlayer.displayName = "BaseVideoPlayer";

