import { useTranslation } from "react-i18next";
import { EditorVideoPlayer } from "../EditorVideoPlayer";
import { Timeline } from "../Timeline";
import { VideoControls } from "../VideoControls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubtitleTemplateSelector } from "@/components/video-editor/SubtitleTemplateSelector";
import { TextEditorPanel } from "../TextEditorPanel";
import { SubtitleSegment, SubtitleConfig, TitleConfig } from "@/types/subtitle";

interface MobileLayoutProps {
  // Video player props
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  videoUrl: string;
  posterUrl?: string;
  selectedSubtitleStyleId: string;
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
  onTextBlockClick: (type: 'headline' | 'subtitle' | 'title') => void;
  headlineStyles: any;
  subtitleStyles: any;
  
  // Word-by-word subtitles
  subtitleSegments: SubtitleSegment[];
  subtitleConfig: SubtitleConfig;
  useWordByWordSubtitles: boolean;
  currentTime: number;
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
  onTitleConfigUpdate?: (config: TitleConfig) => void;
  onTitleTextChange?: (text: string) => void;
  
  // Timeline & Controls
  duration: number;
  onSeek: (time: number) => void;
  selection: { start: number; end: number } | null;
  onSelectionChange: (start: number, end: number) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  onCut: () => void;
  onFullscreen: () => void;
  onZoomChange: (zoom: number) => void;
  
  // Panels
  activePanel: "subtitles" | "text" | "templates" | "background";
  onPanelChange: (panel: "subtitles" | "text" | "templates" | "background") => void;
  selectedTemplate: string | null;
  onTemplateChange: (templateId: string, styleId?: string) => void;
  onConfigUpdate: (config: SubtitleConfig) => void;
}

export const MobileLayout = ({
  videoRef,
  containerRef,
  videoUrl,
  posterUrl,
  selectedSubtitleStyleId,
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
  subtitleSegments,
  subtitleConfig,
  useWordByWordSubtitles,
  currentTime,
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
  onTitleConfigUpdate,
  onTitleTextChange,
  duration,
  onSeek,
  selection,
  onSelectionChange,
  playbackSpeed,
  onSpeedChange,
  onCut,
  onFullscreen,
  onZoomChange,
  activePanel,
  onPanelChange,
  selectedTemplate,
  onTemplateChange,
  onConfigUpdate,
}: MobileLayoutProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex-1 flex flex-col md:hidden">
      {/* Video + controls + bottom panels */}
      <div className="flex-1 flex flex-col bg-muted/20">
        {/* Video area at top */}
        <div ref={containerRef} className="w-full px-3 pt-3 pb-1">
          <div className="w-full max-w-md mx-auto aspect-[9/16]">
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

        {/* Timeline sits directly under video on mobile */}
        <div className="bg-card border-t border-border px-2 pt-1 pb-2">
          <Timeline
            duration={duration}
            currentTime={currentTime}
            onSeek={onSeek}
            onSelectionChange={onSelectionChange}
          />
        </div>

        {/* Player controls under timeline */}
        <div className="bg-card border-t border-border px-2 pt-2 pb-1">
          <VideoControls
            isPlaying={isPlaying}
            zoom={zoom}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={onPlayPause}
            onReplay={onReplay}
            onCut={onCut}
            onFullscreen={onFullscreen}
            onZoomChange={onZoomChange}
            playbackSpeed={playbackSpeed}
            onSpeedChange={onSpeedChange}
            showZoom={false}
          />
        </div>

        {/* Tabs and panels below controls */}
        <div className="bg-card border-t border-border flex-1 flex flex-col">
          {/* Tabs bar */}
          <div className="px-3 pt-2 pb-1 border-b border-border">
            <Tabs
              value={activePanel}
              onValueChange={(val) => onPanelChange(val as typeof activePanel)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full h-9 bg-muted/40">
                <TabsTrigger value="templates" className="text-xs">{t("editor.templates")}</TabsTrigger>
                <TabsTrigger value="subtitles" className="text-xs">{t("editor.subtitles")}</TabsTrigger>
                <TabsTrigger value="text" className="text-xs">{t("editor.text")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab content */}
          {activePanel === "templates" && (
            <div className="p-3 flex-1 overflow-y-auto">
              <SubtitleTemplateSelector
                selectedTemplateId={selectedTemplate || ''}
                selectedStyleId={selectedSubtitleStyleId}
                onTemplateChange={onTemplateChange}
              />
            </div>
          )}

          {activePanel === "subtitles" && (
            <div className="p-3 flex-1 overflow-y-auto">
              <p className="text-[11px] text-muted-foreground mb-2">
                Subtitle segments from video
              </p>
              <div className="space-y-2">
                {subtitleSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className={`p-2 border rounded-lg hover:border-primary cursor-pointer transition-colors ${
                      currentTime >= segment.start && currentTime < segment.end
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => onSeek(segment.start)}
                  >
                    <p className="text-[11px] text-muted-foreground mb-1">
                      {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1).padStart(4, '0')} - {Math.floor(segment.end / 60)}:{(segment.end % 60).toFixed(1).padStart(4, '0')}
                    </p>
                    <p className="text-xs">{segment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === "text" && (
            <div className="p-2 flex-1 overflow-y-auto border-t border-border">
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
  );
};

