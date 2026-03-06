import { AppHeader } from "@/components/layout/AppHeader";
import { HeaderConfigProvider, useHeaderConfig } from "@/contexts/HeaderConfigContext";
import { BaseVideoPlayer } from "@/components/video-editor/BaseVideoPlayer";
import { ReelVideoControls } from "@/components/video-editor/ReelVideoControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { PublishedReelPreview } from "@/components/common/PublishedReelPreview";
import apiService from "@/services/api";
import { ReelData } from "@/types";
import {
  SubtitleSegment,
  SubtitleConfig,
  SubtitlePosition,
  TitleConfig,
  TitlePosition,
} from "@/types/subtitle";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDevice } from "@/hooks/use-device";
import { useToast } from "@/hooks/use-toast";
import { useFonts } from "@/hooks/useFonts";
import { useVideoExport } from "@/hooks/useVideoExport";
import { useInstagramPublish } from "@/hooks/useInstagramPublish";
import {
  Edit2,
  Save,
  X,
  Instagram,
  Youtube,
  Loader2,
  CircleCheckBig,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  Send,
  Play,
  Pause,
} from "lucide-react";

const ReelDetailsContent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { reelId } = useParams<{ reelId: string }>();
  const { toast } = useToast();
  const { isMobile, isTablet } = useDevice();
  const { loadFontById } = useFonts();
  const { exportVideo: exportVideoWithToast, isExporting } = useVideoExport();
  const { publishToInstagram } = useInstagramPublish();
  const { setHeaderConfig } = useHeaderConfig();
  const [reel, setReel] = useState<ReelData | null>(null);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const mobileVideoContentRef = useRef<HTMLDivElement>(null);
  const [subtitleSegments, setSubtitleSegments] = useState<SubtitleSegment[]>(
    []
  );
  const [subtitleConfig, setSubtitleConfig] = useState<Partial<SubtitleConfig>>(
    {}
  );
  const [wordSubtitlePosition, setWordSubtitlePosition] =
    useState<SubtitlePosition>({ x: 50, y: 80, centered: true });
  const [subtitleStyleId, setSubtitleStyleId] = useState<string | undefined>(
    undefined
  );
  // Style skin ID from API (numeric ID for publishing)
  const [styleSkinId, setStyleSkinId] = useState<number | undefined>(undefined);
  console.log("🚀 ~ ReelDetails ~ subtitleConfig:", subtitleConfig);

  // Title state
  const [titleText, setTitleText] = useState<string>("");
  const [titleDuration, setTitleDuration] = useState<number>(5);
  const [titleConfig, setTitleConfig] = useState<Partial<TitleConfig>>({});
  const [titlePosition, setTitlePosition] = useState<TitlePosition>({
    x: 50,
    y: 15,
    centered: true,
  });
  const [showTitle, setShowTitle] = useState<boolean>(true);

  const handleBack = useCallback(() => {
    // Priority: 1. projectId from API, 2. projectId from location state, 3. browser back
    const projectIdToUse = projectId || (location.state as { projectId?: string } | null)?.projectId;
    if (projectIdToUse) {
      navigate(`/product/project/${projectIdToUse}/reels`);
    } else {
      navigate(-1);
    }
  }, [location.state, navigate, projectId]);

  // Set header actions for this page (variant and ui are handled by route defaults)
  useEffect(() => {
    setHeaderConfig({
      actions: { onBack: handleBack },
    });
  }, [handleBack, setHeaderConfig]);

  // Override BaseVideoPlayer height for mobile to fill viewport
  useEffect(() => {
    if (isMobile && mobileVideoContentRef.current) {
      const observer = new MutationObserver(() => {
        const videoContent = mobileVideoContentRef.current?.querySelector(
          ".video-content"
        ) as HTMLElement;
        if (videoContent) {
          videoContent.style.height = "100%";
          videoContent.style.maxHeight = "100%";
        }
      });

      observer.observe(mobileVideoContentRef.current, {
        childList: true,
        subtree: true,
      });

      // Also set immediately
      const videoContent = mobileVideoContentRef.current.querySelector(
        ".video-content"
      ) as HTMLElement;
      if (videoContent) {
        videoContent.style.height = "100%";
        videoContent.style.maxHeight = "100%";
      }

      return () => observer.disconnect();
    }
  }, [isMobile, reel]);

  // Caption editing state
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState("");
  const [isSavingCaption, setIsSavingCaption] = useState(false);

  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Published reels expandable section
  const [isPublishedReelsExpanded, setIsPublishedReelsExpanded] =
    useState(false);

  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Center play/pause button visibility
  const [showCenterPlayButton, setShowCenterPlayButton] = useState(true);

  // Sync center button visibility with playing state
  useEffect(() => {
    if (isPlaying) {
      // Hide button when playing (after a short delay)
      const timer = setTimeout(() => {
        setShowCenterPlayButton(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Show button when paused
      setShowCenterPlayButton(true);
    }
  }, [isPlaying]);
  const [selectedPublishedReel, setSelectedPublishedReel] = useState<{
    id: string;
    platform: "instagram" | "youtube" | string;
    platformName: string;
    publishedDate: string;
    videoUrl: string;
    thumbnailUrl?: string;
  } | null>(null);

  // Build published reels from API post data
  const publishedReels: Array<{
    id: string;
    platform: "instagram" | "youtube" | string;
    platformName: string;
    publishedDate: string;
    videoUrl: string;
    thumbnailUrl?: string;
  }> =
    reel?.post && reel.post.posted
      ? [
        {
          id: reel.public_id,
          platform: reel.post.platform,
          platformName:
            reel.post.platform === "instagram"
              ? "Instagram"
              : reel.post.platform === "youtube"
                ? "YouTube"
                : reel.post.platform.charAt(0).toUpperCase() +
                reel.post.platform.slice(1),
          publishedDate: reel.post.posted_on,
          videoUrl: reel.post.reel_url,
          thumbnailUrl: reel.post.reel_poster,
        },
      ]
      : [];

  useEffect(() => {
    const fetchReel = async () => {
      if (!reelId) {
        setReelsLoading(false);
        return;
      }

      setReelsLoading(true);

      // Start all three API calls in parallel - each updates state independently
      // This allows progressive loading: data appears as soon as each API responds

      // 1. Fetch reel info (critical - needed for basic display)
      apiService
        .getReelInfo(reelId)
        .then((reelInfo) => {
          // Set reel info directly - segments will be added when they load
          setReel({
            public_id: reelInfo.public_id,
            video_url: reelInfo.video_url,
            poster_url: reelInfo.poster_url,
            title: reelInfo.title,
            duration: reelInfo.duration,
            transcript: reelInfo.transcript,
            streamer_name: reelInfo.streamer_name,
            viral_score: reelInfo.viral_score,
            viral_reason: reelInfo.viral_reason,
            caption: reelInfo.caption || undefined,
            instagram_posted: reelInfo.instagram_posted,
            tiktok_posted: reelInfo.tiktok_posted,
            youtube_posted: reelInfo.youtube_posted,
            post: reelInfo.post, // Post data for published reels
            created_on: reelInfo.created_on,
            updated_on: reelInfo.updated_on || undefined,
            segments: [], // Will be updated when segments API completes
          });
          setCaptionValue(reelInfo.caption || "");
          setTitleValue(reelInfo.title || "");
          // Set title text and duration from API
          setTitleText(reelInfo.title || "");
          // Use title_duration from reel/{id} API if available
          if (reelInfo.title_duration !== undefined) {
            setTitleDuration(reelInfo.title_duration);
          }
          // Capture style_skin_id from reel info (primary source)
          if (reelInfo.style_skin_id !== undefined) {
            setStyleSkinId(reelInfo.style_skin_id);
          }
          // Extract project_id or video_id from API response for navigation
          // video_id is the project/video ID that can be used to navigate to project reels
          if (reelInfo.project_id) {
            setProjectId(reelInfo.project_id);
          } else if (reelInfo.video_id) {
            setProjectId(reelInfo.video_id);
          }
          setReelsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch reel info:", error);
          setReelsLoading(false);
          toast({
            title: t("common.toast.error"),
            description: t("reelDetails.errors.loadFailed"),
            variant: "destructive",
          });
        });

      // 2. Fetch segments (non-critical - can load independently)
      apiService
        .getReelSegments(reelId)
        .then((segmentsData) => {
          setSubtitleSegments(segmentsData.segments);
          // Update reel with segments (spread previous state to preserve other fields)
          setReel((prev) =>
            prev ? { ...prev, segments: segmentsData.segments } : prev
          );
        })
        .catch((error) => {
          console.warn("Failed to fetch reel segments:", error);
          // Use empty segments as fallback
          setSubtitleSegments([]);
        });

      // 3. Fetch style skin (non-critical - can load independently)
      apiService
        .getReelStyleSkin(reelId)
        .then((styleSkinData) => {
          console.log("🚀 ~ fetchReel ~ styleSkinData:", styleSkinData);
          if (!styleSkinData?.style_skin) return;

          // Store the root-level style_skin_id for publishing to Instagram (fallback if not set from reel info)
          if (styleSkinData.style_skin_id !== undefined) {
            setStyleSkinId((prev) => prev ?? styleSkinData.style_skin_id);
          }

          const styleSkin = styleSkinData.style_skin;
          let subtitleSkin: Record<string, Record<string, string>> | undefined;
          let styleId: string | undefined;
          let fontId: string | undefined;

          // Handle nested structure: style_skin.subtitle.skin
          if (styleSkin.subtitle) {
            const subtitle = styleSkin.subtitle;
            subtitleSkin = subtitle.skin || subtitle.config;
            styleId =
              subtitle.theme_name ||
              subtitle.style_skin_id ||
              styleSkinData.theme_name;
            fontId = subtitle.font_id;
          }
          // Handle flat structure: style_skin.skin (for default styles)
          else if (styleSkin.skin) {
            subtitleSkin = styleSkin.skin;
            // For flat structure, use style_skin.id (e.g., "default") or fallback to theme_name
            styleId = styleSkin.id || styleSkinData.theme_name || "default";
            // For flat structure, font info might be in style_skin directly or not available
          }

          // Apply subtitle config if found
          if (subtitleSkin) {
            // REPLACE config completely, don't merge - to override template defaults
            // Ensure the config has the correct structure
            const configToSet: Partial<SubtitleConfig> = {
              "subtitle-container": subtitleSkin["subtitle-container"] as
                | Record<string, string>
                | undefined,
              word: subtitleSkin["word"] as Record<string, string> | undefined,
              "word-being-narrated": subtitleSkin["word-being-narrated"] as
                | Record<string, string>
                | undefined,
            };
            console.log(
              "[ReelDetails] Setting subtitle config from API:",
              configToSet
            );
            setSubtitleConfig(configToSet);

            // Extract position from subtitleSkin if available
            const containerStyles = subtitleSkin["subtitle-container"] as
              | Record<string, string>
              | undefined;
            if (containerStyles?.left && containerStyles?.top) {
              const leftPercent = parseFloat(
                String(containerStyles.left).replace("%", "")
              );
              const topPercent = parseFloat(
                String(containerStyles.top).replace("%", "")
              );
              const isCentered =
                containerStyles.transform?.includes("translateX(-50%)");
              setWordSubtitlePosition({
                x: leftPercent,
                y: topPercent,
                centered: isCentered ?? true,
              });
            }
          }

          // Set style ID
          if (styleId) {
            setSubtitleStyleId(styleId);
          }

          // Load font from API response if available
          if (fontId) {
            loadFontById(fontId).catch((err) => {
              console.warn("Failed to load font from API:", err);
            });
          }

          // Extract title data from nested structure
          if (styleSkin.title) {
            const title = styleSkin.title;
            // Primary: use skin, fallback to config for backward compatibility
            const titleSkin = title.skin || title.config;

            if (titleSkin) {
              // Extract title config
              const titleConfigData: TitleConfig = {
                "title-container": titleSkin["title-container"] as Record<
                  string,
                  string
                >,
                "title-text": titleSkin["title-text"] as Record<string, string>,
              };
              setTitleConfig(titleConfigData);

              // Extract title position if available
              const containerStyles = titleSkin["title-container"] as
                | Record<string, string>
                | undefined;
              if (containerStyles?.left && containerStyles?.top) {
                const leftPercent = parseFloat(
                  String(containerStyles.left).replace("%", "")
                );
                const topPercent = parseFloat(
                  String(containerStyles.top).replace("%", "")
                );
                if (!isNaN(leftPercent) && !isNaN(topPercent)) {
                  const transform = containerStyles?.transform || "";
                  // Only centered if transform includes translateX(-50%), NOT when transform is 'none'
                  const isCentered = transform.includes("translateX(-50%)");
                  setTitlePosition({
                    x: leftPercent,
                    y: topPercent,
                    centered: isCentered,
                  });
                }
              }

              // Extract title visibility (duration comes from reel/{id} API, not style/skin)
              if (title.visible !== undefined) {
                setShowTitle(title.visible);
              }
            }
          }
        })
        .catch((error) => {
          console.warn("Failed to fetch reel style skin:", error);
          // Style skin is optional, so we just continue without it
        });
    };

    fetchReel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reelId]);

  // Join all segment texts
  const segmentText = reel?.transcript || "";

  const handleEditCaption = () => {
    setIsEditingCaption(true);
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!reelId) return;

    setIsSavingTitle(true);
    try {
      // TODO: Call API to update title
      // await apiService.updateReelTitle(reelId, titleValue);

      // For now, just update local state
      setReel((prev) => (prev ? { ...prev, title: titleValue } : null));
      setIsEditingTitle(false);

      toast({
        title: t("reelDetails.titleUpdated"),
        description: t("reelDetails.titleSaved"),
      });
    } catch (error) {
      toast({
        title: t("common.toast.error"),
        description: t("reelDetails.errors.titleSaveFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleCancelTitleEdit = () => {
    setTitleValue(reel?.title || "");
    setIsEditingTitle(false);
  };

  const handleSaveCaption = async () => {
    if (!reelId) return;

    setIsSavingCaption(true);
    try {
      // Call API to update caption
      const response = await apiService.updateReelCaption(reelId, captionValue);

      // Update local state with API response
      if (response.data) {
        setReel((prev) =>
          prev
            ? { ...prev, caption: response.data.caption || captionValue }
            : null
        );
      } else {
        // Fallback: update with local value if response structure is different
        setReel((prev) => (prev ? { ...prev, caption: captionValue } : null));
      }
      setIsEditingCaption(false);

      toast({
        title: t("reelDetails.captionUpdated"),
        description: t("reelDetails.captionSaved"),
      });
    } catch (error) {
      console.error("Failed to save caption:", error);
      toast({
        title: t("common.toast.error"),
        description: t("reelDetails.errors.saveFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSavingCaption(false);
    }
  };

  const handleCancelEdit = () => {
    setCaptionValue(reel?.caption || "");
    setIsEditingCaption(false);
  };

  const handlePublish = async (platform: "instagram" | "youtube") => {
    if (!reelId) return;

    if (platform === "instagram") {
      // Use the Instagram publish hook with persistent toast
      // Pass the style_skin_id from the reel's style configuration
      const result = await publishToInstagram(reelId, styleSkinId ?? 1);

      if (result.success) {
        // Update local state on success
        setReel((prev) => {
          if (!prev) return null;
          return { ...prev, instagram_posted: true };
        });
      }
    } else {
      // YouTube - placeholder for future implementation
      try {
        toast({
          title: t("reelDetails.publishing"),
          description: t("reelDetails.publishingDescription", {
            platform: "YouTube",
          }),
        });

        // Update local state
        setReel((prev) => {
          if (!prev) return null;
          return { ...prev, youtube_posted: true };
        });
      } catch (error) {
        toast({
          title: t("common.toast.error"),
          description: t("reelDetails.errors.publishFailed", {
            platform: "YouTube",
          }),
          variant: "destructive",
        });
      }
    }
  };

  // State for tracking published reel download
  const [downloadingReelId, setDownloadingReelId] = useState<string | null>(
    null
  );

  // Download published reel video
  const handleDownloadPublishedReel = async (
    videoUrl: string,
    platform: string,
    reelId: string
  ) => {
    try {
      setDownloadingReelId(reelId);

      // Fetch the video as a blob
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error("Failed to download video");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reel?.title || "reel"}-${platform}.mp4`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: t("reelDetails.downloadStarted"),
        description: t("reelDetails.downloadStartedDescription"),
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: t("common.toast.error"),
        description: t("reelDetails.errors.downloadFailed"),
        variant: "destructive",
      });
    } finally {
      setDownloadingReelId(null);
    }
  };

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

  const handleMobilePlayPause = () => {
    if (mobileVideoRef.current) {
      if (isPlaying) {
        mobileVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        mobileVideoRef.current.play().catch((err) => {
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

  const handleMobileSeek = (time: number) => {
    if (!mobileVideoRef.current) return;
    mobileVideoRef.current.currentTime = time;
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

  const handleMobileFullscreen = () => {
    const videoContainer = mobileContainerRef.current;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      // Enable native controls when entering fullscreen
      if (mobileVideoRef.current) {
        mobileVideoRef.current.controls = true;
      }
    } else {
      document.exitFullscreen();
      // Disable native controls when exiting fullscreen
      if (mobileVideoRef.current) {
        mobileVideoRef.current.controls = false;
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
      if (mobileVideoRef.current) {
        mobileVideoRef.current.controls = isFullscreen;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const handleExportVideo = async () => {
    if (isExporting) return;
    if (!reelId) {
      toast({
        title: t("reelDetails.exportError"),
        description: t("reelDetails.exportErrorDescription"),
        variant: "destructive",
      });
      return;
    }
    // Pass the same style_skin_id used for Instagram publish
    await exportVideoWithToast(reelId, styleSkinId ?? 1);
  };

  const handleDeleteReel = async () => {
    if (!reelId || !reel) return;

    try {
      setIsDeleting(true);
      await apiService.deleteReel(reelId);

      toast({
        title: t("reelDetails.reelDeleted"),
        description: t("reelDetails.reelDeletedDescription", {
          title: reel.title || "Reel",
        }),
      });

      // Navigate back to project reels or dashboard
      // Priority: 1. projectId from API, 2. projectId from location state, 3. dashboard
      const projectIdToUse = projectId || location.state?.projectId;
      if (projectIdToUse) {
        navigate(`/product/project/${projectIdToUse}/reels`);
      } else {
        navigate("/product/dashboard");
      }
    } catch (error: unknown) {
      console.error("Failed to delete reel:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("reelDetails.errors.deleteFailed");
      toast({
        title: t("common.toast.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Menu items for sidebar (empty for now, can add navigation later)
  const menuItems: Array<{
    id: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [];

  return (
    <div className="min-h-screen flex flex-col bg-background md:overflow-hidden md:h-screen">
      <div className="flex-shrink-0">
        <AppHeader />
      </div>
      {reelsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("reelDetails.loading")}
            </p>
          </div>
        </div>
      ) : !reel ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("reelDetails.notFound")}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden md:h-[calc(100vh-80px)]">
          {/* Mobile: Video on top */}
          <div
            className="md:hidden w-full flex-shrink-0 bg-gray-900 flex flex-col overflow-hidden"
            style={{ height: "calc(100vh - 80px)" }}
          >
            <style>{`
              @media (max-width: 767px) {
                .mobile-video-container .video-content {
                  height: 100% !important;
                  max-height: 100% !important;
                }
              }
            `}</style>
            <div
              ref={mobileVideoContentRef}
              className="mobile-video-container flex-1 flex items-center justify-center min-h-0 overflow-hidden w-full relative"
            >
              <div ref={mobileContainerRef} className="w-full h-full">
                <BaseVideoPlayer
                  ref={mobileVideoRef}
                  videoUrl={reel.video_url}
                  posterUrl={reel.poster_url}
                  subtitleStyleId={subtitleStyleId}
                  background="linear-gradient(to bottom right, #1f2937, #000000)"
                  aspectRatio="9:16"
                  isPlaying={isPlaying}
                  onTimeUpdate={setCurrentTime}
                  onDurationChange={setDuration}
                  onPlayPause={handleMobilePlayPause}
                  onReplay={() => {
                    if (mobileVideoRef.current) {
                      mobileVideoRef.current.currentTime = 0;
                      mobileVideoRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                  subtitleSegments={subtitleSegments}
                  subtitleConfig={subtitleConfig}
                  currentTime={currentTime}
                  wordSubtitlePosition={wordSubtitlePosition}
                  titleText={titleText}
                  titleConfig={titleConfig}
                  titleDuration={titleDuration}
                  titlePosition={titlePosition}
                  showTitle={showTitle}
                  showControls={false}
                  containerRef={mobileContainerRef}
                />
              </div>
              {/* Centered Play/Pause Button - Mobile */}
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showCenterPlayButton ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{ zIndex: 30 }}
                onMouseEnter={() => setShowCenterPlayButton(true)}
                onMouseLeave={() => {
                  if (isPlaying) {
                    setShowCenterPlayButton(false);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMobilePlayPause();
                  }}
                  className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center border-2 border-white/80 shadow-lg hover:bg-black/80 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                  )}
                </button>
              </div>
            </div>
            {/* Video Controls at Bottom - Mobile */}
            <div className="flex-shrink-0">
              <ReelVideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlayPause={handleMobilePlayPause}
                onSeek={handleMobileSeek}
                onFullscreen={handleMobileFullscreen}
              />
            </div>
          </div>

          {/* Left Panel - Reel Information */}
          <div className="w-full md:w-[40%] border-r border-border bg-card flex flex-col md:overflow-hidden md:h-full">
            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:min-h-0">
              {/* Mobile action bar (stacks vertically) */}
              <div className="md:hidden flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-2"
                  onClick={() => {
                    const projectIdToUse =
                      projectId || location.state?.projectId;
                    navigate(`/editor/${reel.public_id}`, {
                      state: projectIdToUse
                        ? { projectId: projectIdToUse }
                        : undefined,
                    });
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                  <span>{t("reelDetails.editVideo")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleExportVideo}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>{t("reelDetails.exportVideo")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center gap-2 text-destructive border-destructive/40 hover:border-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t("common.buttons.delete")}</span>
                </Button>
              </div>

              {/* Video Title - Editable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {isEditingTitle ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        className="text-xl md:text-2xl font-bold h-auto py-2"
                        disabled={isSavingTitle}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveTitle}
                          disabled={isSavingTitle || !titleValue.trim()}
                          className="h-8 px-3 bg-primary text-white"
                        >
                          {isSavingTitle ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span className="text-xs">
                                {t("common.buttons.saving")}
                              </span>
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" />
                              <span className="text-xs">
                                {t("common.buttons.save")}
                              </span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelTitleEdit}
                          disabled={isSavingTitle}
                          className="h-8 px-3"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span className="text-xs">
                            {t("common.buttons.cancel")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-xl md:text-2xl font-bold text-foreground flex-1">
                        {reel.title}
                      </h1>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditTitle}
                        className="h-7 px-2"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">
                          {t("common.buttons.edit")}
                        </span>
                      </Button> */}
                    </>
                  )}
                </div>
              </div>

              {/* Viral Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("reelDetails.viralScore")}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {reel.viral_score}/10
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(reel.viral_score / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Viral Reason */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("reelDetails.viralReason")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reel.viral_reason}
                </p>
              </div>

              {/* Video Caption - Editable */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t("reelDetails.videoCaption")}
                  </h3>
                  {!isEditingCaption && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditCaption}
                      className="h-7 px-2"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">
                        {t("common.buttons.edit")}
                      </span>
                    </Button>
                  )}
                </div>
                {isEditingCaption ? (
                  <div className="space-y-2">
                    <textarea
                      value={captionValue}
                      onChange={(e) => setCaptionValue(e.target.value)}
                      placeholder={t("reelDetails.captionPlaceholder")}
                      className="w-full min-h-[80px] px-3 py-2 text-sm bg-background border border-input rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveCaption}
                        disabled={isSavingCaption}
                        className="h-8 px-3 bg-primary text-white"
                      >
                        {isSavingCaption ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="text-xs">
                              {t("common.buttons.saving")}
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            <span className="text-xs">
                              {t("common.buttons.save")}
                            </span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSavingCaption}
                        className="h-8 px-3"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {t("common.buttons.cancel")}
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reel?.caption || t("reelDetails.noCaption")}
                  </p>
                )}
              </div>

              {/* Segment Text */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("reelDetails.transcription")}
                </h3>
                <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {segmentText || t("reelDetails.noTranscript")}
                  </p>
                </div>
              </div>

              {/* Publish Section */}
              <div className="space-y-3 pt-4 border-t border-border pb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {t("reelDetails.publish")}
                </h3>
                {/* Stack buttons vertically - they take full width */}
                <div className="flex flex-col lg:flex-row gap-2">
                  {/* Instagram Button */}
                  <Button
                    variant="outline"
                    className={`flex-1 justify-between items-center px-4 py-3 h-auto transition-all ${reel.instagram_posted
                      ? "bg-muted border-border text-muted-foreground cursor-not-allowed hover:bg-muted"
                      : "hover:bg-accent/60"
                      }`}
                    onClick={() => handlePublish("instagram")}
                    disabled={reel.instagram_posted}
                  >
                    {/* Left: App icon + label */}
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5 flex-shrink-0 text-[#F58529]" />
                      <span className="text-sm font-medium">Instagram</span>
                    </div>
                    {/* Right: Status */}
                    <div className="flex items-center gap-2">
                      {reel.instagram_posted ? (
                        <CircleCheckBig
                          className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0"
                        // fill="currentColor"
                        />
                      ) : (
                        <Send className="h-5 w-5 text-muted-foreground" />
                      )}

                      {/* <span className="text-xs font-medium">
                        {reel.instagram_posted
                          ? t("reelDetails.uploaded")
                          : t("reelDetails.publish")}
                      </span> */}
                    </div>
                  </Button>

                  {/* YouTube Button - Coming Soon */}
                  <Button
                    variant="outline"
                    className="flex-1 justify-between items-center px-4 py-3 h-auto transition-all bg-muted border-border text-muted-foreground cursor-not-allowed hover:bg-muted"
                    disabled={true}
                  >
                    {/* Left: YouTube icon + label */}
                    <div className="flex items-center gap-3">
                      <Youtube className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">YouTube</span>
                    </div>
                    {/* Right: Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium">
                        {t("reelDetails.comingSoon")}
                      </span>
                    </div>
                  </Button>
                </div>

                {/* Published Reels Expandable Section */}
                {publishedReels.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <button
                      onClick={() =>
                        setIsPublishedReelsExpanded(!isPublishedReelsExpanded)
                      }
                      className="w-full flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      <span>{t("reelDetails.publishedReels")}</span>
                      {isPublishedReelsExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {isPublishedReelsExpanded && (
                      <div className="space-y-3">
                        {publishedReels.map((publishedReel) => (
                          <div
                            key={publishedReel.id}
                            className="p-3 rounded-lg border border-border bg-card transition-colors"
                          >
                            {/* Top Row: Icon + Info */}
                            <div className="flex items-center gap-3 mb-3">
                              {/* Platform Icon */}
                              <div className="flex-shrink-0">
                                {publishedReel.platform === "instagram" ? (
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4] flex items-center justify-center">
                                    <Instagram className="h-5 w-5 text-white" />
                                  </div>
                                ) : publishedReel.platform === "youtube" ? (
                                  <div className="w-10 h-10 rounded-lg bg-[#FF0000] flex items-center justify-center">
                                    <Youtube className="h-5 w-5 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                    <CircleCheckBig className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Platform Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {publishedReel.platformName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    publishedReel.publishedDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Bottom Row: Action Buttons - Full Width */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9 gap-2"
                                onClick={() => {
                                  setSelectedPublishedReel(publishedReel);
                                  setPreviewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {t("reelDetails.preview")}
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9 gap-2"
                                disabled={
                                  downloadingReelId === publishedReel.id
                                }
                                onClick={() =>
                                  handleDownloadPublishedReel(
                                    publishedReel.videoUrl,
                                    publishedReel.platform,
                                    publishedReel.id
                                  )
                                }
                              >
                                {downloadingReelId === publishedReel.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                                <span className="text-xs font-medium">
                                  {t("reelDetails.download")}
                                </span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Video Player (Desktop) */}
          <div className="hidden md:flex flex-1 flex-col bg-gray-900 overflow-hidden h-full">
            {/* Top bar with Edit, Export, Delete */}
            <div className="flex items-center justify-end px-6 pt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40"
                onClick={() => {
                  // Preserve projectId when navigating to editor
                  // Priority: 1. projectId from API, 2. projectId from location state
                  const projectIdToUse = projectId || location.state?.projectId;
                  navigate(`/editor/${reel.public_id}`, {
                    state: projectIdToUse
                      ? { projectId: projectIdToUse }
                      : undefined,
                  });
                }}
              >
                <Edit2 className="h-4 w-4" />
                <span className="hidden lg:inline">
                  {t("reelDetails.editVideo")}
                </span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="group border-border/50 bg-transparent backdrop-blur-sm hover:bg-accent hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleExportVideo}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-3 w-3 text-white animate-spin" />
                ) : (
                  <Download className="h-3 w-3 text-white group-hover:text-accent-foreground transition-colors duration-200" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="group border-destructive/40 bg-transparent hover:border-destructive hover:bg-destructive/10 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            {/* Video Player - Takes remaining height */}
            <div
              ref={containerRef}
              className="flex-1 flex items-center justify-center min-h-0 w-full overflow-hidden relative"
            >
              <div className="w-full max-w-md h-full flex items-center justify-center overflow-hidden">
                <BaseVideoPlayer
                  ref={videoRef}
                  videoUrl={reel.video_url}
                  posterUrl={reel.poster_url}
                  subtitleStyleId={subtitleStyleId}
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
                  subtitleSegments={subtitleSegments}
                  subtitleConfig={subtitleConfig}
                  currentTime={currentTime}
                  wordSubtitlePosition={wordSubtitlePosition}
                  titleText={titleText}
                  titleConfig={titleConfig}
                  titleDuration={titleDuration}
                  titlePosition={titlePosition}
                  showTitle={showTitle}
                  showControls={false}
                />
              </div>
              {/* Centered Play/Pause Button - Desktop */}
              <div
                className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showCenterPlayButton && !isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                style={{ zIndex: 30 }}
                onMouseEnter={() => setShowCenterPlayButton(true)}
                onMouseLeave={() => {
                  if (isPlaying) {
                    setShowCenterPlayButton(false);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                  className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center border-2 border-white/80 shadow-lg hover:bg-black/80 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  ) : (
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Video Controls at Bottom - Full Width */}
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
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteReel}
        title={t("reelDetails.deleteReel")}
        description={t("reelDetails.deleteReelDescription", {
          title: reel?.title || "Reel",
        })}
        itemName={reel?.title}
        isDeleting={isDeleting}
      />

      {/* Published Reel Preview */}
      <PublishedReelPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        publishedReel={selectedPublishedReel}
      />
    </div>
  );
};

const ReelDetails = () => (
  <HeaderConfigProvider>
    <ReelDetailsContent />
  </HeaderConfigProvider>
);

export default ReelDetails;
