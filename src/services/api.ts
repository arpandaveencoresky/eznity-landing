// API service layer for video editor application

import {
  ApiResponse,
  PaginatedResponse,
  Template,
  ProjectData,
  VideoData,
  SubtitleData,
  TranscriptSegment,
  VideoUploadResponse,
  UploadProgressResponse,
  PresignRequest,
  PresignResponse,
  FinalizeUploadRequest,
  ReelData,
  ReelsListResponse,
  ProjectWithReels,
  FontsListResponse,
  SaveStyleSkinRequest,
  VideoStatus,
} from '../types';
import { SubtitleSegment } from '../types/subtitle';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nidifugous-informedly-oliva.ngrok-free.dev';
const EXPORT_TIMEOUT_MS = 120_000; // 2 minutes safeguard for export downloads

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildRequestConfig(options: RequestInit = {}): RequestInit {
    const token = authService.getToken();
    const isFormData = options.body instanceof FormData;

    const defaultHeaders: Record<string, string> = {
      'ngrok-skip-browser-warning': 'true',
    };

    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // Always apply bearer token if available
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Merge headers: convert options.headers to plain object if it's a Headers object
    const optionsHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          optionsHeaders[key] = value;
        });
      } else if (typeof options.headers === 'object') {
        Object.assign(optionsHeaders, options.headers);
      }
    }

    // Merge headers: defaultHeaders first, then options.headers
    const mergedHeaders: Record<string, string> = {
      ...defaultHeaders,
      ...optionsHeaders,
    };

    // Ensure bearer token is always applied (cannot be overridden)
    if (token) {
      mergedHeaders['Authorization'] = `Bearer ${token}`;
    }

    return {
      ...options,
      headers: mergedHeaders,
    };
  }

  private async requestRaw<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config = this.buildRequestConfig(options);

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.requestRaw<ApiResponse<T>>(endpoint, options);
  }

  // Template Management
  async getTemplates(): Promise<ApiResponse<Template[]>> {
    return this.request<Template[]>('/templates');
  }

  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`);
  }

  async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Template>> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: string, template: Partial<Template>): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  // Project Management
  async getProjects(): Promise<ApiResponse<ProjectData[]>> {
    return this.request<ProjectData[]>('/projects');
  }

  async getProject(id: string): Promise<ApiResponse<ProjectData>> {
    return this.request<ProjectData>(`/projects/${id}`);
  }

  async createProject(project: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProjectData>> {
    return this.request<ProjectData>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: Partial<ProjectData>): Promise<ApiResponse<ProjectData>> {
    return this.request<ProjectData>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Video Management
  async uploadVideo(file: File): Promise<ApiResponse<VideoData>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<VideoData>('/videos/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getVideo(id: string): Promise<ApiResponse<VideoData>> {
    return this.request<VideoData>(`/videos/${id}`);
  }

  // Get video information by public_id (returns status, title, etc.)
  async getVideoInfo(publicId: string): Promise<{
    streamer_name: string | null;
    duration: number;
    title: string;
    status: VideoStatus;
    public_id: string;
    processed_on: string | null;
    poster_url: string;
    video_url: string;
    created_on: string;
    updated_on: string | null;
  }> {
    return this.requestRaw<{
      streamer_name: string | null;
      duration: number;
      title: string;
      status: VideoStatus;
      public_id: string;
      processed_on: string | null;
      poster_url: string;
      video_url: string;
      created_on: string;
      updated_on: string | null;
    }>(`/videos/${publicId}`);
  }

  async getVideos(page: number = 1, limit: number = 10): Promise<PaginatedResponse<VideoData>> {
    return this.requestRaw<PaginatedResponse<VideoData>>(`/videos/upload?page=${page}&limit=${limit}`);
  }

  // Get all videos (combines both uploaded and Twitch stream videos)
  async getAllVideos(page: number = 1, limit: number = 10): Promise<PaginatedResponse<VideoData>> {
    return this.requestRaw<PaginatedResponse<VideoData>>(`/videos?page=${page}&limit=${limit}`);
  }

  // Get streamer videos (from Twitch streams)
  async getStreamerVideos(page: number = 1, limit: number = 10): Promise<PaginatedResponse<VideoData>> {
    return this.requestRaw<PaginatedResponse<VideoData>>(`/videos/streamer?page=${page}&limit=${limit}`);
  }

  async deleteVideo(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/videos/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadVideoWithProgress(
    file: File,
    onProgress?: (progressPercentage: number) => void,
    options?: {
      language?: string;
      getAIClips?: boolean;
      templateId?: string;
      styleId?: string;
    }
  ): Promise<VideoUploadResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseUrl}/videos/upload`);
      xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');

      const token = authService.getToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 90);
          onProgress(percent);
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.onabort = () => reject(new Error('Upload aborted by user'));

      xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as VideoUploadResponse;
            resolve(response);
          } catch (_error) {
            reject(new Error('Unable to parse upload response'));
          }
        } else {
          const errorText = xhr.responseText || 'Upload failed. Please try again.';
          reject(new Error(errorText));
        }
      };

      const formData = new FormData();
      formData.append('file', file);
      
      // Add optional parameters
      if (options?.language) {
        formData.append('language', options.language);
      }
      if (options?.getAIClips !== undefined) {
        formData.append('get_ai_clips', options.getAIClips.toString());
      }
      if (options?.templateId) {
        formData.append('template_id', options.templateId);
      }
      if (options?.styleId) {
        formData.append('style_id', options.styleId);
      }
      
      xhr.send(formData);
    });
  }

  async getUploadProgress(uploadId: string): Promise<UploadProgressResponse> {
    return this.requestRaw<UploadProgressResponse>(`/videos/upload/progress/${uploadId}`);
  }

  // Presigned URL upload flow
  /**
   * Request presigned URLs for video and poster uploads
   * Bearer token is automatically applied via requestRaw -> buildRequestConfig
   */
  async requestPresignedUrls(payload: PresignRequest): Promise<PresignResponse> {
    return this.requestRaw<PresignResponse>('/videos/upload/presign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Upload file directly to S3 using presigned URL
   * Note: Presigned URLs are already authenticated, so no bearer token is needed
   */
  async uploadToPresignedUrl(
    url: string,
    file: File | Blob,
    contentType: string,
    onProgress?: (progressPercentage: number, loadedBytes?: number, totalBytes?: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete, e.loaded, e.total);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', contentType);
      // Note: No Authorization header needed - presigned URLs are already authenticated
      xhr.send(file);
    });
  }

  /**
   * Finalize the upload by notifying the backend
   * Bearer token is automatically applied via requestRaw -> buildRequestConfig
   */
  async finalizeUpload(payload: FinalizeUploadRequest): Promise<VideoUploadResponse> {
    return this.requestRaw<VideoUploadResponse>('/videos/upload/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Subtitle Management
  async generateSubtitles(videoId: string): Promise<ApiResponse<SubtitleData[]>> {
    return this.request<SubtitleData[]>(`/videos/${videoId}/subtitles/generate`, {
      method: 'POST',
    });
  }

  async getSubtitles(videoId: string): Promise<ApiResponse<SubtitleData[]>> {
    return this.request<SubtitleData[]>(`/videos/${videoId}/subtitles`);
  }

  async updateSubtitles(videoId: string, subtitles: SubtitleData[]): Promise<ApiResponse<SubtitleData[]>> {
    return this.request<SubtitleData[]>(`/videos/${videoId}/subtitles`, {
      method: 'PUT',
      body: JSON.stringify(subtitles),
    });
  }

  // Transcript Management
  async generateTranscript(videoId: string): Promise<ApiResponse<TranscriptSegment[]>> {
    return this.request<TranscriptSegment[]>(`/videos/${videoId}/transcript/generate`, {
      method: 'POST',
    });
  }

  async getTranscript(videoId: string): Promise<ApiResponse<TranscriptSegment[]>> {
    return this.request<TranscriptSegment[]>(`/videos/${videoId}/transcript`);
  }

  async updateTranscript(videoId: string, transcript: TranscriptSegment[]): Promise<ApiResponse<TranscriptSegment[]>> {
    return this.request<TranscriptSegment[]>(`/videos/${videoId}/transcript`, {
      method: 'PUT',
      body: JSON.stringify(transcript),
    });
  }

  // Search and Filter
  async searchTemplates(query: string): Promise<ApiResponse<Template[]>> {
    return this.request<Template[]>(`/templates/search?q=${encodeURIComponent(query)}`);
  }

  async getTemplatesByCategory(category: string): Promise<ApiResponse<Template[]>> {
    return this.request<Template[]>(`/templates/category/${category}`);
  }

  // Project Reels Management
  async getProjectReels(videoId: string): Promise<ReelsListResponse> {
    return this.requestRaw<ReelsListResponse>(`/videos/${encodeURIComponent(videoId)}/reels`);
  }

  async getProjectWithReels(projectId: string): Promise<ApiResponse<ProjectWithReels>> {
    return this.request<ProjectWithReels>(`/projects/${projectId}`);
  }

  async getReel(reelId: string): Promise<ReelData> {
    return this.requestRaw<ReelData>(`/reels/${reelId}`);
  }

  // Get reel segments (word-by-word subtitles)
  async getReelSegments(reelId: string): Promise<{
    reel_id: string;
    segments: SubtitleSegment[];
  }> {
    return this.requestRaw<{
      reel_id: string;
      segments: SubtitleSegment[];
    }>(`/reels/${reelId}/segments`);
  }

  // Get reel information (basic reel data)
  async getReelInfo(reelId: string): Promise<{
    streamer_name: string | null;
    duration: number;
    title: string;
    title_duration?: number;
    poster_url: string;
    viral_score: number;
    viral_reason: string;
    transcript: string;
    public_id: string;
    video_id?: string;
    project_id?: string;
    video_url: string;
    instagram_posted: boolean;
    tiktok_posted: boolean;
    youtube_posted: boolean;
    caption: string | null;
    created_on: string;
    updated_on: string | null;
    style_skin_id?: number;
    post?: {
      platform: string;
      posted: boolean;
      posted_on: string;
      reel_style_skin_id: number | null;
      reel_url: string;
      reel_poster: string;
    };
  }> {
    return this.requestRaw<{
      streamer_name: string | null;
      duration: number;
      title: string;
      title_duration?: number;
      poster_url: string;
      viral_score: number;
      viral_reason: string;
      transcript: string;
      public_id: string;
      video_id?: string;
      project_id?: string;
      video_url: string;
      instagram_posted: boolean;
      tiktok_posted: boolean;
      youtube_posted: boolean;
      caption: string | null;
      created_on: string;
      updated_on: string | null;
      style_skin_id?: number;
      post?: {
        platform: string;
        posted: boolean;
        posted_on: string;
        reel_style_skin_id: number | null;
        reel_url: string;
        reel_poster: string;
      };
    }>(`/reels/${reelId}`);
  }

  // Get reel style skin configuration
  // Supports both nested structure (style_skin.subtitle.skin) and flat structure (style_skin.skin)
  async getReelStyleSkin(reelId: string): Promise<{
    reel_id: string;
    style_skin_id: number;
    style_version: string;
    theme_name: string | null;
    style_skin: {
      // Nested structure: subtitle object with skin/config
      subtitle?: {
        style_skin_id: string;
        font_id: string;
        font_name: string;
        theme_name: string;
        skin?: {
          'subtitle-container': Record<string, string>;
          word: Record<string, string>;
          'word-being-narrated': Record<string, string>;
        };
        config?: {
          'subtitle-container': Record<string, string>;
          word: Record<string, string>;
          'word-being-narrated': Record<string, string>;
        };
      };
      // Flat structure: skin directly under style_skin (for default styles)
      skin?: {
        'subtitle-container': Record<string, string>;
        word: Record<string, string>;
        'word-being-narrated': Record<string, string>;
      };
      // Title structure
      title?: {
        duration: number;
        visible: boolean;
        style_skin_id: string;
        font_id: string;
        font_name: string;
        skin?: {
          'title-container': Record<string, string>;
          'title-text': Record<string, string>;
        };
        config?: {
          'title-container': Record<string, string>;
          'title-text': Record<string, string>;
        };
      };
      // Additional fields that might be present in flat structure
      id?: string;
      name?: string;
      description?: string;
      category?: string;
    };
    style_skin_history: unknown | null;
    created_on: string;
    updated_on: string | null;
  }> {
    return this.requestRaw<{
      reel_id: string;
      style_skin_id: number;
      style_version: string;
      theme_name: string | null;
      style_skin: {
        subtitle?: {
          style_skin_id: string;
          font_id: string;
          font_name: string;
          theme_name: string;
          skin?: {
            'subtitle-container': Record<string, string>;
            word: Record<string, string>;
            'word-being-narrated': Record<string, string>;
          };
          config?: {
            'subtitle-container': Record<string, string>;
            word: Record<string, string>;
            'word-being-narrated': Record<string, string>;
          };
        };
        skin?: {
          'subtitle-container': Record<string, string>;
          word: Record<string, string>;
          'word-being-narrated': Record<string, string>;
        };
        title?: {
          duration: number;
          visible: boolean;
          style_skin_id: string;
          font_id: string;
          font_name: string;
          skin?: {
            'title-container': Record<string, string>;
            'title-text': Record<string, string>;
          };
          config?: {
            'title-container': Record<string, string>;
            'title-text': Record<string, string>;
          };
        };
        id?: string;
        name?: string;
        description?: string;
        category?: string;
      };
      style_skin_history: unknown | null;
      created_on: string;
      updated_on: string | null;
    }>(`/reels/${reelId}/style/skin`);
  }

  async updateReelStyling(reelId: string, styling: ReelData['styling']): Promise<ApiResponse<ReelData>> {
    return this.request<ReelData>(`/reels/${reelId}/styling`, {
      method: 'PUT',
      body: JSON.stringify({ styling }),
    });
  }

  async updateReelCaption(reelId: string, caption: string): Promise<ApiResponse<ReelData>> {
    return this.request<ReelData>(`/reels/${reelId}`, {
      method: 'PATCH',
      body: JSON.stringify({ caption }),
    });
  }

  async deleteReel(reelId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/reels/${reelId}`, {
      method: 'DELETE',
    });
  }

  // Font Management
  async getFonts(): Promise<FontsListResponse> {
    return this.requestRaw<FontsListResponse>('/fonts');
  }

  // Reel Style Skin - Save video styles
  async saveStyleSkin(
    reelId: string,
    payload: {
      subtitle: {
        style_skin_id: string;
        font_id: string;
        font_name: string;
        theme_name: string;
        skin: Record<string, unknown>;
      };
      title?: {
        content: string;
        duration: number;
        visible: boolean;
        style_skin_id: string;
        font_id: string;
        font_name: string;
        skin: Record<string, unknown>;
      };
    }
  ): Promise<ApiResponse<unknown>> {
    return this.request<unknown>(`/reels/${reelId}/style/skin`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Legacy: Reel Customization (deprecated, use saveStyleSkin instead)
  async customizeReel(
    reelId: string,
    payload: {
      styleId: string;
      font_id: string;
      font_name: string;
      theme_name?: string;
      config: Record<string, unknown>;
    }
  ): Promise<ApiResponse<unknown>> {
    // Map old payload format to new style/skin format
    return this.saveStyleSkin(reelId, {
      subtitle: {
        style_skin_id: payload.styleId,
        font_id: payload.font_id,
        font_name: payload.font_name,
        theme_name: payload.theme_name || '',
        skin: payload.config,
      },
    });
  }

  // Export Video
  async exportVideo(reelId: string, styleSkinId: number = 1): Promise<Blob> {
    const url = `${this.baseUrl}/reels/${reelId}/export`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('Export download timeout'), EXPORT_TIMEOUT_MS);
    const config = this.buildRequestConfig({
      method: 'POST',
      body: JSON.stringify({ style_skin_id: styleSkinId }),
      signal: controller.signal,
    });

    const response = await fetch(url, config).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      const errorMessage = errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Prefer streaming the response to ensure the full payload is downloaded
    const reader = response.body?.getReader();
    const expectedLength = Number(response.headers.get('content-length') || 0);
    const contentType = response.headers.get('content-type') || 'video/mp4';

    if (!reader) {
      // Fallback for environments without readable streams
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Empty export response. Please retry export.');
      }
      return blob;
    }

    const chunks: BlobPart[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      chunks.push(value);
      received += value.length;
    }

    // If server reported a length and we got less, treat as failure
    if (expectedLength > 0 && received < expectedLength) {
      throw new Error('Download incomplete. Please retry export.');
    }

    const blob = new Blob(chunks, { type: contentType });
    if (!blob || blob.size === 0) {
      throw new Error('Empty export response. Please retry export.');
    }
    return blob;
  }

  // Publish Reel to Instagram
  async publishToInstagram(
    reelId: string,
    styleSkinId: number = 1
  ): Promise<{ message: string }> {
    const url = `${this.baseUrl}/instagram/upload/reel?reel_id=${encodeURIComponent(reelId)}`;
    const config = this.buildRequestConfig({
      method: 'POST',
      body: JSON.stringify({ style_skin_id: styleSkinId }),
    });

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
      const errorMessage = errorData?.message || errorData?.detail || errorData?.error || `Failed to publish to Instagram`;
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  // Subscription Plans
  async getSubscriptionPlans(): Promise<ApiResponse<unknown>> {
    return this.requestRaw<ApiResponse<unknown>>('/subscription/plans');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
