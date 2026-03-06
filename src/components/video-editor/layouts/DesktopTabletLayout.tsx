import { DeviceType } from "@/hooks/use-device";
import { responsiveSpacing } from "@/utils/responsive";
import { EditorSidebar } from "./EditorSidebar";
import { EditorLeftPanel } from "./EditorLeftPanel";
import { EditorVideoPlayer } from "../EditorVideoPlayer";
import { Timeline } from "../Timeline";
import { VideoControls } from "../VideoControls";
import { TextEditorPanel } from "../TextEditorPanel";
import { SubtitleSegment, SubtitleConfig, TitleConfig } from "@/types/subtitle";

interface DesktopTabletLayoutProps {
  // Device info
  deviceType: DeviceType;
  isTablet: boolean;
  
  // Sidebar & Panel
  menuItems: Array<{ id: string; icon: React.ComponentType<{ className?: string }> }>;
  activePanel: "subtitles" | "text" | "templates" | "background";
  onPanelChange: (panelId: string) => void;
  onBack?: () => void;
  
  // Subtitle data
  subtitleSegments: SubtitleSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  selectedTemplate: string | null;
  selectedSubtitleStyleId: string;
  onTemplateChange: (templateId: string, styleId?: string) => void;
  
  // Video player props
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  videoUrl: string;
  posterUrl?: string;
  selectedBackground: string;
  zoom: number;
  videoAspectRatio: string;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: () => void;
  onReplay: () => void;
  
  // Drag & resize
  isDragging: string | null;
  isResizing: string | null;
  headlinePosition: { x: number; y: number };
  subtitlePosition: { x: number; y: number };
  headlineSize: { width: number; height: number };
  subtitleSize: { width: number; height: number };
  onDragStart: (element: string, e: React.MouseEvent) => void;
  onDragEnd: () => void;
  onDragMove: (e: React.MouseEvent, element: string) => void;
  onResizeStart: (element: string, direction: string, e: React.MouseEvent) => void;
  onResizeEnd: () => void;
  
  // Text blocks
  selectedTextBlock: string | null;
  onTextBlockClick: (type: 'headline' | 'subtitle') => void;
  headlineStyles: any;
  subtitleStyles: any;
  
  // Word-by-word subtitles
  subtitleConfig: SubtitleConfig;
  useWordByWordSubtitles: boolean;
  wordSubtitlePosition: { x: number; y: number; centered: boolean };
  onWordSubtitleDragStart: (e: React.MouseEvent) => void;
  
  // Title block
  titleText?: string;
  showTitle?: boolean;
  titleConfig?: TitleConfig;
  titlePosition?: { x: number; y: number; centered: boolean };
  onTitleDragStart?: (e: React.MouseEvent) => void;
  onTitleClick?: () => void;
  selectedTitleBlock?: boolean;
  isTitleDragging?: boolean;
  
  // Timeline & Controls
  duration: number;
  selection: { start: number; end: number } | null;
  onSelectionChange: (start: number, end: number) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onCut: () => void;
  onFullscreen: () => void;
  onZoomChange?: (zoom: number) => void;
  
  // Right Panel (Text Editor)
  showRightSlider?: boolean;
  onCloseRightSlider?: () => void;
  onConfigUpdate?: (config: SubtitleConfig) => void;
  onTitleConfigUpdate?: (config: TitleConfig) => void;
  onTitleTextChange?: (text: string) => void;
}

export const DesktopTabletLayout = ({
  deviceType,
  isTablet,
  menuItems,
  activePanel,
  onPanelChange,
  subtitleSegments,
  currentTime,
  onSeek,
  selectedTemplate,
  selectedSubtitleStyleId,
  onTemplateChange,
  videoRef,
  containerRef,
  videoUrl,
  posterUrl,
  selectedBackground,
  zoom,
  videoAspectRatio,
  isPlaying,
  onTimeUpdate,
  onDurationChange,
  onPlayPause,
  onReplay,
  isDragging,
  isResizing,
  headlinePosition,
  subtitlePosition,
  headlineSize,
  subtitleSize,
  onDragStart,
  onDragEnd,
  onDragMove,
  onResizeStart,
  onResizeEnd,
  selectedTextBlock,
  onTextBlockClick,
  headlineStyles,
  subtitleStyles,
  subtitleConfig,
  useWordByWordSubtitles,
  wordSubtitlePosition,
  onWordSubtitleDragStart,
  // Title props
  titleText,
  showTitle,
  titleConfig,
  titlePosition,
  onTitleDragStart,
  onTitleClick,
  selectedTitleBlock,
  isTitleDragging,


  duration,
  selection,
  onSelectionChange,
  playbackSpeed,
  onSpeedChange,
  onCut,
  onFullscreen,
  onZoomChange,
  onBack,
  showRightSlider = false,
  onCloseRightSlider,
  onConfigUpdate,
  onTitleConfigUpdate,
  onTitleTextChange,
}: DesktopTabletLayoutProps) => {
  const sidebarMargin = isTablet
    ? responsiveSpacing.margin.sidebar.tablet
    : responsiveSpacing.margin.sidebar.desktop;
  
  const leftPanelMargin = isTablet
    ? responsiveSpacing.margin.leftPanel.tablet
    : responsiveSpacing.margin.leftPanel.desktop;
  
  const videoPadding = isTablet ? 'p-3' : 'p-4';

  return (
    <div className="flex-1 flex">
      {/* Left Sidebar */}
      <EditorSidebar
        menuItems={menuItems}
        activePanel={activePanel}
        onPanelChange={onPanelChange}
        deviceType={deviceType}
        isTablet={isTablet}
      />

      {/* Right Side: content row (left panel + main editor) stacked above full-width timeline */}
      <div 
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: sidebarMargin }}
      >
        {/* Content row */}
        <div className="flex min-h-0 flex-1">
          {/* Left Panel */}
          <EditorLeftPanel
            activePanel={activePanel}
            subtitleSegments={subtitleSegments}
            currentTime={currentTime}
            onSeek={onSeek}
            selectedTemplate={selectedTemplate}
            selectedSubtitleStyleId={selectedSubtitleStyleId}
            onTemplateChange={onTemplateChange}
            deviceType={deviceType}
            isTablet={isTablet}
            // onBack={onBack}
          />

          {/* Main Editor Area - shrinks when right panel is open */}
          <div
            className="flex-1 flex flex-col bg-muted/20 min-h-0 min-w-0 relative transition-all duration-300 ease-in-out"
            style={{ 
              marginLeft: leftPanelMargin, 
              height: 'calc(100vh - 200px)',
            }}
          >
            {/* Video Preview */}
            <div ref={containerRef} className={`flex-1 flex items-center justify-center w-full h-full ${videoPadding} min-w-0`}>
              <EditorVideoPlayer
                ref={videoRef}
                videoUrl={videoUrl}
                posterUrl={posterUrl}
                subtitle=""
                subtitleStyleId={selectedSubtitleStyleId}
                background={selectedBackground}
                zoom={zoom}
                aspectRatio={videoAspectRatio}
                isPlaying={isPlaying}
                onTimeUpdate={onTimeUpdate}
                onDurationChange={onDurationChange}
                onPlayPause={onPlayPause}
                onReplay={onReplay}
                isDragging={isDragging}
                isResizing={isResizing}
                headlinePosition={headlinePosition}
                subtitlePosition={subtitlePosition}
                headlineSize={headlineSize}
                subtitleSize={subtitleSize}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragMove={onDragMove}
                onResizeStart={onResizeStart}
                onResizeEnd={onResizeEnd}
                selectedTextBlock={selectedTextBlock}
                onTextBlockClick={onTextBlockClick}
                headlineStyles={headlineStyles}
                subtitleStyles={subtitleStyles}
                subtitleSegments={subtitleSegments}
                subtitleConfig={subtitleConfig}
                useWordByWordSubtitles={useWordByWordSubtitles}
                currentTime={currentTime}
                wordSubtitlePosition={wordSubtitlePosition}
                onWordSubtitleDragStart={onWordSubtitleDragStart}
                // Title props
                titleText={titleText}
                showTitle={showTitle}
                titleConfig={titleConfig}
                titlePosition={titlePosition}
                onTitleDragStart={onTitleDragStart}
                onTitleClick={onTitleClick}
                selectedTitleBlock={selectedTitleBlock}
                isTitleDragging={isTitleDragging}
              />
            </div>
          </div>

          {/* Right Panel (Text Editor) - pushes content when open */}
          <div 
            className="right-slider-panel border-l border-border bg-card flex flex-col flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
            style={{ 
              width: showRightSlider ? '320px' : '0px',
              height: 'calc(100vh - 80px)',
              opacity: showRightSlider ? 1 : 0,
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border min-w-[320px] flex-shrink-0">
              <h2 className="text-lg font-semibold">Edit Text Style</h2>
              <button
                onClick={onCloseRightSlider}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden min-w-[320px] min-h-0 h-full text-editor-panel">
              {showRightSlider && (
                <div className="h-full">
                  <TextEditorPanel
                    selectedTextBlock={selectedTextBlock as 'headline' | 'subtitle' | 'title' | null}
                    subtitleConfig={subtitleConfig}
                    onUpdateConfig={onConfigUpdate}
                    titleConfig={titleConfig}
                    onUpdateTitleConfig={onTitleConfigUpdate}
                    titleText={titleText}
                    onTitleTextChange={onTitleTextChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div
          className="bg-card border-t border-border p-2 fixed bottom-0 z-50 hidden md:block transition-all duration-300 ease-in-out"
          style={{ 
            left: sidebarMargin, 
            right: showRightSlider ? '320px' : '0' 
          }}
        >
          <VideoControls
            isPlaying={isPlaying}
            zoom={zoom}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={onPlayPause}
            onReplay={onReplay}
            onCut={onCut}
            onFullscreen={onFullscreen}
            onZoomChange={onZoomChange || (() => {})}
            playbackSpeed={playbackSpeed}
            onSpeedChange={onSpeedChange}
          />

          <div className="mt-3 lg:mt-4 relative w-full">
            <Timeline
              duration={duration}
              currentTime={currentTime}
              onSeek={onSeek}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

