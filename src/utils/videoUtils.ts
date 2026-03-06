/**
 * Utility functions for video processing
 */

export interface PosterGenerationResult {
  blob: Blob;
  duration: number;
}

/**
 * Generates a poster image (thumbnail) from a video file by capturing a frame at a specific time
 * @param file - The video file to generate poster from
 * @param captureAtSeconds - Time in seconds to capture the frame (default: 1 second)
 * @returns Promise resolving to blob and video duration
 */
export const generatePosterFromVideo = (
  file: File,
  captureAtSeconds: number = 1
): Promise<PosterGenerationResult> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const url = URL.createObjectURL(file);

    video.src = url;
    video.preload = 'auto';
    video.muted = true;
    video.currentTime = 0;

    video.onloadedmetadata = () => {
      // Ensure capture time is within video duration
      if (video.duration < captureAtSeconds) {
        captureAtSeconds = Math.min(video.duration, 0.1);
      }
      video.currentTime = captureAtSeconds;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve({
              blob: blob,
              duration: video.duration,
            });
          } else {
            reject(new Error('Failed to create poster blob'));
          }
        },
        'image/jpeg',
        0.9
      );
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
};

/**
 * Formats bytes to human-readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

