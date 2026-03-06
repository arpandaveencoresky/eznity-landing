// Reusable video/project card component
// Used in: Dashboard, Streams pages

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Trash2, Loader2, CheckCircle2, AlertCircle, Clock, XCircle, SkipForward } from "lucide-react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { VideoStatus } from "@/types";

interface VideoCardProps {
  id: string;
  title?: string;
  posterUrl?: string;
  duration?: number;
  createdAt?: string | Date;
  onClick?: () => void;
  // Optional badge content (e.g., Twitch stream badge) - will be overridden by streamer_name
  badge?: ReactNode;
  // Optional custom date display
  dateDisplay?: ReactNode;
  className?: string;
  // Delete functionality
  onDelete?: (id: string) => Promise<void>;
  isDeleting?: boolean;
  // Status
  status?: VideoStatus;
  // Streamer name - if present, will automatically show Twitch badge
  streamer_name?: string | null;
}

// Twitch icon component - shared across components
const TwitchIconLarge = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428H12l-3.429 3.428v-3.428H3.714V1.714h16.857Z" />
  </svg>
);

// Twitch badge component - automatically shown when streamer_name is present
const TwitchBadge = () => (
  <div className="bg-primary/90 backdrop-blur-sm p-1.5 rounded-md shadow-lg">
    <TwitchIconLarge className="w-4 h-4 text-white" />
  </div>
);

export const VideoCard = ({
  id,
  title,
  posterUrl,
  duration,
  createdAt,
  onClick,
  badge,
  dateDisplay,
  className = "",
  onDelete,
  isDeleting = false,
  status,
  streamer_name,
}: VideoCardProps) => {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isPending = status === 'pending' || status === 'processing';
  const isDeletable = status !== 'processing' && status !== 'deleted';

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(0).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return t('common.unknownDate');
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      console.log("🚀 ~ handleConfirmDelete ~ id:", id)
      await onDelete(id);
      setShowDeleteDialog(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: t('videoCard.status.inQueue'),
          icon: Clock,
          className: 'bg-blue-500/90 text-white',
          iconClassName: '',
        };
      case 'processing':
        return {
          label: t('videoCard.status.generatingReel'),
          icon: Loader2,
          className: 'bg-amber-500/90 text-white',
          iconClassName: 'animate-spin',
        };
      case 'completed':
        return {
          label: t('videoCard.status.ready'),
          icon: CheckCircle2,
          className: 'bg-green-500/90 text-white',
          iconClassName: '',
        };
      case 'deleted':
        return {
          label: t('videoCard.status.deleted'),
          icon: XCircle,
          className: 'bg-gray-500/90 text-white',
          iconClassName: '',
        };
      case 'failed':
        return {
          label: t('videoCard.status.failed'),
          icon: AlertCircle,
          className: 'bg-red-500/90 text-white',
          iconClassName: '',
        };
      case 'skipped':
        return {
          label: t('videoCard.status.skipped'),
          icon: SkipForward,
          className: 'bg-secondary/90 text-secondary-foreground',
          iconClassName: '',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <Card
        className={`overflow-hidden cursor-pointer border border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/30 hover:shadow-md transition-all duration-300 group ${isPending ? 'opacity-90' : ''} ${className}`}
        onClick={isPending ? undefined : onClick}
      >
        <div className="aspect-video bg-muted relative">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title || t('videoCard.videoThumbnail')}
              className={`w-full h-full object-cover ${isPending ? 'blur-[2px]' : ''}`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
            </div>
          )}

          {/* Status Overlay for Pending/Processing */}
          {/* {isPending && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
              </div>
              <span className="text-white text-xs font-medium">{t("videoCard.status.generatingReels")}</span>
            </div>
          )} */}

          {/* Duration badge - hide when pending */}
          {duration && !isPending && (
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
              {formatDuration(duration)}
            </div>
          )}

          {/* Status badge */}
          {statusConfig && (
            <div className="absolute bottom-2 left-2">
              <div className={`backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1.5 ${statusConfig.className}`}>
                <statusConfig.icon className={`h-3 w-3 ${statusConfig.iconClassName}`} />
                {statusConfig.label}
              </div>
            </div>
          )}

          {/* Custom badge (e.g., platform indicator) - streamer_name takes priority, but not for "Direct Upload" */}
          {(streamer_name && streamer_name !== "Direct Upload" ? (
            <div className="absolute top-2 left-2">
              <TwitchBadge />
            </div>
          ) : badge ? (
            <div className="absolute top-2 left-2">
              {badge}
            </div>
          ) : null)}

          {/* Delete button - hide when pending, processing, or deleted */}
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="p-3">
          {/* {isPending ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs font-medium">{t("videoCard.processing")}</span>
              </div>
              <p className="font-medium text-sm sm:text-base truncate">
                {title || 'Untitled Video'}
              </p>
            </div>
          ) : ( */}
          <>
            {dateDisplay ? (
              dateDisplay
            ) : (
              <p className="text-xs text-muted-foreground mb-1">
                {formatDate(createdAt)}
              </p>
            )}
            <p className="font-medium text-sm sm:text-base truncate">
              {title || t('videoCard.untitledVideo')}
            </p>
          </>
          {/* )} */}
        </div>
      </Card>

      {onDelete && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          title={t('videoCard.deleteVideo')}
          itemName={title}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

// Loading skeleton for video cards
export const VideoCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-muted rounded animate-pulse" />
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
    </div>
  </Card>
);

export default VideoCard;

