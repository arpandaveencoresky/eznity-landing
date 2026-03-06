// Template card component with proper thumbnail preview and edit functionality

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Plus } from 'lucide-react';
import TemplatePreview from './TemplatePreview';

interface TemplateCardProps {
  id: string;
  name: string;
  thumbnail?: string;
  isCustom?: boolean;
  onClick: () => void;
  onEdit?: () => void;
  headlineText?: string;
  subtitleText?: string;
  headlineStyles?: any;
  subtitleStyles?: any;
  headlinePosition?: { x: number; y: number };
  subtitlePosition?: { x: number; y: number };
  headlineSize?: { width: number; height: number };
  subtitleSize?: { width: number; height: number };
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  name,
  thumbnail,
  isCustom = false,
  onClick,
  onEdit,
  headlineText = "HERE IS A LINE OF HEADLINE",
  subtitleText = "wizards jump",
  headlineStyles,
  subtitleStyles,
  headlinePosition = { x: 50, y: 20 },
  subtitlePosition = { x: 50, y: 80 },
  headlineSize = { width: 200, height: 40 },
  subtitleSize = { width: 200, height: 30 },
}) => {
  const { t } = useTranslation();
  // Generate thumbnail with actual content
  const generateThumbnail = () => {
    // Always generate fresh thumbnail with actual content
    // if (thumbnail) return thumbnail;
    
    const [width, height] = [120, 213]; // 9:16 aspect ratio
    const scale = 0.8; // Scale down for thumbnail
    
    // Calculate positions and sizes for thumbnail
    const headlineX = headlinePosition.x * width / 100;
    const headlineY = headlinePosition.y * height / 100;
    const headlineW = Math.min(headlineSize.width * scale, width * 0.8);
    const headlineH = Math.min(headlineSize.height * scale, height * 0.15);
    
    const subtitleX = subtitlePosition.x * width / 100;
    const subtitleY = subtitlePosition.y * height / 100;
    const subtitleW = Math.min(subtitleSize.width * scale, width * 0.8);
    const subtitleH = Math.min(subtitleSize.height * scale, height * 0.12);
    
    // Truncate text if too long
    const truncatedHeadline = (headlineText || 'HEADLINE').length > 20 
      ? (headlineText || 'HEADLINE').substring(0, 17) + '...' 
      : (headlineText || 'HEADLINE');
    const truncatedSubtitle = (subtitleText || 'SUBTITLE').length > 15 
      ? (subtitleText || 'SUBTITLE').substring(0, 12) + '...' 
      : (subtitleText || 'SUBTITLE');
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background with subtle gradient -->
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)" rx="8"/>
        
        <!-- Headline -->
        <rect x="${headlineX - headlineW/2}" y="${headlineY - headlineH/2}" width="${headlineW}" height="${headlineH}" fill="${headlineStyles?.backgroundColor || '#000000'}" opacity="${(headlineStyles?.backgroundOpacity || 100) / 100}" rx="${headlineStyles?.borderRadius || 4}"/>
        <text x="${headlineX}" y="${headlineY + 4}" text-anchor="middle" font-family="${headlineStyles?.fontFamily || 'Arial'}" font-size="8" font-weight="${headlineStyles?.fontWeight || 'bold'}" fill="${headlineStyles?.textColor || '#ffffff'}">${truncatedHeadline}</text>
        
        <!-- Subtitle -->
        <rect x="${subtitleX - subtitleW/2}" y="${subtitleY - subtitleH/2}" width="${subtitleW}" height="${subtitleH}" fill="${subtitleStyles?.backgroundColor || '#000000'}" opacity="${(subtitleStyles?.backgroundOpacity || 100) / 100}" rx="${subtitleStyles?.borderRadius || 4}"/>
        <text x="${subtitleX}" y="${subtitleY + 3}" text-anchor="middle" font-family="${subtitleStyles?.fontFamily || 'Arial'}" font-size="7" font-weight="${subtitleStyles?.fontWeight || 'normal'}" fill="${subtitleStyles?.textColor || '#ffffff'}">${truncatedSubtitle}</text>
      </svg>
    `)}`;
  };

  const thumbnailUrl = generateThumbnail();

  if (isCustom) {
    return (
      <div className="template-card">
        <div 
          className="template-card-preview template-card-custom"
          onClick={onClick}
        >
          <div className="template-card-icon">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="template-card-label">{t('editor.customTemplate')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="template-card">
      <div 
        className="template-card-preview template-card-saved"
        onClick={onClick}
      >
        {/* Template Preview */}
        <TemplatePreview
          headlineText={headlineText || 'HEADLINE'}
          subtitleText={subtitleText || 'SUBTITLE'}
          headlinePosition={headlinePosition}
          subtitlePosition={subtitlePosition}
          headlineSize={headlineSize}
          subtitleSize={subtitleSize}
          headlineStyles={headlineStyles}
          subtitleStyles={subtitleStyles}
          size="small"
          showBackground={false}
          className="template-card-thumbnail"
        />
        
        {/* Edit button */}
        {onEdit && (
          <button
            className="template-card-edit-button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title={t('templateCard.editTemplate')}
          >
            <Edit className="template-card-edit-icon" />
          </button>
        )}
      </div>
      <p className="template-card-name">{name}</p>
    </div>
  );
};

export default TemplateCard;
