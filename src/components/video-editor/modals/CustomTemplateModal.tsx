/**
 * CustomTemplateModal Component
 * 
 * Modal for creating and editing custom templates with drag-and-drop text blocks.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextEditorPanel } from '../TextEditorPanel';
import DemoVideoLayout from '../DemoVideoLayout';
import {
  DEFAULT_HEADLINE_STYLES,
  DEFAULT_SUBTITLE_STYLES,
  DEFAULT_HEADLINE_POSITION,
  DEFAULT_SUBTITLE_POSITION,
  DEFAULT_HEADLINE_SIZE,
  DEFAULT_SUBTITLE_SIZE,
  TextStyles,
  Position,
  Size,
  cloneTextStyles,
} from '@/constants/editorDefaults';

interface SavedTemplate {
  id: string;
  name: string;
  aspectRatio: string;
  headlineText: string;
  subtitleText: string;
  headlinePosition: Position;
  subtitlePosition: Position;
  headlineSize: Size;
  subtitleSize: Size;
  headlineStyles: TextStyles;
  subtitleStyles: TextStyles;
  styleId?: string;
  thumbnail: string;
}

interface CustomTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: SavedTemplate) => void;
  editingTemplate?: SavedTemplate | null;
  selectedSubtitleStyleId: string;
}

export const CustomTemplateModal: React.FC<CustomTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTemplate,
  selectedSubtitleStyleId,
}) => {
  const { t } = useTranslation();
  const isEditing = !!editingTemplate;

  // Form state
  const [customTemplateName, setCustomTemplateName] = useState(editingTemplate?.name || '');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(editingTemplate?.aspectRatio || '9:16');
  
  // Demo text and positions
  const [demoHeadlineText] = useState(editingTemplate?.headlineText || t('editor.title'));
  const [demoSubtitleText] = useState(editingTemplate?.subtitleText || t('editor.subtitle'));
  const [demoHeadlinePosition, setDemoHeadlinePosition] = useState<Position>(
    editingTemplate?.headlinePosition || { ...DEFAULT_HEADLINE_POSITION }
  );
  const [demoSubtitlePosition, setDemoSubtitlePosition] = useState<Position>(
    editingTemplate?.subtitlePosition || { ...DEFAULT_SUBTITLE_POSITION }
  );
  const [demoHeadlineSize, setDemoHeadlineSize] = useState<Size>(
    editingTemplate?.headlineSize || { ...DEFAULT_HEADLINE_SIZE }
  );
  const [demoSubtitleSize, setDemoSubtitleSize] = useState<Size>(
    editingTemplate?.subtitleSize || { ...DEFAULT_SUBTITLE_SIZE }
  );
  const [demoHeadlineStyles, setDemoHeadlineStyles] = useState<TextStyles>(
    editingTemplate?.headlineStyles || cloneTextStyles(DEFAULT_HEADLINE_STYLES)
  );
  const [demoSubtitleStyles, setDemoSubtitleStyles] = useState<TextStyles>(
    editingTemplate?.subtitleStyles || cloneTextStyles(DEFAULT_SUBTITLE_STYLES)
  );
  
  // Selection state
  const [selectedDemoTextBlock, setSelectedDemoTextBlock] = useState<'headline' | 'subtitle' | null>(null);

  if (!isOpen) return null;

  const getCurrentDemoStyles = () => {
    return selectedDemoTextBlock === 'headline' ? demoHeadlineStyles : demoSubtitleStyles;
  };

  const updateCurrentDemoStyles = (updates: Partial<TextStyles>) => {
    if (selectedDemoTextBlock === 'headline') {
      setDemoHeadlineStyles(prev => ({ ...prev, ...updates }));
    } else if (selectedDemoTextBlock === 'subtitle') {
      setDemoSubtitleStyles(prev => ({ ...prev, ...updates }));
    }
  };

  const generateTemplateThumbnail = () => {
    const headlineX = demoHeadlinePosition.x * 120 / 100;
    const headlineY = demoHeadlinePosition.y * 213 / 100;
    const headlineW = Math.min(demoHeadlineSize.width * 0.6, 100);
    const headlineH = Math.min(demoHeadlineSize.height * 0.6, 20);

    const subtitleX = demoSubtitlePosition.x * 120 / 100;
    const subtitleY = demoSubtitlePosition.y * 213 / 100;
    const subtitleW = Math.min(demoSubtitleSize.width * 0.6, 100);
    const subtitleH = Math.min(demoSubtitleSize.height * 0.6, 20);

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="120" height="213" viewBox="0 0 120 213" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="213" fill="#f8fafc"/>
        <rect x="${headlineX - headlineW / 2}" y="${headlineY - headlineH / 2}" width="${headlineW}" height="${headlineH}" fill="${demoHeadlineStyles.backgroundColor}" opacity="${(demoHeadlineStyles.backgroundOpacity || 100) / 100}" rx="${demoHeadlineStyles.borderRadius || 0}"/>
        <text x="${headlineX}" y="${headlineY + 3}" text-anchor="middle" font-family="${demoHeadlineStyles.fontFamily}" font-size="8" font-weight="${demoHeadlineStyles.fontWeight}" fill="${demoHeadlineStyles.textColor}">${demoHeadlineText}</text>
        <rect x="${subtitleX - subtitleW / 2}" y="${subtitleY - subtitleH / 2}" width="${subtitleW}" height="${subtitleH}" fill="${demoSubtitleStyles.backgroundColor}" opacity="${(demoSubtitleStyles.backgroundOpacity || 100) / 100}" rx="${demoSubtitleStyles.borderRadius || 0}"/>
        <text x="${subtitleX}" y="${subtitleY + 3}" text-anchor="middle" font-family="${demoSubtitleStyles.fontFamily}" font-size="8" font-weight="${demoSubtitleStyles.fontWeight}" fill="${demoSubtitleStyles.textColor}">${demoSubtitleText}</text>
      </svg>
    `)}`;
  };

  const handleSave = () => {
    if (!customTemplateName.trim()) return;

    const template: SavedTemplate = {
      id: editingTemplate?.id || `custom-${Date.now()}`,
      name: customTemplateName,
      aspectRatio: selectedAspectRatio,
      headlineText: demoHeadlineText,
      subtitleText: demoSubtitleText,
      headlinePosition: demoHeadlinePosition,
      subtitlePosition: demoSubtitlePosition,
      headlineSize: demoHeadlineSize,
      subtitleSize: demoSubtitleSize,
      headlineStyles: demoHeadlineStyles,
      subtitleStyles: demoSubtitleStyles,
      styleId: selectedSubtitleStyleId,
      thumbnail: generateTemplateThumbnail(),
    };

    onSave(template);
    onClose();
  };

  const aspectRatioOptions = [
    { ratio: '9:16', label: t('editor.aspectRatios.portrait') },
    { ratio: '1:1', label: t('editor.aspectRatios.square') },
    { ratio: '4:5', label: t('editor.aspectRatios.instagram') },
    { ratio: '16:9', label: t('editor.aspectRatios.landscape') },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg w-[70vw] h-[70vh] flex overflow-hidden">
        {/* Left Panel - Styling Options */}
        <div className="w-1/2 border-r flex flex-col h-full overflow-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">
              {isEditing ? t('editor.editCustomTemplate') : t('editor.createCustomTemplate')}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Template Name */}
          <div className="p-6 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editor.templateName')}</label>
            <input
              type="text"
              value={customTemplateName}
              onChange={(e) => setCustomTemplateName(e.target.value)}
              placeholder={t('editor.enterTemplateNamePlaceholder')}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Aspect Ratio Selector */}
          <div className="p-6 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('editor.aspectRatio')}</label>
            <div className="space-y-2">
              {aspectRatioOptions.map((option) => (
                <label key={option.ratio} className="flex items-center">
                  <input
                    type="radio"
                    name="aspectRatio"
                    value={option.ratio}
                    checked={selectedAspectRatio === option.ratio}
                    onChange={(e) => setSelectedAspectRatio(e.target.value)}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Text Block Selection */}
          <div className="p-6 border-b">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('editor.selectTextBlock')}</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDemoTextBlock('headline')}
                className={`px-4 py-2 text-sm rounded border ${
                  selectedDemoTextBlock === 'headline'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {t('editor.title')}
              </button>
              <button
                onClick={() => setSelectedDemoTextBlock('subtitle')}
                className={`px-4 py-2 text-sm rounded border ${
                  selectedDemoTextBlock === 'subtitle'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {t('editor.subtitle')}
              </button>
            </div>
          </div>

          {/* Text Editor Panel */}
          {selectedDemoTextBlock && (
            <div className="flex-1">
              <TextEditorPanel
                selectedTextBlock={selectedDemoTextBlock}
                currentStyles={getCurrentDemoStyles()}
                onUpdateStyles={updateCurrentDemoStyles}
                title={selectedDemoTextBlock === 'headline' ? t('editor.editTitle') : t('editor.editSubtitle')}
                showTextBlockSelection={false}
              />
            </div>
          )}

          {/* Save Button */}
          {selectedDemoTextBlock && (
            <div className="p-6 border-t">
              <button
                onClick={handleSave}
                disabled={!customTemplateName.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('editor.saveTemplate')}
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Demo Layout */}
        <div className="w-1/2 p-6 flex flex-col h-full min-h-0 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">{t('editor.preview')}</h3>
          <div className="flex-1 flex items-center justify-center overflow-auto min-h-0">
            <DemoVideoLayout
              aspectRatio={selectedAspectRatio}
              headlineText={demoHeadlineText}
              subtitleText={demoSubtitleText}
              headlinePosition={demoHeadlinePosition}
              subtitlePosition={demoSubtitlePosition}
              headlineSize={demoHeadlineSize}
              subtitleSize={demoSubtitleSize}
              headlineStyles={demoHeadlineStyles}
              subtitleStyles={demoSubtitleStyles}
              selectedTextBlock={selectedDemoTextBlock}
              onHeadlineDrag={setDemoHeadlinePosition}
              onSubtitleDrag={setDemoSubtitlePosition}
              onHeadlineResize={setDemoHeadlineSize}
              onSubtitleResize={setDemoSubtitleSize}
              onHeadlineClick={() => setSelectedDemoTextBlock('headline')}
              onSubtitleClick={() => setSelectedDemoTextBlock('subtitle')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
