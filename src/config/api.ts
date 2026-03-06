// API configuration and environment setup

// Environment configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_URL || 'https://nidifugous-informedly-oliva.ngrok-free.dev',
  
  // Use mock data in development
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.MODE === 'development',
  
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot/password',
      VERIFY_OTP: '/auth/verify/otp',
      RESET_PASSWORD: '/auth/reset/password',
    },
    // Application endpoints
    TEMPLATES: '/templates',
    PROJECTS: '/projects',
    REELS: '/reels',
    REEL_DETAILS: (reelId: string) => `/reels/${reelId}`,
    REEL_STYLE_SKIN: (reelId: string) => `/reels/${reelId}/style/skin`,
    REEL_EXPORT: (reelId: string) => `/reels/${reelId}/export`,
    PROJECT_REELS: (videoId: string) => `/videos/${videoId}/reels`,
    VIDEOS: '/videos',
    VIDEOS_UPLOAD: '/videos/upload',
    SUBTITLES: '/subtitles',
    TRANSCRIPT: '/transcript',
    FONTS: '/fonts',
  },
  
  // Request timeouts
  TIMEOUTS: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000,  // 30 seconds for file uploads
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_TEMPLATE_SAVING: true,
  ENABLE_AUTO_SAVE: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: import.meta.env.MODE === 'production',
  // Bypass authentication for development/testing
  BYPASS_AUTH: false,
  // Use static fallback data instead of API calls (for development/testing)
  USE_STATIC_DATA: false,
};

// API service factory
export const createApiService = () => {
  if (API_CONFIG.USE_MOCK_DATA) {
    // Import mock service dynamically to avoid bundling in production
    return import('../services/mockData').then(module => module.mockApiService);
  } else {
    // Import real API service
    return import('../services/api').then(module => module.apiService);
  }
};

// Dummy user data for bypass mode
export const DUMMY_USER = {
  name: 'Test User',
  email: 'test@example.com',
  connected_accounts: {
    tiktok: {
      avatar_url: null,
      display_name: null,
      connected: false,
    },
    instagram: {
      avatar_url: null,
      display_name: null,
      connected: false,
    },
    youtube: {
      avatar_url: null,
      display_name: null,
      connected: false,
    },
    twitch: {
      avatar_url: null,
      display_name: null,
      connected: false,
    },
  },
  active_plan: null,
};

// Dummy token for bypass mode
export const DUMMY_TOKEN = 'dummy_auth_token_bypass_mode';

// Dummy project/video data for bypass mode
export const DUMMY_PROJECT_DATA = {
  message: "Video metadata stored successfully",
  title: "What \"A Ruler\" meant for most Indians",
  public_id: "2025112019038666AE002D9849705",
  s3_key: "ixekka2r4f/uploaded/202511261320B79DC96C7641D3505/clip/202511261AF9D7C06D03A4CE33505.mp4",
  video_url: "https://s3.ap-south-1.amazonaws.com/eznity.rivio/ixekka2r4f/uploaded/202511261320B79DC96C7641D3505/clip/202511261AF9D7C06D03A4CE33505.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASPPXONISOSYNULMC%2F20251126%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251126T080506Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0f72c5b101c1041a47aced8f2e1ef7a3355b7272245c5969137d10c2e6ef6c06",
  poster_s3_key: "ixekka2r4f/uploaded/202511261320B79DC96C7641D3505/clip/202511261AF9D7C06D03A4CE33505_poster.jpg",
  poster_url: "https://s3.ap-south-1.amazonaws.com/eznity.rivio/ixekka2r4f/uploaded/202511261320B79DC96C7641D3505/clip/202511261AF9D7C06D03A4CE33505_poster.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASPPXONISOSYNULMC%2F20251126%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251126T080506Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=1b98fd03ca38ee4a6fd15027b0872cf27013af94738338554fa1032ddf6c5005",
  file_size: 4231076,
  duration: 58.849478,
  filename: "202511261AF9D7C06D03A4CE33505.mp4"
};

// Dummy reels data for static/fallback mode
export const DUMMY_REELS_DATA = [
  {
    public_id: '20251120143C0D3E0D48A4C633505',
    video_url: 'https://s3.ap-south-1.amazonaws.com/eznity.rivio/sample/reel1.mp4',
    poster_url: 'https://s3.ap-south-1.amazonaws.com/eznity.rivio/sample/reel1_poster.jpg',
    title: 'Kenyan Student Mistaken For Canadian, Funny Ruler Mix-up',
    duration: 41.034,
    transcript: "I went to school on the first day and all the kids were like, why are you talking like that? I was like, it's because I'm from Kenya. And they looked at me and went, oh, this new kid is from Canada, it seems. All right, I guess I'm from Canada now.",
    streamer_name: null,
    viral_score: 8,
    viral_reason: "Clear setup (accused of a fake accent / 'you're from Canada'), escalating comedic misunderstanding, and a tight punchline with cultural wordplay ('ruler' vs 'scale'). Relatable, surprising, and very shareable.",
    instagram_posted: false,
    tiktok_posted: false,
    youtube_posted: false,
    segments: [],
    styling: {
      font_id: 'font-1',
      config: {
        'subtitle-container': {
          background: 'transparent',
          padding: '0px',
          'border-radius': '0px',
          'min-width': '200px',
          'max-width': '85%',
          'text-align': 'center',
          position: 'absolute',
          left: '50%',
          top: '80%',
          transform: 'translate(-50%, -50%)',
        },
        word: {
          color: '#ffffff',
          'font-size': '12px',
          'font-family': '"Montserrat", sans-serif',
          'line-height': '1.35',
          margin: '0 2px',
          opacity: '0.65',
        },
        'word-being-narrated': {
          color: '#ffd95a',
          'font-weight': 'bold',
          opacity: '1',
        },
      },
    },
  },
  {
    public_id: '20251120143C0D3E0D48A4C633506',
    video_url: 'https://s3.ap-south-1.amazonaws.com/eznity.rivio/sample/reel2.mp4',
    poster_url: 'https://s3.ap-south-1.amazonaws.com/eznity.rivio/sample/reel2_poster.jpg',
    title: 'The Scale vs Ruler Confusion - Part 2',
    duration: 35.5,
    transcript: "I turned around and I asked my friend, do you have a ruler? My friend was very confused. She looked at me and said, listen, Canada, India has a democracy. So now I had a point of the pencil case.",
    streamer_name: null,
    viral_score: 7,
    viral_reason: "Great continuation of the comedic setup with the democracy punchline. Cultural humor that resonates across audiences.",
    instagram_posted: true,
    tiktok_posted: false,
    youtube_posted: false,
    segments: [],
    styling: {
      font_id: 'font-2',
      config: {
        'subtitle-container': {
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 16px',
          'border-radius': '8px',
          'min-width': '200px',
          'max-width': '90%',
          'text-align': 'center',
          position: 'absolute',
          left: '50%',
          top: '85%',
          transform: 'translate(-50%, -50%)',
        },
        word: {
          color: '#ffffff',
          'font-size': '14px',
          'font-family': '"Poppins", sans-serif',
          'line-height': '1.4',
          margin: '0 3px',
          opacity: '0.8',
        },
        'word-being-narrated': {
          color: '#00ff88',
          'font-weight': 'bold',
          opacity: '1',
        },
      },
    },
  },
  {
    public_id: '20251120143C0D3E0D48A4C633507',
    video_url: 'https://s3.ap-south-1.amazonaws.com/eznity.rivio/sample/reel3.mp4',
    poster_url: 'https://s3.ap-south-1.amazonaws.com/eznity.rivio/sample/reel3_poster.jpg',
    title: 'The Final Punchline - What a Thing!',
    duration: 28.2,
    transcript: "And she picked out one stationery item after the other. And when she got to the ruler, I was like, yeah, that's the one. And then she looked at her friend and she went, she was asking for a scale, what a thing.",
    streamer_name: null,
    viral_score: 9,
    viral_reason: "Perfect comedic timing with the reveal. The 'what a thing' punchline is highly quotable and shareable.",
    instagram_posted: false,
    tiktok_posted: true,
    youtube_posted: true,
    segments: [],
    styling: {
      font_id: 'font-3',
      config: {
        'subtitle-container': {
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))',
          padding: '12px 20px',
          'border-radius': '0px',
          'min-width': '100%',
          'max-width': '100%',
          'text-align': 'center',
          position: 'absolute',
          left: '0',
          top: '75%',
          transform: 'none',
        },
        word: {
          color: '#ffffff',
          'font-size': '16px',
          'font-family': '"Inter", sans-serif',
          'line-height': '1.5',
          margin: '0 4px',
          opacity: '0.7',
        },
        'word-being-narrated': {
          color: '#ff6b6b',
          'font-weight': '600',
          opacity: '1',
        },
      },
    },
  },
];

// Default export for easy importing
export default API_CONFIG;
