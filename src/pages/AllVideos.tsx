import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VideoCard, VideoCardSkeleton } from "@/components/common/VideoCard";
import { logger } from "@/utils/logger";
import apiService from "@/services/api";
import { VideoData } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/AppHeader";
import { HeaderConfigProvider } from "@/contexts/HeaderConfigContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VideoStatus } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronLeft, ArrowRight } from "lucide-react";

const VIDEOS_PER_PAGE = 12;

const AllVideos = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [title, setTitle] = useState("allVideos.all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  // Get video type from query params (defaults to 'upload' if not specified)
  const videoType = searchParams.get("type") || "upload";
  const isStreamVideos = videoType === "twitch";
  const loadAllVideos = videoType === "all";

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        let response = null;
        switch (videoType) {
          case "twitch":
            setTitle("allVideos.twitchTitle");
            response = await apiService.getStreamerVideos(
              currentPage,
              VIDEOS_PER_PAGE
            );
            break;
          case "all":
            setTitle("allVideos.allTitle");
            response = await apiService.getAllVideos(
              currentPage,
              VIDEOS_PER_PAGE
            );
            break;

          default:
            setTitle("allVideos.uploadedTitle");
            response = await apiService.getVideos(currentPage, VIDEOS_PER_PAGE);
            break;
        }
        setVideos(response.videos || []);
        setTotalPages(response.total_pages || 1);
        // Support both total_video (backend API) and total_videos (legacy)
        setTotalVideos(response.total_video ?? response.total_videos ?? 0);
      } catch (error) {
        logger.error("Failed to fetch videos:", error);
        setVideos([]);
        toast({
          title: t("common.toast.error"),
          description: t("allVideos.errors.loadFailed"),
          variant: "destructive",
        });
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage, videoType, toast, t]);

  // WebSocket integration for video_status event
  useWebSocket({
    onVideoStatus: (data: {
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

        // Show toast notification
        toast({
          title: t("common.toast.success"),
          description: data.message || "Video status updated",
        });
      }
    },
  });

  const handleVideoClick = (video: VideoData) => {
    navigate(`/product/project/${video.public_id || video.id}/reels`, {
      state: {
        video: video,
        title: video.title,
        posterUrl: video.poster_url,
      },
    });
  };

  const handleDeleteVideo = async (videoId: string) => {
    const video = videos.find((v) => v.public_id === videoId);
    try {
      setDeletingVideoId(videoId);
      await apiService.deleteVideo(videoId);

      // Remove the deleted video from the list
      setVideos((prevVideos) =>
        prevVideos.filter((v) => v.public_id !== videoId)
      );
      setTotalVideos((prev) => prev - 1);

      toast({
        title: t("toast.videoDeleted"),
        description: t("toast.videoDeletedDescription", {
          title: video?.title || t("allVideos.video"),
        }),
      });

      // If current page becomes empty and not on first page, go to previous page
      if (videos.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Preserve query params when changing pages
    const params = new URLSearchParams(searchParams);
    navigate(`/videos?${params.toString()}`, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from start
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(i);
                }}
                isActive={currentPage === i}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      // Show ellipsis if current page is far from end
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <HeaderConfigProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                      {t(title)}
                    </h1>
                    <p className="text-muted-foreground">
                      {totalVideos > 0 ? (
                        <>
                          Showing {videos.length} of {totalVideos}{" "}
                          {totalVideos === 1 ? "video" : "videos"}
                        </>
                      ) : (
                        "No videos found"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Videos Grid */}
              {videosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <Card className="p-12 text-center">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t("allVideos.noVideosFound")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("allVideos.noVideosDescription")}
                  </p>
                  <Button onClick={() => navigate("/product/upload")}>
                    {t("allVideos.uploadVideo")}
                  </Button>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                    {videos.map((video) => {
                      const isNew =
                        video.created_on &&
                        Date.now() - new Date(video.created_on).getTime() <
                        60000;

                      return (
                        <VideoCard
                          key={video.public_id}
                          id={video.public_id || ""}
                          title={video.title}
                          posterUrl={video.poster_url}
                          duration={video.duration}
                          onClick={() => handleVideoClick(video)}
                          onDelete={handleDeleteVideo}
                          isDeleting={deletingVideoId === video.public_id}
                          status={video.status}
                          streamer_name={video.streamer_name}
                          dateDisplay={
                            <p
                              className={`text-xs mb-1 ${isNew
                                  ? "text-primary font-medium"
                                  : "text-muted-foreground"
                                }`}
                            >
                              {isNew && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                              )}
                              {video.created_on
                                ? formatRelativeTime(video.created_on)
                                : t("common.unknownDate")}
                            </p>
                          }
                        />
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) {
                                handlePageChange(currentPage - 1);
                              }
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) {
                                handlePageChange(currentPage + 1);
                              }
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </HeaderConfigProvider>
  );
};

export default AllVideos;
