import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BaseVideoPlayer } from "@/components/video-editor/BaseVideoPlayer";
import { ReelVideoControls } from "@/components/video-editor/ReelVideoControls";
import { useDevice } from "@/hooks/use-device";
import { Button } from "@/components/ui/button";
import { X, Instagram, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PublishedReel {
  id: string;
  platform: "instagram" | "youtube" | string;
  platformName: string;
  publishedDate: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

interface PublishedReelPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publishedReel: PublishedReel | null;
}

export const PublishedReelPreview = ({
  open,
  onOpenChange,
  publishedReel,
}: PublishedReelPreviewProps) => {
  const { t } = useTranslation();
  const { isMobile } = useDevice();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset video state when preview opens/closes
  useEffect(() => {
    if (!open) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [open]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleFullscreen = () => {
    const videoContainer = containerRef.current;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      // Enable native controls when entering fullscreen
      if (videoRef.current) {
        videoRef.current.controls = true;
      }
    } else {
      document.exitFullscreen();
      // Disable native controls when exiting fullscreen
      if (videoRef.current) {
        videoRef.current.controls = false;
      }
    }
  };

  // Listen for fullscreen changes to handle controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      
      // Enable/disable native controls based on fullscreen state
      if (videoRef.current) {
        videoRef.current.controls = isFullscreen;
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
  }, []);

  if (!publishedReel) return null;

  const getPlatformIcon = () => {
    if (publishedReel.platform === "instagram") {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] flex items-center justify-center">
          <Instagram className="h-4 w-4 text-white" />
        </div>
      );
    } else if (publishedReel.platform === "youtube") {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center">
          <Youtube className="h-4 w-4 text-white" />
        </div>
      );
    }
    return null;
  };

  const videoContent = (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3">
          {getPlatformIcon()}
          <div>
            <h3 className="font-semibold text-sm">{publishedReel.platformName}</h3>
            <p className="text-xs text-muted-foreground">
              {new Date(publishedReel.publishedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Video Player */}
      <div
        ref={containerRef}
        className={`flex-1 flex items-center justify-center min-h-0 overflow-hidden bg-gray-900 ${isMobile ? '[&_#video-player_.rounded-lg]:!rounded-none' : ''}`}
      >
        <div className="w-full max-w-md h-full flex items-center justify-center overflow-hidden">
          <BaseVideoPlayer
            ref={videoRef}
            videoUrl={publishedReel.videoUrl}
            posterUrl={publishedReel.thumbnailUrl}
            background="linear-gradient(to bottom right, #1f2937, #000000)"
            aspectRatio="9:16"
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
            onPlayPause={handlePlayPause}
            onReplay={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                setIsPlaying(true);
              }
            }}
            showControls={false}
            containerRef={containerRef}
          />
        </div>
      </div>

      {/* Video Controls */}
      <div className="flex-shrink-0">
        <ReelVideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onFullscreen={handleFullscreen}
        />
      </div>
    </div>
  );

  // Use Sheet (full page) on mobile, Dialog (popup) on desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="h-[100dvh] w-full p-0 border-0 rounded-t-lg overflow-hidden max-w-full [&>button]:hidden"
        >
          {videoContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full h-[90vh] p-0 overflow-hidden [&>button]:hidden">
        {videoContent}
      </DialogContent>
    </Dialog>
  );
};

