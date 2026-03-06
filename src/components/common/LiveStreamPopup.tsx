// Live stream popup component that appears on hover of profile when user is live

import { useState, useEffect } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StreamData } from '@/contexts/AuthContext';

// Twitch icon component
const TwitchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428H12l-3.429 3.428v-3.428H3.714V1.714h16.857Z" />
  </svg>
);

interface LiveStreamPopupProps {
  streamData: StreamData;
  isVisible: boolean;
  onClose?: () => void;
  onMouseEnterPopup?: () => void;
}

/**
 * Format duration since stream started (e.g., "1h 20m", "45m", "2h")
 */
const formatStreamDuration = (startAt: string): string => {
  const start = new Date(startAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes > 0) {
      return `${diffHours}h ${remainingMinutes}m`;
    }
    return `${diffHours}h`;
  }
  return `${diffMinutes}m`;
};

/**
 * Format start time to readable format (e.g., "Started at 2:30 PM")
 */
const formatStartTime = (startAt: string): string => {
  const date = new Date(startAt);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `Started at ${displayHours}:${displayMinutes} ${ampm}`;
};

export const LiveStreamPopup = ({ streamData, isVisible, onClose, onMouseEnterPopup }: LiveStreamPopupProps) => {
  const [duration, setDuration] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [showEmbed, setShowEmbed] = useState(false);

  // Extract username from Twitch URL for embed
  const getTwitchEmbedUrl = (url: string): string | null => {
    try {
      // Extract username from URL like https://www.twitch.tv/username
      const match = url.match(/twitch\.tv\/([^/?]+)/);
      if (match && match[1]) {
        const username = match[1];
        return `https://player.twitch.tv/?channel=${username}&parent=${window.location.hostname}&muted=false`;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Update duration every minute
  useEffect(() => {
    if (!streamData.start_at) return;

    const updateDuration = () => {
      setDuration(formatStreamDuration(streamData.start_at!));
      setStartTime(formatStartTime(streamData.start_at!));
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [streamData.start_at]);

  // Initial calculation
  useEffect(() => {
    if (streamData.start_at) {
      setDuration(formatStreamDuration(streamData.start_at));
      setStartTime(formatStartTime(streamData.start_at));
    }
  }, [streamData.start_at]);

  const handleWatchClick = () => {
    if (streamData.stream_url) {
      window.open(streamData.stream_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEmbedClick = () => {
    setShowEmbed(true);
  };

  const embedUrl = streamData.stream_url ? getTwitchEmbedUrl(streamData.stream_url) : null;

  if (!isVisible || !streamData.stream_url) {
    return null;
  }

  return (
    <div
      data-live-popup
      className={cn(
        'absolute right-0 top-full mt-3 z-[100]',
        'w-[320px] sm:w-[360px]',
        'max-w-[calc(100vw-2rem)]', // Ensure it doesn't overflow on small screens
        'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
        'border border-red-500/30',
        'rounded-2xl shadow-2xl',
        'backdrop-blur-xl',
        'overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-red-500/10 before:to-transparent before:pointer-events-none',
        isVisible && 'animate-in fade-in slide-in-from-top-2 duration-200'
      )}
      onMouseEnter={(e) => {
        e.stopPropagation();
        // Keep popup visible when hovering over it
        onMouseEnterPopup?.();
      }}
      onMouseLeave={(e) => {
        // Close when leaving the popup (unless moving back to avatar)
        const relatedTarget = e.relatedTarget as HTMLElement;
        const isMovingToAvatar = relatedTarget?.closest('[data-profile-avatar]');
        if (!isMovingToAvatar) {
          onClose?.();
        }
      }}
    >
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 via-purple-500/20 to-red-500/20 opacity-50 blur-sm pointer-events-none" />
      
      {/* Content */}
      <div className="relative p-5 space-y-4">
        {/* Header with Twitch icon, Live badge, and Streamer name */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Twitch Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-md" />
              <div className="relative bg-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                <TwitchIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            
            {/* Live Badge */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-sm animate-pulse" />
                <div className="relative bg-red-500 px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Streamer name on the right */}
          {streamData.streamer_username && (
            <p className="text-white font-semibold text-sm truncate">
              {streamData.streamer_username}
            </p>
          )}
        </div>

        {/* Duration and start time */}
        <div className="space-y-2 pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">
              Live for {duration}
            </span>
          </div>
          {startTime && (
            <p className="text-gray-400 text-xs pl-6">
              {startTime}
            </p>
          )}
        </div>

        {/* Watch button or Embed */}
        {showEmbed && embedUrl ? (
          <div className="space-y-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-red-500/30 bg-black">
              <iframe
                src={embedUrl}
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none' }}
                allow="autoplay; fullscreen"
              />
            </div>
            <Button
              onClick={() => setShowEmbed(false)}
              variant="outline"
              className="w-full text-xs"
            >
              Hide Stream
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {embedUrl && (
              <Button
                onClick={handleEmbedClick}
                variant="outline"
                className={cn(
                  'flex-1',
                  'border-purple-500/30 text-purple-300',
                  'hover:bg-purple-500/10',
                  'transition-all duration-200'
                )}
              >
                <span className="text-xs">Preview</span>
              </Button>
            )}
            <Button
              onClick={handleWatchClick}
              className={cn(
                embedUrl ? 'flex-1' : 'w-full',
                'bg-gradient-to-r from-purple-600 to-red-600',
                'hover:from-purple-500 hover:to-red-500',
                'text-white font-semibold',
                'shadow-lg shadow-purple-500/30',
                'hover:shadow-xl hover:shadow-purple-500/40',
                'transition-all duration-200',
                'border border-purple-400/30',
                'relative overflow-hidden',
                'group'
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Watch on Twitch</span>
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
          </div>
        )}
      </div>

      {/* Arrow pointing upward to avatar - positioned outside container */}
      <div 
        className="absolute -top-2 right-6 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid rgb(17 24 39)', // gray-900
          filter: 'drop-shadow(0 -1px 2px rgba(239, 68, 68, 0.3))', // red-500/30 shadow
        }}
      />
    </div>
  );
};

