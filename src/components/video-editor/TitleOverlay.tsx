import React, { useMemo } from 'react';
import { TitleConfig, CSSProperties, TitlePosition } from '@/types/subtitle';

interface TitleOverlayProps {
  text: string;
  config?: Partial<TitleConfig>;
  videoWidth?: number;
  videoHeight?: number;
  onClick?: () => void;
  // Drag support props
  selected?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
  position?: TitlePosition; // Override position for dragging
  visible?: boolean; // Control visibility
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  text,
  config: customConfig,
  videoWidth = 1920,
  videoHeight = 1080,
  onClick,
  selected = false,
  isDragging = false,
  onDragStart,
  position: overridePosition,
  visible = true,
}) => {
  // Use only API-provided config, no defaults
  const config: TitleConfig = useMemo(() => {
    if (!customConfig) {
      return {} as TitleConfig;
    }
    
    // Use config as-is from API
    return customConfig as TitleConfig;
  }, [customConfig]);

  // Generate position CSS - supports both legacy string positions and new percentage-based
  const positionCss = useMemo(() => {
    // Use override position if provided (for dragging), otherwise use config position
    const pos = overridePosition || config.position;
    
    // If no position provided, don't render (API should provide position)
    if (!pos) {
      return {};
    }
    
    // Handle legacy string positions
    if (typeof pos === 'string') {
      if (pos === 'top') {
        return {
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      } else if (pos === 'center') {
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      } else {
        // Bottom position
        return {
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
        };
      }
    }
    
    // Check if centered mode (default) or left-edge mode (after user drags)
    const isCentered = pos.centered !== false; // Default to true if undefined
    
    if (isCentered) {
      return {
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        transform: 'translateX(-50%)',
      };
    } else {
      return {
        top: `${pos.y}%`,
        left: `${pos.x}%`,
        transform: 'none',
      };
    }
  }, [config.position, overridePosition]);

  // Generate CSS from config
  const generateCssFromConfig = useMemo(() => {
    let css = '';
    
    // Position-related properties that should be handled by inline styles, not CSS
    const positionProps = ['left', 'top', 'right', 'bottom', 'transform', 'position'];
    
    // Iterate over config keys (excluding 'position')
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'position' || !value || typeof value !== 'object') return;
      
      const styles = value as CSSProperties;
      // Filter out position-related properties - these are handled by inline styles
      const filteredStyles = Object.entries(styles).filter(([prop]) => !positionProps.includes(prop));
      const declarations = filteredStyles
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ');
      
      if (declarations) {
        css += `.title-overlay-root .${key} { ${declarations}; }\n`;
      }
    });
    
    return css;
  }, [config]);

  // Don't render if not visible or no text
  console.log('[TitleOverlay] Render check:', {
    visible,
    text,
    configKeys: Object.keys(config),
    position: overridePosition || config.position
  });
  
  if (!visible || !text) {
    console.log('[TitleOverlay] Not rendering - visible:', visible, 'text:', text);
    return null;
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className="title-overlay-root"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 15, // Above video, below subtitle (which is 20)
      }}
    >
      <style>
        {`
          .title-overlay-root {
            margin: 0;
            padding: 0;
            background: transparent !important;
            overflow: hidden;
          }
          .title-overlay-root .title-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent !important;
            position: relative;
          }
          .title-overlay-root .title-container {
            position: absolute;
            display: block;
            box-sizing: border-box;
            cursor: ${onDragStart ? 'move' : onClick ? 'pointer' : 'default'};
            pointer-events: ${onClick || onDragStart ? 'auto' : 'none'};
            user-select: none;
          }
          .title-overlay-root .title-container:hover {
            ${onClick || onDragStart ? 'outline: 2px solid rgba(59, 130, 246, 0.5); outline-offset: 4px;' : ''}
          }
          .title-overlay-root .title-container.selected {
            outline: 2px solid #3b82f6;
            outline-offset: 4px;
          }
          .title-overlay-root .title-container.dragging {
            opacity: 0.8;
            cursor: grabbing;
          }
          .title-overlay-root .title-text {
            display: inline-block;
            white-space: nowrap;
          }
          @media (max-width: 10000px) {
            .title-overlay-root .title-text {
              white-space: normal;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
          }
          ${generateCssFromConfig}
        `}
      </style>
      <div className="title-wrapper">
        <div
          className={`title-container ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
          style={positionCss}
          onClick={handleContainerClick}
          onMouseDown={handleMouseDown}
        >
          <span className="title-text">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default TitleOverlay;

