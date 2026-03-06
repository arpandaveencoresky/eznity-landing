import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Video, 
  Play,
  Clock,
  Palette,
  Flame,
  Instagram,
  Youtube,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  SkipForward
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";
import apiService from "@/services/api";
import { ReelData, VideoStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

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

const ProjectReels = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const { toast } = useToast();
  
  const [reels, setReels] = useState<ReelData[]>([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reelToDelete, setReelToDelete] = useState<ReelData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    title: string;
    status: VideoStatus;
    public_id: string;
    streamer_name: string | null;
  } | null>(null);
  const [videoInfoLoading, setVideoInfoLoading] = useState(true);
  
  // Use video title from API if available, otherwise fallback to location state or default
  const projectTitle = videoInfo?.title || location.state?.title || 'Project';
  const projectPosterUrl = location.state?.posterUrl;

  // Fetch video info (title, status, etc.) from video/{public_id} API
  useEffect(() => {
    const fetchVideoInfo = async () => {
      if (!projectId) {
        setVideoInfoLoading(false);
        return;
      }

      try {
        setVideoInfoLoading(true);
        const videoData = await apiService.getVideoInfo(projectId);
        setVideoInfo({
          title: videoData.title,
          status: videoData.status,
          public_id: videoData.public_id,
          streamer_name: videoData.streamer_name,
        });
      } catch (error) {
        logger.error('Failed to fetch video info:', error);
        // Continue even if video info fails
      } finally {
        setVideoInfoLoading(false);
      }
    };

    fetchVideoInfo();
  }, [projectId]);

  // Fetch reels for the project
  const fetchReels = useCallback(async () => {
    if (!projectId) {
      setReelsLoading(false);
      return;
    }

    try {
      setReelsLoading(true);
      
      const response = await apiService.getProjectReels(projectId);
      setReels(response.reels || []);
    } catch (error) {
      logger.error('Failed to fetch project reels:', error);
    } finally {
      setReelsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // WebSocket integration for reels_generated event
  useWebSocket({
    onReelsGenerated: (data: { 
      message?: string;
      video_id?: string;
      status?: VideoStatus;
    }) => {
      // Check if the generated reels are for the current project
      const eventVideoId = data.video_id;
      if (eventVideoId === projectId) {
        logger.info('Reels generated for current project, refreshing...', data);
        
        // Update video status immediately from the event data
        if (data.status) {
          setVideoInfo((prev) => {
            if (prev) {
              return {
                ...prev,
                status: data.status as VideoStatus,
              };
            }
            // If videoInfo is null, we'll set it from the API call below
            return prev;
          });
        }
        
        // Refresh reels list
        fetchReels();
        
        // Also refresh video info from API to ensure we have the latest data
        if (projectId) {
          apiService.getVideoInfo(projectId)
            .then((videoData) => {
              setVideoInfo({
                title: videoData.title,
                status: videoData.status,
                public_id: videoData.public_id,
                streamer_name: videoData.streamer_name,
              });
            })
            .catch((error) => {
              logger.error('Failed to refresh video info:', error);
            });
        }

        toast({
          title: t('projectReels.reelsGenerated'),
          description: data.message || t('projectReels.reelsGeneratedDescription'),
        });
      }
    },
  });

  const formatDuration = (duration?: number) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  // Status config function - now using video/{public_id} API
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'pending':
        return {
          label: t('projectReels.status.inQueue'),
          icon: Clock,
          className: 'bg-blue-500/90 text-white',
          iconClassName: '',
          isLoading: true,
        };
      case 'processing':
        return {
          label: t('projectReels.status.generating'),
          icon: Loader2,
          className: 'bg-amber-500/90 text-white',
          iconClassName: 'animate-spin',
          isLoading: true,
        };
      case 'completed':
        return {
          label: t('projectReels.status.ready'),
          icon: CheckCircle2,
          className: 'bg-green-500/90 text-white',
          iconClassName: '',
          isLoading: false,
        };
      case 'deleted':
        return {
          label: t('projectReels.status.deleted'),
          icon: XCircle,
          className: 'bg-gray-500/90 text-white',
          iconClassName: '',
          isLoading: false,
        };
      case 'failed':
        return {
          label: t('projectReels.status.failed'),
          icon: AlertCircle,
          className: 'bg-red-500/90 text-white',
          iconClassName: '',
          isLoading: false,
        };
      case 'skipped':
        return {
          label: t('projectReels.status.skipped'),
          icon: SkipForward,
          className: 'bg-secondary/90 text-secondary-foreground',
          iconClassName: '',
          isLoading: false,
        };
      default:
        return null;
    }
  };

  const handleReelClick = (reel: ReelData) => {
    navigate(`/reel/${reel.public_id}`, {
      state: {
        projectId: projectId,
      }
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, reel: ReelData) => {
    e.stopPropagation();
    setReelToDelete(reel);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;

    try {
      setIsDeleting(true);
      await apiService.deleteReel(reelToDelete.public_id);
      
      // Remove the deleted reel from the list
      setReels(prevReels => prevReels.filter(r => r.public_id !== reelToDelete.public_id));
      
      toast({
        title: t("reelDetails.reelDeleted"),
        description: t("reelDetails.reelDeletedDescription", { title: reelToDelete.title || t("projectReels.reel") }),
      });
    } catch (error) {
      logger.error('Failed to delete reel:', error);
      toast({
        title: t("toast.deleteFailed"),
        description: t("reelDetails.errors.deleteFailed"),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setReelToDelete(null);
    }
  };

  // Render reel card component - treating all reels as completed for now
  const renderReelCard = (reel: ReelData, index: number) => {
    return (
      <Card 
        key={reel.public_id} 
        className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-primary/20"
        onClick={() => handleReelClick(reel)}
      >
        {/* Video Thumbnail */}
        <div className="aspect-[9/16] bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
          {reel.poster_url ? (
            <img 
              src={reel.poster_url} 
              alt={reel.title || `Reel ${index + 1}`} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Video className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Play className="h-6 w-6 text-slate-900 ml-1" fill="currentColor" />
            </div>
          </div>
          
          {/* Duration Badge */}
          {reel.duration && (
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs text-white font-medium flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {formatDuration(reel.duration)}
            </div>
          )}
          
          {/* Viral Score Badge */}
          {reel.viral_score && (
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                <Flame className={`h-3 w-3 ${getViralScoreColor(reel.viral_score)}`} />
                <span className={getViralScoreColor(reel.viral_score)}>{reel.viral_score}/10</span>
              </div>
            </div>
          )}

          {/* Posted Status Icons and Delete Button */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {/* Delete button - shows on hover */}
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={(e) => handleDeleteClick(e, reel)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            {reel.instagram_posted && (
              <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-1.5 rounded-md">
                <Instagram className="h-3 w-3 text-white" />
              </div>
            )}
            {reel.tiktok_posted && (
              <div className="bg-black p-1.5 rounded-md">
                <TikTokIcon className="h-3 w-3 text-white" />
              </div>
            )}
            {reel.youtube_posted && (
              <div className="bg-red-600 p-1.5 rounded-md">
                <Youtube className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Reel Info */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
            {reel.title || `Reel ${index + 1}`}
          </h3>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            {/* Style Badge */}
            {reel.styling?.font_id && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="outline" 
                    className="text-xs gap-1"
                    style={{
                      borderColor: reel.styling.config['word-being-narrated']?.color || '#ffd95a',
                      color: reel.styling.config['word-being-narrated']?.color || '#ffd95a',
                    }}
                  >
                    <Palette className="h-3 w-3" />
                    {reel.styling.font_id}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('projectReels.styleApplied')}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Caption Preview */}
          {reel.caption ? (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {reel.caption}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic line-clamp-2">
              {t('projectReels.noCaption')}
            </p>
          )}

          {/* Preview of styling */}
          {reel.styling?.config && (
            <div 
              className="text-xs p-2 rounded-md truncate"
              style={{
                background: reel.styling.config['subtitle-container']?.background || 'transparent',
                fontFamily: reel.styling.config.word?.['font-family'] || 'inherit',
              }}
            >
              <span 
                style={{ 
                  color: reel.styling.config.word?.color || '#ffffff',
                  opacity: parseFloat(reel.styling.config.word?.opacity || '0.65'),
                }}
              >
                Sample{' '}
              </span>
              <span 
                style={{ 
                  color: reel.styling.config['word-being-narrated']?.color || '#ffd95a',
                  fontWeight: reel.styling.config['word-being-narrated']?.['font-weight'] || 'bold',
                }}
              >
                styled
              </span>
              <span 
                style={{ 
                  color: reel.styling.config.word?.color || '#ffffff',
                  opacity: parseFloat(reel.styling.config.word?.opacity || '0.65'),
                }}
              >
                {' '}text
              </span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Check if video is completed and has reels
  const videoStatus = videoInfo?.status;
  const statusConfig = getStatusConfig(videoStatus);
  const hasAnyReels = reels.length > 0;
  const isVideoCompleted = videoStatus === 'completed';

  // Loading skeleton for reel cards
  const ReelCardSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="aspect-[9/16] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded animate-pulse w-16" />
          <div className="h-6 bg-muted rounded animate-pulse w-20" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4">
            {/* Project Thumbnail */}
            {projectPosterUrl && (
              <div className="hidden sm:block w-24 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={projectPosterUrl} 
                  alt={projectTitle} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{projectTitle}</h1>
                {/* Show Twitch icon if streamer_name is not "Direct Upload" */}
                {videoInfo?.streamer_name && videoInfo.streamer_name !== "Direct Upload" && (
                  <div className="bg-primary/90 backdrop-blur-sm p-1.5 rounded-md shadow-lg">
                    <TwitchIcon className="w-5 h-5 text-white" />
                  </div>
                )}
                {statusConfig && (
                  <Badge 
                    className={`${statusConfig.className} flex items-center gap-1.5 px-2.5 py-1`}
                  >
                    {statusConfig.iconClassName ? (
                      <statusConfig.icon className={`h-3.5 w-3.5 ${statusConfig.iconClassName}`} />
                    ) : (
                      <statusConfig.icon className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs font-semibold">{statusConfig.label}</span>
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Video className="h-4 w-4" />
                {reelsLoading || videoInfoLoading ? (
                  <span className="animate-pulse">{t('common.loading')}</span>
                ) : (
                  <span>
                    {t('projectReels.reelCount', { count: reels.length })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Reels Grid */}
        {reelsLoading || videoInfoLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ReelCardSkeleton key={i} />
            ))}
          </div>
        ) : videoStatus === 'skipped' ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              {statusConfig?.icon ? (
                <statusConfig.icon className={`h-10 w-10 text-muted-foreground ${statusConfig.iconClassName || ''}`} />
              ) : (
                <Video className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('projectReels.skippedReelMessage')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('projectReels.skippedReelDescription')}
            </p>
          </Card>
        ) : !isVideoCompleted ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              {statusConfig?.iconClassName ? (
                <statusConfig.icon className={`h-10 w-10 text-muted-foreground ${statusConfig.iconClassName}`} />
              ) : (
                <Video className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {statusConfig?.label || t('projectReels.processing')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {statusConfig?.label || t('projectReels.processing')}
            </p>
          </Card>
        ) : !hasAnyReels ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Video className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('projectReels.noReelsTitle')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('projectReels.noReels')}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {reels.map((reel, index) => renderReelCard(reel, index))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Reel"
        itemName={reelToDelete?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProjectReels;
