import { DeviceType } from "@/hooks/use-device";
import { responsiveSizing, responsiveSpacing } from "@/utils/responsive";
import { SubtitleTemplateSelector } from "@/components/video-editor/SubtitleTemplateSelector";
import { SubtitleSegment } from "@/types/subtitle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditorLeftPanelProps {
  activePanel: "subtitles" | "text" | "templates" | "background";
  subtitleSegments: SubtitleSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  selectedTemplate: string | null;
  selectedSubtitleStyleId: string;
  onTemplateChange: (templateId: string, styleId?: string) => void;
  deviceType: DeviceType;
  isTablet: boolean;
  onBack?: () => void;
}

export const EditorLeftPanel = ({
  activePanel,
  subtitleSegments,
  currentTime,
  onSeek,
  selectedTemplate,
  selectedSubtitleStyleId,
  onTemplateChange,
  deviceType,
  isTablet,
  onBack,
}: EditorLeftPanelProps) => {
  const panelWidth = isTablet
    ? responsiveSizing.leftPanel.width.tablet
    : responsiveSizing.leftPanel.width.desktop;
  
  const panelLeft = isTablet
    ? responsiveSizing.leftPanel.left.tablet
    : responsiveSizing.leftPanel.left.desktop;
  
  const padding = isTablet
    ? responsiveSpacing.padding.tablet
    : responsiveSpacing.padding.desktop;
  
  const headingSize = isTablet
    ? responsiveSizing.text.heading.tablet
    : responsiveSizing.text.heading.desktop;
  
  const bodySize = isTablet
    ? responsiveSizing.text.body.tablet
    : responsiveSizing.text.body.desktop;

  return (
    <div
      className={`hidden md:flex ${panelWidth} ${panelLeft} border-r border-border bg-card flex-col fixed z-40`}
      style={{ top: '80px', height: 'calc(100vh - 80px)' }}
    >
      <div className={`${padding} border-b border-border`}>
        {onBack && (
          <div className="mb-3">
            <Button
              variant="ghost"
              className="-ml-2 text-muted-foreground hover:text-foreground"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}
        <h3 className={`font-semibold mb-3 capitalize ${headingSize}`}>
          {activePanel}
        </h3>
      </div>

      <div className={`flex-1 overflow-y-auto ${padding}`}>
        {activePanel === "subtitles" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-3">
              Subtitle segments from video
            </p>
            
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {subtitleSegments.map((segment) => (
                <div
                  key={segment.id}
                  className={`${isTablet ? 'p-2' : 'p-2 lg:p-3'} border rounded-lg hover:border-primary cursor-pointer transition-colors ${
                    currentTime >= segment.start && currentTime < segment.end
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => onSeek(segment.start)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1).padStart(4, '0')} - {Math.floor(segment.end / 60)}:{(segment.end % 60).toFixed(1).padStart(4, '0')}
                    </p>
                  </div>
                  <p className={bodySize}>{segment.text}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {segment.words.length} words
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePanel === "templates" && (
          <div className="space-y-4">
            <div className="subtitle-template-selector-vertical">
              <SubtitleTemplateSelector
                selectedTemplateId={selectedTemplate || ''}
                selectedStyleId={selectedSubtitleStyleId}
                onTemplateChange={onTemplateChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

