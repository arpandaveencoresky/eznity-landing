import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize } from "lucide-react";

interface ReelVideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onFullscreen: () => void;
}

export const ReelVideoControls = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onFullscreen,
}: ReelVideoControlsProps) => {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div className="w-full bg-black/90 backdrop-blur-sm">
      {/* Progress Bar - Line over controls */}
      <div 
        className="w-full h-1.5 bg-white/20 cursor-pointer hover:h-2 transition-all"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-white transition-all"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="h-10 w-10 text-white hover:bg-white/20 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          {/* Time Display */}
          <div className="flex items-center gap-1 text-sm text-white/90 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/50">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onFullscreen}
          className="h-10 w-10 text-white hover:bg-white/20 rounded-full"
        >
          <Maximize className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

