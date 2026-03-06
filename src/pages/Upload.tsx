import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Upload as UploadIcon, X, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import apiService from "@/services/api";
import { VideoUploadResponse, FinalizeUploadRequest } from "@/types";
import { generatePosterFromVideo, formatBytes } from "@/utils/videoUtils";

type UploadState =
  | "idle"
  | "initiated"
  | "uploading"
  | "receiving"
  | "processing"
  | "completed"
  | "failed";

const Upload = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [language, setLanguage] = useState("english");
  const [getAIClips, setGetAIClips] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [posterUploadProgress, setPosterUploadProgress] = useState(0);
  const [videoUploadedBytes, setVideoUploadedBytes] = useState(0);
  const [videoTotalBytes, setVideoTotalBytes] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadDetails, setUploadDetails] =
    useState<VideoUploadResponse | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [generatingClips, setGeneratingClips] = useState(false);
  const [streamUploadComplete, setStreamUploadComplete] = useState(false);
  const [finalizePayload, setFinalizePayload] = useState<FinalizeUploadRequest | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetUploadState = () => {
    setUploading(false);
    setUploadStatus("idle");
    setUploadProgress(0);
    setVideoUploadProgress(0);
    setPosterUploadProgress(0);
    setVideoUploadedBytes(0);
    setVideoTotalBytes(0);
    setStatusMessage("");
    setUploadDetails(null);
    setPublicId(null);
    setGeneratingClips(false);
    setStreamUploadComplete(false);
    setFinalizePayload(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Only allow .mp4 video files - validate both MIME type and file extension
      const fileName = selectedFile.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      const hasValidExtension = fileExtension === '.mp4';
      const hasValidMimeType = selectedFile.type === '' || selectedFile.type === 'video/mp4';

      // Reject if extension is not .mp4 OR if MIME type is set and not video/mp4
      if (!hasValidExtension || (selectedFile.type !== '' && !hasValidMimeType)) {
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        toast({
          variant: "destructive",
          description: t('upload.onlyMp4Allowed'),
        });
        return;
      }

      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
        toast({
          variant: "destructive",
          title: t('upload.videoTooLargeTitle'),
          description: t('upload.videoTooLargeDescription', {
            maxSize: formatBytes(MAX_FILE_SIZE),
            currentSize: formatBytes(selectedFile.size)
          }),
        });
        return;
      }

      setFile(selectedFile);
      resetUploadState();
      setTimeout(() => {
        handleFileUpload(selectedFile);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];

      // Only allow .mp4 video files - validate both MIME type and file extension
      const fileName = droppedFile.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
      const hasValidExtension = fileExtension === '.mp4';
      const hasValidMimeType = droppedFile.type === '' || droppedFile.type === 'video/mp4';

      // Reject if extension is not .mp4 OR if MIME type is set and not video/mp4
      if (!hasValidExtension || (droppedFile.type !== '' && !hasValidMimeType)) {
        toast({
          variant: "destructive",
          description: t('upload.onlyMp4Allowed'),
        });
        return;
      }

      // Check file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: t('upload.videoTooLargeTitle'),
          description: t('upload.videoTooLargeDescription', {
            maxSize: formatBytes(MAX_FILE_SIZE),
            currentSize: formatBytes(droppedFile.size)
          }),
        });
        return;
      }

      setFile(droppedFile);
      resetUploadState();
      setTimeout(() => {
        handleFileUpload(droppedFile);
      }, 0);
    }
  };

  const handleLinkSubmit = () => {
    if (!videoLink) {
      toast({
        variant: "destructive",
        description: t('toast.invalidLink'),
      });
      return;
    }

    toast({
      title: t('toast.comingSoon'),
      description: t('toast.comingSoonDescription'),
    });
  };

  const handleUploadError = (errorMessage: string) => {
    setUploadStatus("failed");
    setUploading(false);
    setStatusMessage(errorMessage);
    toast({
      variant: "destructive",
      title: t('toast.uploadFailed'),
      description: errorMessage,
    });
  };

  // Minimum video duration in seconds (3 minutes)
  const MIN_VIDEO_DURATION = 180;
  // Maximum video duration in seconds (60 minutes)
  const MAX_VIDEO_DURATION = 3600;
  // Maximum file size in bytes (1GB)
  const MAX_FILE_SIZE = 1073741824;

  const handleFileUpload = async (fileToUpload?: File) => {
    const fileToProcess = fileToUpload || file;
    if (!fileToProcess) {
      toast({
        variant: "destructive",
        description: t('toast.invalidFile'),
      });
      return;
    }

    setUploading(true);
    setUploadStatus("initiated");
    setUploadProgress(1);
    setVideoUploadProgress(0);
    setPosterUploadProgress(0);
    setStatusMessage(t('upload.preparingUpload'));

    try {
      setStatusMessage(t('upload.generatingPoster'));
      const posterData = await generatePosterFromVideo(fileToProcess, 1);
      const posterBlob = posterData.blob;
      const videoDuration = posterData.duration;
      const posterFileName = `${fileToProcess.name.replace(
        /\.[^/.]+$/,
        ""
      )}_poster.jpg`;

      // Check minimum video duration (3 minutes)
      if (videoDuration < MIN_VIDEO_DURATION) {
        const minMinutes = Math.floor(MIN_VIDEO_DURATION / 60);
        const currentMinutes = Math.floor(videoDuration / 60);
        const currentSeconds = Math.floor(videoDuration % 60);

        // Reset file state so user can upload a new video
        setFile(null);
        setUploadStatus("idle");
        setUploading(false);
        setUploadProgress(0);
        setStatusMessage("");

        // Clear the file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        toast({
          variant: "destructive",
          title: t('upload.videoTooShortTitle'),
          description: t('upload.videoTooShortDescription', {
            minDuration: minMinutes,
            currentDuration: `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`
          }),
        });
        return;
      }

      // Check maximum video duration (60 minutes)
      if (videoDuration > MAX_VIDEO_DURATION) {
        const maxMinutes = Math.floor(MAX_VIDEO_DURATION / 60);
        const currentMinutes = Math.floor(videoDuration / 60);
        const currentSeconds = Math.floor(videoDuration % 60);

        // Reset file state so user can upload a new video
        setFile(null);
        setUploadStatus("idle");
        setUploading(false);
        setUploadProgress(0);
        setStatusMessage("");

        // Clear the file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }

        toast({
          variant: "destructive",
          title: t('upload.videoTooLongTitle'),
          description: t('upload.videoTooLongDescription', {
            maxDuration: maxMinutes,
            currentDuration: `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`
          }),
        });
        return;
      }

      setUploadProgress(5);
      setStatusMessage(t('upload.posterGenerated'));

      setStatusMessage(t("upload.requestingPresignedUrls"));
      const presignPayload = {
        video_filename: fileToProcess.name,
        video_content_type: fileToProcess.type || "application/octet-stream",
        video_size: fileToProcess.size,
        poster_filename: posterFileName,
        poster_content_type: "image/jpeg",
        poster_size: posterBlob.size,
        expires_in: 900,
      };

      const presignResponse = await apiService.requestPresignedUrls(
        presignPayload
      );
      setUploadProgress(10);
      setStatusMessage(t("upload.presignedUrlsReceived"));
      setPublicId(presignResponse.public_id);

      setStatusMessage(t("upload.uploadingVideoToS3"));
      setUploadStatus("uploading");
      setVideoTotalBytes(fileToProcess.size);
      await apiService.uploadToPresignedUrl(
        presignResponse.video_upload_url,
        fileToProcess,
        fileToProcess.type || "application/octet-stream",
        (percent, loadedBytes, totalBytes) => {
          if (loadedBytes !== undefined && totalBytes !== undefined) {
            setVideoUploadedBytes(loadedBytes);
            setVideoTotalBytes(totalBytes);
            // Calculate video progress percentage from actual bytes
            const videoProgressPercent = Math.round((loadedBytes / totalBytes) * 100);
            setVideoUploadProgress(videoProgressPercent);
            // Overall progress: 10% base + 70% of video progress
            setUploadProgress(10 + Math.round(videoProgressPercent * 0.7));
          } else {
            // Fallback to percent if bytes not available
            setVideoUploadProgress(percent);
            setUploadProgress(10 + Math.round(percent * 0.7));
          }
        }
      );
      setVideoUploadProgress(100);
      setStatusMessage(t("upload.videoUploadedSuccessfully"));

      setStatusMessage(t("upload.uploadingPosterToS3"));
      await apiService.uploadToPresignedUrl(
        presignResponse.poster_upload_url,
        posterBlob,
        "image/jpeg",
        (percent) => {
          setPosterUploadProgress(percent);
          setUploadProgress(80 + Math.round(percent * 0.1));
        }
      );
      setPosterUploadProgress(100);
      setStatusMessage(t("upload.posterUploadedSuccessfully"));

      setUploadProgress(100);
      setStreamUploadComplete(true);
      setUploading(false);
      setUploadStatus("completed");
      setStatusMessage(t('upload.uploadCompleteStatus'));

      const title = fileToProcess.name.replace(/\.[^/.]+$/, "");
      const payload = {
        upload_id: presignResponse.upload_id,
        public_id: presignResponse.public_id,
        title,
        video_s3_key: presignResponse.video_key,
        video_size: fileToProcess.size,
        duration: videoDuration,
        poster_s3_key: presignResponse.poster_key,
        poster_size: posterBlob.size,
        language,
        get_ai_clips: getAIClips,
        template_id:
          getAIClips && selectedTemplateId ? selectedTemplateId : undefined,
        style_id: getAIClips && selectedStyleId ? selectedStyleId : undefined,
      };
      setFinalizePayload(payload);

      setUploadDetails({
        message: t('upload.uploadComplete'),
        upload_id: presignResponse.upload_id,
        progress_url: '',
        title,
        s3_key: presignResponse.video_key,
        video_url: presignResponse.video_upload_url.split('?')[0],
        poster_s3_key: presignResponse.poster_key,
        poster_url: presignResponse.poster_upload_url.split('?')[0],
        file_size: fileToProcess.size,
        duration: videoDuration,
        filename: fileToProcess.name,
      } as VideoUploadResponse);

      toast({
        title: t('upload.uploadComplete'),
        description: t('upload.uploadCompleteDescription'),
      });
    } catch (error) {
      handleUploadError(
        (error as Error).message || t("upload.uploadError")
      );
    }
  };

  const handleRemoveFile = () => {
    resetUploadState();
    setFile(null);
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleGetClips = async () => {
    if (!streamUploadComplete || !finalizePayload) {
      toast({
        variant: "destructive",
        description: t("upload.waitForUpload"),
      });
      return;
    }

    setGeneratingClips(true);
    setStatusMessage(t("upload.finalizingUpload"));

    try {
      const response = await apiService.finalizeUpload(finalizePayload);
      setUploadDetails(response);

      toast({
        title: t("upload.clipsGenerationStarted"),
        description: t("upload.clipsGenerationDescription"),
        duration: 6000,
      });

      setTimeout(() => {
        navigate('/product/dashboard');
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("upload.clipsGenerationFailed"),
        description: (error as Error).message || t("common.toast.error"),
      });
    } finally {
      setGeneratingClips(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-20">
      {/* Header with Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('upload.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t('upload.subtitle')}</p>
      </div>

      {/* File Upload - Hide during upload, show when idle or failed */}
      {(uploadStatus === "idle" || uploadStatus === "failed") && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center mb-6 sm:mb-8 transition-colors cursor-pointer ${isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".mp4,video/mp4"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-lg mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <UploadIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <p className="text-base sm:text-lg font-medium mb-2">
              {file ? file.name : t('upload.clickToBrowse')}{" "}
              {t('upload.dragDrop')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              {t('upload.supportedFileType')}
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-foreground mb-1">
                {t('upload.suggestionTitle')}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('upload.suggestionDetails')}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Settings - Show during upload or after completion */}
      {file && uploadStatus !== "completed" && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in mb-8">
          {/* File Info - Only show during upload */}
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center">
                  <UploadIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base truncate">
                  {file.name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {uploadStatus === "failed"
                    ? t('upload.uploadFailed')
                    : uploading
                      ? statusMessage || t('upload.uploading')
                      : t('upload.readyToUpload')}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator - Single Combined Progress Bar */}
          {uploadStatus !== "idle" && (
            <div className="space-y-3">
              {/* Main Progress Bar */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">
                      {statusMessage || t('upload.uploading')}
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {uploadStatus === "uploading" && videoUploadProgress > 0
                        ? `${videoUploadProgress}%`
                        : `${uploadProgress}%`}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
                      style={{
                        width: `${uploadStatus === "uploading" && videoUploadProgress > 0
                          ? videoUploadProgress
                          : uploadProgress}%`
                      }}
                    />
                  </div>
                  {/* File size info during video upload */}
                  {file && uploadStatus === "uploading" && videoUploadProgress > 0 && videoUploadProgress < 100 && (
                    <div className="text-xs text-muted-foreground text-right">
                      {formatBytes(videoUploadedBytes || (file.size * videoUploadProgress) / 100)} / {formatBytes(videoTotalBytes || file.size)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Uploaded File Window - Show when upload is completed */}
      {uploadStatus === "completed" && file && uploadDetails && (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {file.name}
                  </p>
                  <span className="text-xs text-muted-foreground bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                    {t('upload.uploaded')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  {uploadDetails.title}
                </p>
                {uploadDetails.duration && (
                  <p className="text-xs text-muted-foreground">
                    {t('upload.duration')}: {Math.floor(uploadDetails.duration / 60)}:
                    {(uploadDetails.duration % 60)
                      .toFixed(0)
                      .padStart(2, "0")}
                  </p>
                )}
                {uploadDetails.file_size && (
                  <p className="text-xs text-muted-foreground">
                    {t('upload.size')}: {formatBytes(uploadDetails.file_size)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                title={t("upload.removeFile")}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Settings and Get Clips Button - Show when upload is completed */}
      {uploadStatus === "completed" && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Get Clips Button - Only enabled when stream upload is completed */}
          <Button
            className="w-full bg-primary hover:opacity-90 text-white font-medium py-4 sm:py-6 text-sm sm:text-base"
            onClick={handleGetClips}
            disabled={!streamUploadComplete || generatingClips}
          >
            {generatingClips ? t('upload.generatingClips') : t('upload.getClips')}
          </Button>
        </div>
      )}
    </main>
  );
};

export default Upload;
