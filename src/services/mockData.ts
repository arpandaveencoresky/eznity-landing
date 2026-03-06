// Mock data service for development and testing

import { Template, ProjectData, VideoData, SubtitleData, TranscriptSegment } from '../types';

// Mock templates
export const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'My Template 1',
    description: 'Template with headline at top and subtitle at bottom',
    aspectRatio: '9:16',
    thumbnail: 'data:image/svg+xml,<svg>...</svg>',
    textBlocks: [
      {
        id: 'headline',
        type: 'headline',
        text: 'HERE IS A LINE OF HEADLINE',
        position: { x: 50, y: 20 },
        size: { width: 200, height: 40 },
        styles: {
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
      },
      {
        id: 'subtitle',
        type: 'subtitle',
        text: 'wizards jump',
        position: { x: 50, y: 80 },
        size: { width: 200, height: 30 },
        styles: {
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
      },
    ],
    layout: {
      headlinePosition: { x: 50, y: 20 },
      subtitlePosition: { x: 50, y: 80 },
      headlineSize: { width: 200, height: 40 },
      subtitleSize: { width: 200, height: 30 },
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isDefault: true,
  },
  {
    id: 'template-2',
    name: 'My Template 2',
    description: 'Template with different positioning',
    aspectRatio: '9:16',
    thumbnail: 'data:image/svg+xml,<svg>...</svg>',
    textBlocks: [
      {
        id: 'headline',
        type: 'headline',
        text: 'HERE IS A LINE OF HEADLINE',
        position: { x: 50, y: 20 },
        size: { width: 200, height: 40 },
        styles: {
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
      },
      {
        id: 'subtitle',
        type: 'subtitle',
        text: 'The five boxing',
        position: { x: 50, y: 80 },
        size: { width: 200, height: 30 },
        styles: {
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
      },
    ],
    layout: {
      headlinePosition: { x: 50, y: 20 },
      subtitlePosition: { x: 50, y: 80 },
      headlineSize: { width: 200, height: 40 },
      subtitleSize: { width: 200, height: 30 },
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    isDefault: true,
  },
];

// Mock video data
export const mockVideo: VideoData = {
  id: 'video-1',
  url: '/sample-video.mp4',
  title: 'Sample Video',
  duration: 120,
  thumbnail: '/sample-thumbnail.jpg',
  aspectRatio: '9:16',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock subtitles
export const mockSubtitles: SubtitleData[] = [
  {
    id: 'sub-1',
    text: 'Welcome to our video',
    startTime: 0,
    endTime: 3,
    style: 'default',
    highlight: false,
  },
  {
    id: 'sub-2',
    text: 'This is the main content',
    startTime: 3,
    endTime: 8,
    style: 'default',
    highlight: true,
  },
  {
    id: 'sub-3',
    text: 'Thank you for watching',
    startTime: 8,
    endTime: 12,
    style: 'default',
    highlight: false,
  },
];

// Mock transcript
export const mockTranscript: TranscriptSegment[] = [
  {
    id: 'seg-1',
    text: 'Welcome to our video tutorial. Today we will learn about video editing.',
    startTime: 0,
    endTime: 5,
    speaker: 'Host',
    confidence: 0.95,
  },
  {
    id: 'seg-2',
    text: 'This is the main content section where we explain the key concepts.',
    startTime: 5,
    endTime: 15,
    speaker: 'Host',
    confidence: 0.92,
  },
  {
    id: 'seg-3',
    text: 'Thank you for watching. Don\'t forget to subscribe for more content.',
    startTime: 15,
    endTime: 20,
    speaker: 'Host',
    confidence: 0.88,
  },
];

// Mock project data
export const mockProject: ProjectData = {
  id: 'project-1',
  name: 'Sample Project',
  video: mockVideo,
  textBlocks: mockTemplates[0].textBlocks,
  subtitles: mockSubtitles,
  transcript: mockTranscript,
  selectedTemplate: 'template-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock API responses
export const createMockApiResponse = <T>(data: T, success: boolean = true, message?: string) => ({
  success,
  data,
  message,
  error: success ? undefined : message,
});

// Mock API service for development
export class MockApiService {
  private templates: Template[] = [...mockTemplates];
  private projects: ProjectData[] = [mockProject];

  async getTemplates() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(createMockApiResponse(this.templates));
      }, 500);
    });
  }

  async getTemplate(id: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const template = this.templates.find(t => t.id === id);
        resolve(createMockApiResponse(template || null, !!template));
      }, 300);
    });
  }

  async createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newTemplate: Template = {
          ...template,
          id: `template-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.templates.push(newTemplate);
        resolve(createMockApiResponse(newTemplate));
      }, 800);
    });
  }

  async updateTemplate(id: string, templateData: Partial<Template>) {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
          this.templates[index] = { ...this.templates[index], ...templateData, updatedAt: new Date() };
          resolve(createMockApiResponse(this.templates[index]));
        } else {
          resolve(createMockApiResponse(null, false, 'Template not found'));
        }
      }, 600);
    });
  }

  async deleteTemplate(id: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
          this.templates.splice(index, 1);
          resolve(createMockApiResponse(undefined));
        } else {
          resolve(createMockApiResponse(undefined, false, 'Template not found'));
        }
      }, 400);
    });
  }

  async getProjects() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(createMockApiResponse(this.projects));
      }, 500);
    });
  }

  async getProject(id: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const project = this.projects.find(p => p.id === id);
        resolve(createMockApiResponse(project || null, !!project));
      }, 300);
    });
  }

  async createProject(project: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newProject: ProjectData = {
          ...project,
          id: `project-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.projects.push(newProject);
        resolve(createMockApiResponse(newProject));
      }, 800);
    });
  }

  async updateProject(id: string, projectData: Partial<ProjectData>) {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects[index] = { ...this.projects[index], ...projectData, updatedAt: new Date() };
          resolve(createMockApiResponse(this.projects[index]));
        } else {
          resolve(createMockApiResponse(null, false, 'Project not found'));
        }
      }, 600);
    });
  }

  async deleteProject(id: string) {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          this.projects.splice(index, 1);
          resolve(createMockApiResponse(undefined));
        } else {
          resolve(createMockApiResponse(undefined, false, 'Project not found'));
        }
      }, 400);
    });
  }
}

export const mockApiService = new MockApiService();
