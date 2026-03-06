import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Clock, CloudUpload, Loader2, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/authService";
import { DashboardResponse } from "@/types/auth";
import { CountCard } from "@/components/common/CountCard";
import { SocialIcon, WatermarkIcon, getSocialIconBgColor } from "@/components/common/SocialIcon";
import { VideoCard, VideoCardSkeleton } from "@/components/common/VideoCard";
import { InstagramConnectCard } from "@/components/common/InstagramConnectCard";
import { logger } from "@/utils/logger";
import apiService from "@/services/api";
import { VideoData } from "@/types";
import { FEATURE_FLAGS, DUMMY_PROJECT_DATA } from "@/config/api";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isSocialAccountConnected, capitalizeFirst } from "@/utils/authHelpers";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VideoStatus } from "@/types";
import {
  initiateOAuthRedirect,
} from "@/utils/oauth";

// Polling interval in milliseconds (5 minutes)
// Commented out - using WebSocket for real-time updates instead
// const POLLING_INTERVAL = 5 * 60 * 1000;

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [isTwitchLinking, setIsTwitchLinking] = useState(false);

  // Check if Instagram is connected
  const isInstagramConnected = isSocialAccountConnected(user, 'instagram');
  // Check if Twitch is connected
  const isTwitchConnected = isSocialAccountConnected(user, 'twitch');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await authService.getDashboard();
        setDashboardData(data);
      } catch (error) {
        logger.error('Failed to fetch dashboard data:', error);
        // Set default values on error
        setDashboardData({
          instagram_reel_count: 0,
          youtube_short_count: 0,
          tiktok_reel_count: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // State to track current time for relative time updates
  const [, setCurrentTime] = useState(Date.now());
  // Commented out - using WebSocket for real-time updates instead
  // const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch videos (used for initial load and polling)
  const fetchVideos = useCallback(async (isPolling = false) => {
    try {
      // Only show loading state on initial load, not during polling
      if (!isPolling) {
        setVideosLoading(true);
      }

      // If static data mode is enabled, use dummy project data
      if (FEATURE_FLAGS.USE_STATIC_DATA) {
        const dummyVideo: VideoData = {
          id: 'dummy-video-1',
          title: DUMMY_PROJECT_DATA.title,
          video_url: DUMMY_PROJECT_DATA.video_url,
          poster_url: DUMMY_PROJECT_DATA.poster_url,
          duration: DUMMY_PROJECT_DATA.duration,
          public_id: DUMMY_PROJECT_DATA.public_id,
          aspectRatio: '9:16',
          created_on: new Date().toISOString(),
        };
        setVideos([dummyVideo]);
      } else {
        const response = await apiService.getAllVideos(1, 12);
        setVideos(response.videos || []);
      }

      if (isPolling) {
        logger.info('Dashboard data refreshed via polling');
      }
    } catch (error) {
      logger.error('Failed to fetch videos:', error);
      if (!isPolling) {
        setVideos([]);
      }
    } finally {
      if (!isPolling) {
        setVideosLoading(false);
      }
    }
  }, []);

  // Initial fetch and polling setup
  useEffect(() => {
    // Initial fetch
    fetchVideos(false);

    // Polling commented out - using WebSocket for real-time updates instead
    // Set up polling interval (every 5 minutes)
    // pollingIntervalRef.current = setInterval(() => {
    //   fetchVideos(true);
    // }, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      // Polling cleanup commented out
      // if (pollingIntervalRef.current) {
      //   clearInterval(pollingIntervalRef.current);
      // }
    };
  }, [fetchVideos]);

  // Update relative time display every minute
  useEffect(() => {
    const timeUpdateInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timeUpdateInterval);
  }, []);

  // WebSocket handlers - wrapped in useCallback to keep them stable
  const handleVideoStatus = useCallback((data: {
    message?: string;
    video_id?: string;
    status?: VideoStatus;
    reels_count?: number;
  }) => {
    const eventVideoId = data.video_id;
    if (eventVideoId) {
      // Update video status in the videos list
      setVideos((prevVideos) =>
        prevVideos.map((video) => {
          if (video.public_id === eventVideoId || video.id === eventVideoId) {
            return {
              ...video,
              status: data.status || video.status,
            };
          }
          return video;
        })
      );

    }
  }, []);

  const handleReelsGenerated = useCallback((data: {
    message?: string;
    video_id?: string;
    status?: VideoStatus;
    reels_count?: number;
  }) => {
    const eventVideoId = data.video_id;
    if (eventVideoId) {
      // Update video status in the videos list
      setVideos((prevVideos) =>
        prevVideos.map((video) => {
          if (video.public_id === eventVideoId || video.id === eventVideoId) {
            return {
              ...video,
              status: data.status || video.status,
            };
          }
          return video;
        })
      );

    }
  }, []);

  // WebSocket integration for video_status and reels_generated events
  useWebSocket({
    onVideoStatus: handleVideoStatus,
    onReelsGenerated: handleReelsGenerated,
  });

  const handleVideoClick = (video: VideoData) => {
    navigate(`/product/project/${video.public_id || video.id}/reels`, {
      state: {
        video: video,
        title: video.title,
        posterUrl: video.poster_url
      }
    });
  };

  const handleDeleteVideo = async (videoId: string) => {
    const video = videos.find(v => v.public_id === videoId);
    console.log("🚀 ~ handleDeleteVideo ~ videoId:", videoId)

    try {
      setDeletingVideoId(videoId);
      await apiService.deleteVideo(videoId);

      // Remove the deleted video from the list
      setVideos(prevVideos => prevVideos.filter(v => v.public_id !== videoId));

    } catch (error) {
      logger.error('Failed to delete video:', error);
      toast({
        title: t('toast.deleteFailed'),
        description: t('toast.deleteFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleTwitchConnect = async () => {
    if (isTwitchLinking) return;

    setIsTwitchLinking(true);
    try {
      // Initiate OAuth redirect (in-window instead of popup)
      await initiateOAuthRedirect('twitch', '/dashboard');
      // Note: User will be redirected away, so setIsTwitchLinking won't be called
      // The OAuthCallback page will handle the completion
    } catch (error: unknown) {
      toast({
        title: t('common.toast.error'),
        description: (error instanceof Error ? error.message : null) || t('auth.messages.connectionFailed', { platform: 'twitch' }),
        variant: 'destructive',
      });
      setIsTwitchLinking(false);
    }
  };

  // Twitch icon component
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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Count Cards - Instagram and YouTube (Coming Soon) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 sm:mb-8">
          {isInstagramConnected ? (
            <CountCard
              icon={<SocialIcon platform="instagram" size="lg" />}
              label={t('dashboard.instagramReels')}
              count={dashboardData?.instagram_reel_count ?? 0}
              isLoading={isLoading}
              iconBgColor={getSocialIconBgColor('instagram')}
              watermarkIcon={<WatermarkIcon platform="instagram" className="w-32 h-32" />}
            />
          ) : (
            <InstagramConnectCard />
          )}
          {/* YouTube Shorts - Coming Soon */}
          <Card className="p-4 sm:p-6 relative overflow-hidden border-dashed border-2 opacity-80 hover:opacity-90 transition-opacity">
            {/* Background YouTube logo watermark */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.06]">
              <WatermarkIcon platform="youtube" className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              <div
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ backgroundColor: '#FF0000' }}
              >
                <SocialIcon platform="youtube" size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium mb-0.5">
                  {t('dashboard.youtubeShorts')}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{t('dashboard.comingSoon')}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('dashboard.title')}</h2>

        {/* Upload and Twitch Cards - Side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Modern Upload Card */}
          <Card
            className="p-6 sm:p-8 border border-dashed border-border/60 bg-card/30 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group backdrop-blur-sm"
            onClick={() => navigate('/product/upload')}
          >
            <div className="flex flex-col items-center justify-center text-center xl:flex-row xl:items-center xl:text-left gap-4 sm:gap-5 lg:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-16 lg:h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <CloudUpload className="h-7 w-7 sm:h-8 sm:w-8 lg:h-8 lg:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 text-center xl:text-left">
                <h3 className="text-lg sm:text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                  {t('dashboard.uploadLocalFile')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('dashboard.uploadDescription')}
                </p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  {t("dashboard.fileFormats.mp4")}
                </p>
              </div>
            </div>
          </Card>

          {/* Twitch Card */}
          <Card
            className={`p-6 sm:p-8 border border-border/60 bg-card/30 backdrop-blur-sm transition-all group ${isTwitchConnected
              ? 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
              : ''
              }`}
            onClick={isTwitchConnected ? () => navigate('/product/videos?type=twitch') : undefined}
          >
            <div className="flex flex-col items-center justify-center text-center xl:flex-row xl:items-center xl:text-left gap-4 sm:gap-5 lg:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-16 lg:h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <TwitchIconLarge className="h-7 w-7 sm:h-8 sm:w-8 lg:h-8 lg:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5 text-center xl:text-left">
                <h3 className="text-lg sm:text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                  {t('streams.streamVideos')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isTwitchConnected
                    ? t('streams.description')
                    : t('streams.twitchNotConnected')
                  }
                </p>
                {!isTwitchConnected && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTwitchConnect();
                    }}
                    disabled={isTwitchLinking}
                    size="sm"
                    className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground w-fit"
                  >
                    {isTwitchLinking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('streams.connecting')}
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4 mr-2" />
                        {t('streams.connectTwitch')}
                      </>
                    )}
                  </Button>
                )}
              </div>
              {isTwitchConnected && (
                <div className="hidden sm:flex items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:border-primary group-hover:text-primary"
                  >
                    {t('dashboard.viewAll')}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">{t('dashboard.myProjects')}</h3>
            <Button
              variant="link"
              className="text-primary text-sm"
              onClick={() => navigate('/product/videos?type=all')}
            >
              {t('dashboard.viewAll')}
            </Button>
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <Card className="p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('dashboard.noVideos')}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => {
                const isNew = video.created_on && (Date.now() - new Date(video.created_on).getTime()) < 60000;

                return (
                  <VideoCard
                    key={video.public_id}
                    id={video.public_id || ''}
                    title={video.title}
                    posterUrl={video.poster_url}
                    duration={video.duration}
                    onClick={() => handleVideoClick(video)}
                    onDelete={handleDeleteVideo}
                    isDeleting={deletingVideoId === video.public_id}
                    status={video.status}
                    streamer_name={video.streamer_name}
                    dateDisplay={
                      <p className={`text-xs mb-1 ${isNew ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {isNew && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />}
                        {video.created_on ? formatRelativeTime(video.created_on) : t("common.unknownDate")}
                      </p>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
