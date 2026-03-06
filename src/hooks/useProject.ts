// Custom hook for managing project data and API interactions

import { useState, useEffect, useCallback } from 'react';
import { ProjectData, Template, VideoData, SubtitleData, TranscriptSegment } from '../types';
import { apiService } from '../services/api';

interface UseProjectReturn {
  // Project data
  project: ProjectData | null;
  templates: Template[];
  currentVideo: VideoData | null;
  subtitles: SubtitleData[];
  transcript: TranscriptSegment[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  createNewProject: (name: string, video: VideoData) => Promise<void>;
  updateTextBlock: (textBlock: any) => void;
  updateTemplate: (templateId: string) => void;
  loadTemplates: () => Promise<void>;
  loadSubtitles: (videoId: string) => Promise<void>;
  loadTranscript: (videoId: string) => Promise<void>;
  generateSubtitles: (videoId: string) => Promise<void>;
  generateTranscript: (videoId: string) => Promise<void>;
}

export const useProject = (projectId?: string): UseProjectReturn => {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleData[]>([]);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load project data
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getProject(id);
      if (response.success) {
        setProject(response.data);
        setCurrentVideo(response.data.video);
        setSubtitles(response.data.subtitles);
        setTranscript(response.data.transcript);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save project data
  const saveProject = useCallback(async () => {
    if (!project) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await apiService.updateProject(project.id, project);
      if (response.success) {
        setProject(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  }, [project]);

  // Create new project
  const createNewProject = useCallback(async (name: string, video: VideoData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newProject: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        video,
        textBlocks: [],
        subtitles: [],
        transcript: [],
      };
      
      const response = await apiService.createProject(newProject);
      if (response.success) {
        setProject(response.data);
        setCurrentVideo(response.data.video);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update text block
  const updateTextBlock = useCallback((textBlock: any) => {
    if (!project) return;
    
    setProject(prev => {
      if (!prev) return null;
      
      const updatedTextBlocks = prev.textBlocks.map(block => 
        block.id === textBlock.id ? textBlock : block
      );
      
      return {
        ...prev,
        textBlocks: updatedTextBlocks,
        updatedAt: new Date(),
      };
    });
  }, [project]);

  // Update selected template
  const updateTemplate = useCallback((templateId: string) => {
    if (!project) return;
    
    setProject(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        selectedTemplate: templateId,
        updatedAt: new Date(),
      };
    });
  }, [project]);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const response = await apiService.getTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    }
  }, []);

  // Load subtitles
  const loadSubtitles = useCallback(async (videoId: string) => {
    try {
      const response = await apiService.getSubtitles(videoId);
      if (response.success) {
        setSubtitles(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subtitles');
    }
  }, []);

  // Load transcript
  const loadTranscript = useCallback(async (videoId: string) => {
    try {
      const response = await apiService.getTranscript(videoId);
      if (response.success) {
        setTranscript(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transcript');
    }
  }, []);

  // Generate subtitles
  const generateSubtitles = useCallback(async (videoId: string) => {
    try {
      const response = await apiService.generateSubtitles(videoId);
      if (response.success) {
        setSubtitles(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate subtitles');
    }
  }, []);

  // Generate transcript
  const generateTranscript = useCallback(async (videoId: string) => {
    try {
      const response = await apiService.generateTranscript(videoId);
      if (response.success) {
        setTranscript(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate transcript');
    }
  }, []);

  // Load initial data
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
    loadTemplates();
  }, [projectId, loadProject, loadTemplates]);

  return {
    project,
    templates,
    currentVideo,
    subtitles,
    transcript,
    isLoading,
    isSaving,
    error,
    loadProject,
    saveProject,
    createNewProject,
    updateTextBlock,
    updateTemplate,
    loadTemplates,
    loadSubtitles,
    loadTranscript,
    generateSubtitles,
    generateTranscript,
  };
};
