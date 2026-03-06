// Global application context for managing state across components

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProjectData, Template, VideoData, SubtitleData, TranscriptSegment } from '../types';

// Application state interface
interface AppState {
  // Current project
  currentProject: ProjectData | null;
  
  // Video data
  currentVideo: VideoData | null;
  
  // Templates
  templates: Template[];
  selectedTemplate: Template | null;
  
  // Text blocks
  headlineText: string;
  subtitleText: string;
  headlinePosition: { x: number; y: number };
  subtitlePosition: { x: number; y: number };
  headlineSize: { width: number; height: number };
  subtitleSize: { width: number; height: number };
  headlineStyles: any;
  subtitleStyles: any;
  
  // Subtitles and transcript
  subtitles: SubtitleData[];
  transcript: TranscriptSegment[];
  
  // UI state
  activePanel: string;
  selectedTextBlock: 'headline' | 'subtitle' | null;
  showRightSlider: boolean;
  isCustomTemplateModalOpen: boolean;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_PROJECT'; payload: ProjectData | null }
  | { type: 'SET_VIDEO'; payload: VideoData | null }
  | { type: 'SET_TEMPLATES'; payload: Template[] }
  | { type: 'SELECT_TEMPLATE'; payload: Template | null }
  | { type: 'UPDATE_HEADLINE_TEXT'; payload: string }
  | { type: 'UPDATE_SUBTITLE_TEXT'; payload: string }
  | { type: 'UPDATE_HEADLINE_POSITION'; payload: { x: number; y: number } }
  | { type: 'UPDATE_SUBTITLE_POSITION'; payload: { x: number; y: number } }
  | { type: 'UPDATE_HEADLINE_SIZE'; payload: { width: number; height: number } }
  | { type: 'UPDATE_SUBTITLE_SIZE'; payload: { width: number; height: number } }
  | { type: 'UPDATE_HEADLINE_STYLES'; payload: any }
  | { type: 'UPDATE_SUBTITLE_STYLES'; payload: any }
  | { type: 'SET_SUBTITLES'; payload: SubtitleData[] }
  | { type: 'SET_TRANSCRIPT'; payload: TranscriptSegment[] }
  | { type: 'SET_ACTIVE_PANEL'; payload: string }
  | { type: 'SELECT_TEXT_BLOCK'; payload: 'headline' | 'subtitle' | null }
  | { type: 'TOGGLE_RIGHT_SLIDER'; payload: boolean }
  | { type: 'TOGGLE_CUSTOM_TEMPLATE_MODAL'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  currentProject: null,
  currentVideo: null,
  templates: [],
  selectedTemplate: null,
  headlineText: '',
  subtitleText: '',
  headlinePosition: { x: 50, y: 20 },
  subtitlePosition: { x: 50, y: 80 },
  headlineSize: { width: 200, height: 40 },
  subtitleSize: { width: 200, height: 40 },
  headlineStyles: {
    textColor: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 100,
    fontSize: 16,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontStyle: 'normal',
    textDecoration: 'none',
    textShadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
    textStroke: { enabled: false, color: '#000000', width: 1 },
    textAlign: 'center',
    borderRadius: 0,
  },
  subtitleStyles: {
    textColor: '#ffffff',
    backgroundColor: '#000000',
    backgroundOpacity: 100,
    fontSize: 14,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textShadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
    textStroke: { enabled: false, color: '#000000', width: 1 },
    textAlign: 'center',
    borderRadius: 0,
  },
  subtitles: [],
  transcript: [],
  activePanel: 'templates',
  selectedTextBlock: null,
  showRightSlider: false,
  isCustomTemplateModalOpen: false,
  isLoading: false,
  isSaving: false,
  error: null,
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, currentProject: action.payload };
    
    case 'SET_VIDEO':
      return { ...state, currentVideo: action.payload };
    
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    
    case 'SELECT_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    
    case 'UPDATE_HEADLINE_TEXT':
      return { ...state, headlineText: action.payload };
    
    case 'UPDATE_SUBTITLE_TEXT':
      return { ...state, subtitleText: action.payload };
    
    case 'UPDATE_HEADLINE_POSITION':
      return { ...state, headlinePosition: action.payload };
    
    case 'UPDATE_SUBTITLE_POSITION':
      return { ...state, subtitlePosition: action.payload };
    
    case 'UPDATE_HEADLINE_SIZE':
      return { ...state, headlineSize: action.payload };
    
    case 'UPDATE_SUBTITLE_SIZE':
      return { ...state, subtitleSize: action.payload };
    
    case 'UPDATE_HEADLINE_STYLES':
      return { ...state, headlineStyles: { ...state.headlineStyles, ...action.payload } };
    
    case 'UPDATE_SUBTITLE_STYLES':
      return { ...state, subtitleStyles: { ...state.subtitleStyles, ...action.payload } };
    
    case 'SET_SUBTITLES':
      return { ...state, subtitles: action.payload };
    
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload };
    
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload };
    
    case 'SELECT_TEXT_BLOCK':
      return { ...state, selectedTextBlock: action.payload };
    
    case 'TOGGLE_RIGHT_SLIDER':
      return { ...state, showRightSlider: action.payload };
    
    case 'TOGGLE_CUSTOM_TEMPLATE_MODAL':
      return { ...state, isCustomTemplateModalOpen: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setProject: (project: ProjectData | null) => void;
  setVideo: (video: VideoData | null) => void;
  setTemplates: (templates: Template[]) => void;
  selectTemplate: (template: Template | null) => void;
  updateHeadlineText: (text: string) => void;
  updateSubtitleText: (text: string) => void;
  updateHeadlinePosition: (position: { x: number; y: number }) => void;
  updateSubtitlePosition: (position: { x: number; y: number }) => void;
  updateHeadlineSize: (size: { width: number; height: number }) => void;
  updateSubtitleSize: (size: { width: number; height: number }) => void;
  updateHeadlineStyles: (styles: any) => void;
  updateSubtitleStyles: (styles: any) => void;
  setSubtitles: (subtitles: SubtitleData[]) => void;
  setTranscript: (transcript: TranscriptSegment[]) => void;
  setActivePanel: (panel: string) => void;
  selectTextBlock: (block: 'headline' | 'subtitle' | null) => void;
  toggleRightSlider: (show: boolean) => void;
  toggleCustomTemplateModal: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience methods
  const setProject = (project: ProjectData | null) => {
    dispatch({ type: 'SET_PROJECT', payload: project });
  };

  const setVideo = (video: VideoData | null) => {
    dispatch({ type: 'SET_VIDEO', payload: video });
  };

  const setTemplates = (templates: Template[]) => {
    dispatch({ type: 'SET_TEMPLATES', payload: templates });
  };

  const selectTemplate = (template: Template | null) => {
    dispatch({ type: 'SELECT_TEMPLATE', payload: template });
  };

  const updateHeadlineText = (text: string) => {
    dispatch({ type: 'UPDATE_HEADLINE_TEXT', payload: text });
  };

  const updateSubtitleText = (text: string) => {
    dispatch({ type: 'UPDATE_SUBTITLE_TEXT', payload: text });
  };

  const updateHeadlinePosition = (position: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_HEADLINE_POSITION', payload: position });
  };

  const updateSubtitlePosition = (position: { x: number; y: number }) => {
    dispatch({ type: 'UPDATE_SUBTITLE_POSITION', payload: position });
  };

  const updateHeadlineSize = (size: { width: number; height: number }) => {
    dispatch({ type: 'UPDATE_HEADLINE_SIZE', payload: size });
  };

  const updateSubtitleSize = (size: { width: number; height: number }) => {
    dispatch({ type: 'UPDATE_SUBTITLE_SIZE', payload: size });
  };

  const updateHeadlineStyles = (styles: any) => {
    dispatch({ type: 'UPDATE_HEADLINE_STYLES', payload: styles });
  };

  const updateSubtitleStyles = (styles: any) => {
    dispatch({ type: 'UPDATE_SUBTITLE_STYLES', payload: styles });
  };

  const setSubtitles = (subtitles: SubtitleData[]) => {
    dispatch({ type: 'SET_SUBTITLES', payload: subtitles });
  };

  const setTranscript = (transcript: TranscriptSegment[]) => {
    dispatch({ type: 'SET_TRANSCRIPT', payload: transcript });
  };

  const setActivePanel = (panel: string) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', payload: panel });
  };

  const selectTextBlock = (block: 'headline' | 'subtitle' | null) => {
    dispatch({ type: 'SELECT_TEXT_BLOCK', payload: block });
  };

  const toggleRightSlider = (show: boolean) => {
    dispatch({ type: 'TOGGLE_RIGHT_SLIDER', payload: show });
  };

  const toggleCustomTemplateModal = (open: boolean) => {
    dispatch({ type: 'TOGGLE_CUSTOM_TEMPLATE_MODAL', payload: open });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setSaving = (saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setProject,
    setVideo,
    setTemplates,
    selectTemplate,
    updateHeadlineText,
    updateSubtitleText,
    updateHeadlinePosition,
    updateSubtitlePosition,
    updateHeadlineSize,
    updateSubtitleSize,
    updateHeadlineStyles,
    updateSubtitleStyles,
    setSubtitles,
    setTranscript,
    setActivePanel,
    selectTextBlock,
    toggleRightSlider,
    toggleCustomTemplateModal,
    setLoading,
    setSaving,
    setError,
    resetState,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
