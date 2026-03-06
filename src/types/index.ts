// Core data types for the video editor application

import { SubtitleSegment } from "./subtitle";

// Video status type
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'deleted' | 'failed' | 'skipped';

export interface VideoData {
  id: string;
  video_url: string;
  title: string;
  duration: number;
  thumbnail?: string;
  aspectRatio: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Additional fields from backend
  public_id?: string;
  poster_url?: string;
  created_on?: string; // Backend timestamp field
  status?: VideoStatus; // Processing status
  streamer_name?: string | null; // Streamer name for Twitch videos, "Direct Upload" for uploaded videos
}

export interface TextBlock {
  id: string;
  type: 'headline' | 'subtitle';
  text: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: TextStyles;
}

export interface TextStyles {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number };
  textStroke: { enabled: boolean; color: string; width: number };
  textAlign: string;
  borderRadius: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  aspectRatio: string;
  thumbnail: string;
  textBlocks: TextBlock[];
  layout: {
    headlinePosition: { x: number; y: number };
    subtitlePosition: { x: number; y: number };
    headlineSize: { width: number; height: number };
    subtitleSize: { width: number; height: number };
  };
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface SubtitleData {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  style: string;
  highlight?: boolean;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  speaker?: string;
  confidence?: number;
}

export interface ProjectData {
  id: string;
  name: string;
  video: VideoData;
  textBlocks: TextBlock[];
  subtitles: SubtitleData[];
  transcript: TranscriptSegment[];
  selectedTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  videos: T[];
  total_video: number; // Backend API field name
  total_videos?: number; // Legacy support (fallback)
  has_next: boolean;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface VideoUploadResponse {
  message: string;
  upload_id: string;
  progress_url: string;
  title: string;
  s3_key: string;
  video_url: string;
  poster_s3_key: string;
  poster_url: string;
  file_size: number;
  duration: number | null;
  filename: string;
}

export interface UploadProgressResponse {
  upload_id?: string;
  progress: number;
  status: string;
  file_size?: number;
  error?: string;
  poster_url?: string;
  poster_s3_key?: string;
  duration?: number;
}

// Presigned URL upload flow types
export interface PresignRequest {
  video_filename: string;
  video_content_type: string;
  video_size: number;
  poster_filename: string;
  poster_content_type: string;
  poster_size: number;
  expires_in?: number;
}

export interface PresignResponse {
  upload_id: string;
  public_id: string;
  video_upload_url: string;
  video_key: string;
  poster_upload_url: string;
  poster_key: string;
}

export interface FinalizeUploadRequest {
  upload_id: string;
  public_id: string;
  title: string;
  video_s3_key: string;
  video_size: number;
  duration: number;
  poster_s3_key: string;
  poster_size: number;
  language?: string;
  get_ai_clips?: boolean;
  template_id?: string;
  style_id?: string;
}

// Reel styling configuration
export interface ReelStylingConfig {
  'subtitle-container': {
    background: string;
    padding: string;
    'border-radius': string;
    'min-width': string;
    'max-width': string;
    'text-align': string;
    position: string;
    left: string;
    top: string;
    transform: string;
  };
  word: {
    color: string;
    'font-size': string;
    'font-family': string;
    'line-height': string;
    margin: string;
    opacity: string;
  };
  'word-being-narrated': {
    color: string;
    'font-weight': string;
    opacity: string;
  };
}

export interface ReelStyling {
  font_id: string;
  config: ReelStylingConfig;
}

// Reel customization payload (matches what we send to API)
export interface ReelCustomization {
  styleId: string;
  font_id: string;
  font_name: string;
  theme_name?: string;
  config: ReelStylingConfig;
}

// Style skin save request payload for POST /reels/{reel_id}/style/skin
export interface SaveStyleSkinRequest {
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

// Style skin history entry from API
export interface StyleSkinHistoryEntry {
  style_skin_id: number;
  version: string;
  theme_name: string;
  style_skin: Record<string, any>;
  created_on: string;
  updated_on: string;
}

// Reel status type
export type ReelStatus = 'pending' | 'processing' | 'completed' | 'deleted' | 'failed' | 'skipped';

// Reel data structure from API
export interface ReelData {
  segments: SubtitleSegment[] | Record<string, any>[];
  public_id: string;
  video_url: string;
  poster_url: string;
  title: string;
  duration: number;
  transcript: string;
  streamer_name: string | null;
  viral_score: number;
  viral_reason: string;
  caption?: string;
  status?: ReelStatus;
  instagram_posted: boolean;
  tiktok_posted: boolean;
  youtube_posted: boolean;
  // Post information for published reels
  post?: {
    platform: string;
    posted: boolean;
    posted_on: string;
    reel_style_skin_id: number | null;
    reel_url: string;
    reel_poster: string;
  };
  // Style skin fields from new API
  style_skin_json?: Record<string, any>;
  style_skin_id?: number;
  style_version?: string;
  style_skin_history?: StyleSkinHistoryEntry[];
  // Timestamps
  created_on?: string;
  updated_on?: string;
  // Legacy fields (may be deprecated)
  customization_id?: number;
  customization_version?: string;
  customization_history?: any;
  // Optional styling (legacy, may be deprecated)
  styling?: ReelStyling;
  // Customization (new, returned from customize API)
  customization?: ReelCustomization;
}

// API response for reels list
export interface ReelsListResponse {
  reels: ReelData[];
}

// Project with reels
export interface ProjectWithReels {
  id: string;
  title: string;
  poster_url?: string;
  reels: ReelData[];
  createdAt: Date;
  updatedAt: Date;
}

// Font data structure from API
export interface FontData {
  id: string;
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'cursive';
  source: 'system' | 'google' | 'custom';
  googleFont?: boolean;
  weights?: string[];
  url?: string;
  // Custom font file URL (for fonts hosted on our server)
  fontFileUrl?: string;
}

// API response for fonts list
export interface FontsListResponse {
  fonts: FontData[];
}
