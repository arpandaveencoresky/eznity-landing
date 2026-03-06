import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VideoCard, VideoCardSkeleton } from "@/components/common/VideoCard";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { logger } from "@/utils/logger";
import apiService from "@/services/api";
import { VideoData } from "@/types";
import { FEATURE_FLAGS, DUMMY_PROJECT_DATA } from "@/config/api";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/utils";

import {
  isSocialAccountConnected,
} from "@/utils/authHelpers";
import { initiateOAuthRedirect } from "@/utils/oauth";

// Twitch icon component (used in connect button UI)
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

const Projects = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [twitchVideos, setTwitchVideos] = useState<VideoData[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<VideoData[]>([]);
  const [twitchVideosLoading, setTwitchVideosLoading] = useState(true);
  const [uploadedVideosLoading, setUploadedVideosLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  const isTwitchConnected = isSocialAccountConnected(user, 'twitch');
  const MAX_VIDEOS_PER_SECTION = 8;

  // Fetch Twitch videos (show videos even if Twitch is not connected; only show connect button when empty)
  useEffect(() => {
    const fetchTwitchVideos = async () => {
      try {
        setTwitchVideosLoading(true);

        // If static data mode is enabled, use dummy project data
        if (FEATURE_FLAGS.USE_STATIC_DATA) {
          const dummyVideo: VideoData = {
            id: 'stream-video-1',
            title: DUMMY_PROJECT_DATA.title,
            video_url: DUMMY_PROJECT_DATA.video_url,
            poster_url: DUMMY_PROJECT_DATA.poster_url,
            duration: DUMMY_PROJECT_DATA.duration,
            public_id: DUMMY_PROJECT_DATA.public_id,
            aspectRatio: '16:9',
            created_on: new Date().toISOString(),
          };
          setTwitchVideos([dummyVideo]);
        } else {
          // Use streamer API endpoint for streams page, limit to 8
          const response = await apiService.getStreamerVideos(1, MAX_VIDEOS_PER_SECTION);
          setTwitchVideos((response.videos || []).slice(0, MAX_VIDEOS_PER_SECTION));
        }
      } catch (error) {
        logger.error('Failed to fetch stream videos:', error);
        setTwitchVideos([]);
      } finally {
        setTwitchVideosLoading(false);
      }
    };

    fetchTwitchVideos();
  }, [isTwitchConnected]);

  // Fetch uploaded videos
  useEffect(() => {
    const fetchUploadedVideos = async () => {
      try {
        setUploadedVideosLoading(true);

        // If static data mode is enabled, use dummy project data
        if (FEATURE_FLAGS.USE_STATIC_DATA) {
          const dummyVideo: VideoData = {
            id: 'uploaded-video-1',
            title: DUMMY_PROJECT_DATA.title,
            video_url: DUMMY_PROJECT_DATA.video_url,
            poster_url: DUMMY_PROJECT_DATA.poster_url,
            duration: DUMMY_PROJECT_DATA.duration,
            public_id: DUMMY_PROJECT_DATA.public_id,
            aspectRatio: '9:16',
            created_on: new Date().toISOString(),
          };
          setUploadedVideos([dummyVideo]);
        } else {
          // Fetch uploaded videos, limit to 8
          const response = await apiService.getVideos(1, MAX_VIDEOS_PER_SECTION);
          setUploadedVideos((response.videos || []).slice(0, MAX_VIDEOS_PER_SECTION));
        }
      } catch (error) {
        logger.error('Failed to fetch uploaded videos:', error);
        setUploadedVideos([]);
      } finally {
        setUploadedVideosLoading(false);
      }
    };

    fetchUploadedVideos();
  }, []);

  const handleTwitchConnect = async () => {
    if (isLinking) return;

    setIsLinking(true);
    try {
      // Initiate OAuth redirect (in-window instead of popup)
      await initiateOAuthRedirect('twitch', '/projects');
      // Note: User will be redirected away, so setIsLinking won't be called
      // The OAuthCallback page will handle the completion
    } catch (error: unknown) {
      toast({
        title: t('common.toast.error'),
        description: (error instanceof Error ? error.message : null) || t('auth.messages.connectionFailed', { platform: 'twitch' }),
        variant: 'destructive',
      });
      setIsLinking(false);
    }
  };

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
    const video = [...twitchVideos, ...uploadedVideos].find((v) => v.public_id === videoId);
    try {
      setDeletingVideoId(videoId);
      await apiService.deleteVideo(videoId);

      // Remove the deleted video from the appropriate list
      setTwitchVideos((prevVideos) =>
        prevVideos.filter((v) => v.public_id !== videoId)
      );
      setUploadedVideos((prevVideos) =>
        prevVideos.filter((v) => v.public_id !== videoId)
      );

    } catch (error) {
      logger.error("Failed to delete video:", error);
      toast({
        title: t("toast.deleteFailed"),
        description: t("toast.deleteFailedDescription"),
        variant: "destructive",
      });
    } finally {
      setDeletingVideoId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('streams.title')}</h1>
        </div>

        {/* Twitch Videos Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">{t('streams.streamVideos')}</h3>
            {twitchVideos.length > 0 && (
              <Button
                variant="link"
                className="text-primary text-sm"
                onClick={() => navigate('/product/videos?type=twitch')}
              >
                {t('dashboard.viewAll')}
              </Button>
            )}
          </div>

          {twitchVideosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, MAX_VIDEOS_PER_SECTION).map((i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : twitchVideos.length === 0 ? (
            <Card className="p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{isTwitchConnected ? t('streams.noVideos') : t('streams.twitchNotConnected')}</p>
              {!isTwitchConnected && (
                <Button
                  onClick={handleTwitchConnect}
                  disabled={isLinking}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t('streams.connecting')}
                    </>
                  ) : (
                    <>
                      <TwitchIconLarge className="w-4 h-4 mr-2" />
                      {t('streams.connectTwitch')}
                    </>
                  )}
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {twitchVideos.slice(0, MAX_VIDEOS_PER_SECTION).map((video) => (
                <VideoCard
                  key={video.public_id}
                  id={video.public_id || ''}
                  title={video.title || 'Untitled Stream'}
                  posterUrl={video.poster_url}
                  duration={video.duration}
                  onClick={() => handleVideoClick(video)}
                  onDelete={handleDeleteVideo}
                  isDeleting={deletingVideoId === video.public_id}
                  status={video.status}
                  streamer_name={video.streamer_name}
                  dateDisplay={
                    <p className="text-xs text-muted-foreground mb-1">
                      {video.created_on ? formatRelativeTime(video.created_on) : t('common.unknownDate')}
                    </p>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Videos Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">{t('streams.uploadedVideos')}</h3>
            {uploadedVideos.length > 0 && (
              <Button
                variant="link"
                className="text-primary text-sm"
                onClick={() => navigate('/product/videos?type=upload')}
              >
                {t('dashboard.viewAll')}
              </Button>
            )}
          </div>

          {uploadedVideosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, MAX_VIDEOS_PER_SECTION).map((i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          ) : uploadedVideos.length === 0 ? (
            <Card className="p-8 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t('allVideos.noVideosFound')}</p>
              <Button onClick={() => navigate('/product/upload')}>
                {t('allVideos.uploadVideo')}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {uploadedVideos.slice(0, MAX_VIDEOS_PER_SECTION).map((video) => (
                <VideoCard
                  key={video.public_id}
                  id={video.public_id || ''}
                  title={video.title || 'Untitled Video'}
                  posterUrl={video.poster_url}
                  duration={video.duration}
                  onClick={() => handleVideoClick(video)}
                  onDelete={handleDeleteVideo}
                  isDeleting={deletingVideoId === video.public_id}
                  status={video.status}
                  streamer_name={video.streamer_name}
                  dateDisplay={
                    <p className="text-xs text-muted-foreground mb-1">
                      {video.created_on ? formatRelativeTime(video.created_on) : t('common.unknownDate')}
                    </p>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
