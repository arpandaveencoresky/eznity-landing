import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface VideoControlsProps {
  isPlaying: boolean;
  zoom: number;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onReplay: () => void;
  onCut: () => void; // kept for compatibility, no longer rendered
  onFullscreen: () => void; // kept for compatibility, no longer rendered
  onZoomChange: (zoom: number) => void;
  playbackSpeed: number; // kept for compatibility, no longer rendered
  onSpeedChange: (speed: number) => void; // kept for compatibility, no longer rendered
  showZoom?: boolean;
}

export const VideoControls = ({
  isPlaying,
  zoom,
  currentTime,
  duration,
  onPlayPause,
  onReplay,
  onCut,          // unused in UI
  onFullscreen,   // unused in UI
  onZoomChange,
  playbackSpeed,  // unused in UI
  onSpeedChange,  // unused in UI
  showZoom = true,
}: VideoControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Left: Zoom Options - hidden when showZoom=false (e.g., on mobile) */}
      {showZoom && (
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(50, zoom - 10))} title="Zoom Out" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-32">
            <Slider value={[zoom]} onValueChange={(value) => onZoomChange(value[0])} min={50} max={200} step={10} className="w-full" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(200, zoom + 10))} title="Zoom In" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono w-12 text-center">{zoom}%</span>
        </div>
      )}

      {/* Center: Play Section with Timing */}
      <div className="flex items-center gap-3 w-full justify-center mr-[-40px]">
        <div className="text-sm font-mono min-w-[4rem]">{formatTime(currentTime)}</div>
        <Button variant="ghost" size="icon" onClick={onPlayPause} className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <div className="text-sm font-mono min-w-[4rem]">{formatTime(duration)}</div>
      </div>

      {/* Right: Replay only (trim, speed, download removed) */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onReplay} title="Replay" className="h-8 w-8">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
