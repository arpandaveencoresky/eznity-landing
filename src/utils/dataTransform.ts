// Data transformation utilities for converting between API data and component state

import { Template, TextBlock, TextStyles, ProjectData } from '../types';

// Convert API template to component state format
export const templateToComponentState = (template: Template) => {
  const headlineBlock = template.textBlocks.find(block => block.type === 'headline');
  const subtitleBlock = template.textBlocks.find(block => block.type === 'subtitle');

  return {
    // Template metadata
    templateId: template.id,
    templateName: template.name,
    aspectRatio: template.aspectRatio,
    
    // Headline data
    headlineText: headlineBlock?.text || '',
    headlinePosition: headlineBlock?.position || template.layout.headlinePosition,
    headlineSize: headlineBlock?.size || template.layout.headlineSize,
    headlineStyles: headlineBlock?.styles || getDefaultTextStyles(),
    
    // Subtitle data
    subtitleText: subtitleBlock?.text || '',
    subtitlePosition: subtitleBlock?.position || template.layout.subtitlePosition,
    subtitleSize: subtitleBlock?.size || template.layout.subtitleSize,
    subtitleStyles: subtitleBlock?.styles || getDefaultTextStyles(),
  };
};

// Convert component state to API template format
export const componentStateToTemplate = (
  templateName: string,
  aspectRatio: string,
  headlineText: string,
  subtitleText: string,
  headlinePosition: { x: number; y: number },
  subtitlePosition: { x: number; y: number },
  headlineSize: { width: number; height: number },
  subtitleSize: { width: number; height: number },
  headlineStyles: TextStyles,
  subtitleStyles: TextStyles
): Omit<Template, 'id' | 'createdAt' | 'updatedAt'> => {
  const textBlocks: TextBlock[] = [
    {
      id: 'headline',
      type: 'headline',
      text: headlineText,
      position: headlinePosition,
      size: headlineSize,
      styles: headlineStyles,
    },
    {
      id: 'subtitle',
      type: 'subtitle',
      text: subtitleText,
      position: subtitlePosition,
      size: subtitleSize,
      styles: subtitleStyles,
    },
  ];

  return {
    name: templateName,
    aspectRatio,
    thumbnail: generateTemplateThumbnail(headlineStyles, subtitleStyles, aspectRatio),
    textBlocks,
    layout: {
      headlinePosition,
      subtitlePosition,
      headlineSize,
      subtitleSize,
    },
  };
};

// Generate template thumbnail
export const generateTemplateThumbnail = (
  headlineStyles: TextStyles,
  subtitleStyles: TextStyles,
  aspectRatio: string,
  headlineText: string = "HEADLINE",
  subtitleText: string = "SUBTITLE",
  headlinePosition: { x: number; y: number } = { x: 50, y: 20 },
  subtitlePosition: { x: number; y: number } = { x: 50, y: 80 },
  headlineSize: { width: number; height: number } = { width: 200, height: 40 },
  subtitleSize: { width: number; height: number } = { width: 200, height: 30 }
): string => {
  const [width, height] = aspectRatio.split(':').map(Number);
  const scale = 120; // Base width for thumbnail
  const scaledHeight = (height / width) * scale;
  const scaleFactor = 0.6; // Scale down for thumbnail

  // Calculate positions and sizes for thumbnail
  const headlineX = headlinePosition.x * scale / 100;
  const headlineY = headlinePosition.y * scaledHeight / 100;
  const headlineW = headlineSize.width * scaleFactor;
  const headlineH = headlineSize.height * scaleFactor;
  
  const subtitleX = subtitlePosition.x * scale / 100;
  const subtitleY = subtitlePosition.y * scaledHeight / 100;
  const subtitleW = subtitleSize.width * scaleFactor;
  const subtitleH = subtitleSize.height * scaleFactor;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${scale}" height="${scaledHeight}" viewBox="0 0 ${scale} ${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${scale}" height="${scaledHeight}" fill="#f8fafc"/>
      <rect x="${headlineX - headlineW/2}" y="${headlineY - headlineH/2}" width="${headlineW}" height="${headlineH}" fill="${headlineStyles.backgroundColor}" opacity="${(headlineStyles.backgroundOpacity || 100) / 100}" rx="${headlineStyles.borderRadius}"/>
      <text x="${headlineX}" y="${headlineY + 3}" text-anchor="middle" font-family="${headlineStyles.fontFamily}" font-size="7" font-weight="${headlineStyles.fontWeight}" fill="${headlineStyles.textColor}">${headlineText}</text>
      <rect x="${subtitleX - subtitleW/2}" y="${subtitleY - subtitleH/2}" width="${subtitleW}" height="${subtitleH}" fill="${subtitleStyles.backgroundColor}" opacity="${(subtitleStyles.backgroundOpacity || 100) / 100}" rx="${subtitleStyles.borderRadius}"/>
      <text x="${subtitleX}" y="${subtitleY + 3}" text-anchor="middle" font-family="${subtitleStyles.fontFamily}" font-size="7" font-weight="${subtitleStyles.fontWeight}" fill="${subtitleStyles.textColor}">${subtitleText}</text>
    </svg>
  `)}`;
};

// Get default text styles
export const getDefaultTextStyles = (): TextStyles => ({
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
});

// Convert project data to editor state
export const projectToEditorState = (project: ProjectData) => {
  const headlineBlock = project.textBlocks.find(block => block.type === 'headline');
  const subtitleBlock = project.textBlocks.find(block => block.type === 'subtitle');

  return {
    // Video data
    videoUrl: project.video.url,
    videoTitle: project.video.title,
    videoDuration: project.video.duration,
    aspectRatio: project.video.aspectRatio,
    
    // Text blocks
    headlineText: headlineBlock?.text || '',
    subtitleText: subtitleBlock?.text || '',
    headlinePosition: headlineBlock?.position || { x: 50, y: 20 },
    subtitlePosition: subtitleBlock?.position || { x: 50, y: 80 },
    headlineSize: headlineBlock?.size || { width: 200, height: 40 },
    subtitleSize: subtitleBlock?.size || { width: 200, height: 40 },
    headlineStyles: headlineBlock?.styles || getDefaultTextStyles(),
    subtitleStyles: subtitleBlock?.styles || getDefaultTextStyles(),
    
    // Other data
    subtitles: project.subtitles,
    transcript: project.transcript,
    selectedTemplate: project.selectedTemplate,
  };
};

// Convert editor state to project update
export const editorStateToProjectUpdate = (
  currentProject: ProjectData,
  editorState: any
): Partial<ProjectData> => {
  const headlineBlock: TextBlock = {
    id: 'headline',
    type: 'headline',
    text: editorState.headlineText,
    position: editorState.headlinePosition,
    size: editorState.headlineSize,
    styles: editorState.headlineStyles,
  };

  const subtitleBlock: TextBlock = {
    id: 'subtitle',
    type: 'subtitle',
    text: editorState.subtitleText,
    position: editorState.subtitlePosition,
    size: editorState.subtitleSize,
    styles: editorState.subtitleStyles,
  };

  return {
    ...currentProject,
    textBlocks: [headlineBlock, subtitleBlock],
    subtitles: editorState.subtitles || currentProject.subtitles,
    transcript: editorState.transcript || currentProject.transcript,
    selectedTemplate: editorState.selectedTemplate || currentProject.selectedTemplate,
    updatedAt: new Date(),
  };
};

// Validate template data
export const validateTemplate = (template: Partial<Template>): string[] => {
  const errors: string[] = [];

  if (!template.name?.trim()) {
    errors.push('Template name is required');
  }

  if (!template.aspectRatio) {
    errors.push('Aspect ratio is required');
  }

  if (!template.textBlocks || template.textBlocks.length === 0) {
    errors.push('At least one text block is required');
  }

  return errors;
};

// Validate project data
export const validateProject = (project: Partial<ProjectData>): string[] => {
  const errors: string[] = [];

  if (!project.name?.trim()) {
    errors.push('Project name is required');
  }

  if (!project.video) {
    errors.push('Video is required');
  }

  return errors;
};
