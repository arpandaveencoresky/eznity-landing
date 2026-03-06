import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DraggableTextBlock from "./DraggableTextBlock";

interface TemplatePreviewProps {
  // Template data
  headlineText: string;
  subtitleText: string;
  headlinePosition: { x: number; y: number };
  subtitlePosition: { x: number; y: number };
  headlineSize: { width: number; height: number };
  subtitleSize: { width: number; height: number };
  headlineStyles: any;
  subtitleStyles: any;
  
  // Configuration
  aspectRatio?: string;
  size?: 'small' | 'medium' | 'large';
  width?: number;
  height?: number;
  
  // Interaction (optional - for popup use)
  selectedTextBlock?: 'headline' | 'subtitle' | null;
  onHeadlineDrag?: (position: { x: number; y: number }) => void;
  onSubtitleDrag?: (position: { x: number; y: number }) => void;
  onHeadlineResize?: (size: { width: number; height: number }) => void;
  onSubtitleResize?: (size: { width: number; height: number }) => void;
  onHeadlineClick?: () => void;
  onSubtitleClick?: () => void;
  
  // Styling
  className?: string;
  showBackground?: boolean;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  headlineText,
  subtitleText,
  headlinePosition,
  subtitlePosition,
  headlineSize,
  subtitleSize,
  headlineStyles,
  subtitleStyles,
  aspectRatio = "9:16",
  size = 'medium',
  width,
  height,
  selectedTextBlock = null,
  onHeadlineDrag,
  onSubtitleDrag,
  onHeadlineResize,
  onSubtitleResize,
  onHeadlineClick,
  onSubtitleClick,
  className = "",
  showBackground = true
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  // Calculate dimensions based on size or custom dimensions
  const getDimensions = () => {
    if (width && height) {
      return { width, height };
    }
    
    switch (size) {
      case 'small':
        return { width: 120, height: 213 }; // Small thumbnail
      case 'medium':
        return { width: 200, height: 355 }; // Medium preview
      case 'large':
        return { width: 300, height: 533 }; // Large popup preview
      default:
        return { width: 200, height: 355 };
    }
  };

  const dimensions = getDimensions();
  
  // Calculate aspect ratio dimensions
  const getAspectRatioDimensions = (ratio: string) => {
    const [w, h] = ratio.split(':').map(Number);
    const aspectRatio = w / h;
    
    if (dimensions.width / dimensions.height > aspectRatio) {
      return {
        width: dimensions.height * aspectRatio,
        height: dimensions.height
      };
    } else {
      return {
        width: dimensions.width,
        height: dimensions.width / aspectRatio
      };
    }
  };

  const finalDimensions = getAspectRatioDimensions(aspectRatio);

  // Observe container size to stay correct across any container/resolution changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [finalDimensions.width, finalDimensions.height]);

  // Calculate font sizes based on dimensions
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const headlineFontComputed = clamp(
    Math.min(
      headlineSize.height * 0.4,
      headlineSize.width / 10
    ),
    8,
    20
  );

  const subtitleFontComputed = clamp(
    Math.min(
      subtitleSize.height * 0.4,
      subtitleSize.width / 10
    ),
    6,
    16
  );

  // Determine if interactions are enabled
  const isInteractive = !!(onHeadlineDrag || onSubtitleDrag || onHeadlineResize || onSubtitleResize);

  // Drag and resize state management (EXACT same as Editor.tsx)
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number; direction: string } | null>(null);
  // Keep the element's position at drag start to avoid cumulative drift
  const [dragStartElementPos, setDragStartElementPos] = useState<{ x: number; y: number } | null>(null);

  // Handle drag start (EXACT same as Editor.tsx)
  const handleDragStart = (element: string, e: React.MouseEvent) => {
    if (!isInteractive) return;
    // Don't prevent default here - let click events work
    // Only set up for potential drag, don't start dragging yet
    setDragOffset({ x: e.clientX, y: e.clientY });
    setDragTarget(element);
    // Snapshot starting percent position for stable calculations
    const startPos = element === 'headline' ? headlinePosition : subtitlePosition;
    setDragStartElementPos({ x: startPos.x, y: startPos.y });
    // no-op: diagnostics removed
  };

  // Handle resize start (EXACT same as Editor.tsx)
  const handleResizeStart = (id: string, direction: string, e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: id === 'headline' ? headlineSize.width : subtitleSize.width,
      height: id === 'headline' ? headlineSize.height : subtitleSize.height,
      direction: direction
    });
  };

  // Handle drag end (EXACT same as Editor.tsx)
  const handleDragEnd = () => {
    setIsDragging(null);
    setDragOffset(null);
    setDragTarget(null);
  };

  // Handle mouse up (EXACT same as Editor.tsx)
  const handleGlobalMouseUp = () => {
    setIsDragging(null);
    setIsResizing(null);
    setResizeStart(null);
    setDragOffset(null);
    setDragTarget(null);
  };

  // Global mouse move (EXACT same as Editor.tsx)
  const handleGlobalMouseMove = (e: MouseEvent) => {
    // Check if we should start dragging (same logic as popup)
    if (dragOffset && !isDragging && !isResizing) {
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Only start dragging if mouse moved more than 5 pixels
      if (distance > 5) {
        // Use the specific element that was clicked for dragging
        if (dragTarget) {
          setIsDragging(dragTarget);
        }
      }
    }
    
    if (isDragging && dragOffset) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      
      // Use 1:1 scaling for popup to match mouse movement exactly
      const scaleX = rect.width; // 1:1 horizontal scaling
      const scaleY = rect.height; // 1:1 vertical scaling
      
      if (isDragging === 'headline') {
        const startPos = dragStartElementPos ?? headlinePosition;
        const deltaPercentX = (deltaX / scaleX) * 100;
        const deltaPercentY = (deltaY / scaleY) * 100;
        const newX = Math.max(0, Math.min(100, startPos.x + deltaPercentX));
        const newY = Math.max(0, Math.min(100, startPos.y + deltaPercentY));
        // diagnostics removed
        onHeadlineDrag?.({ x: newX, y: newY });
      } else if (isDragging === 'subtitle') {
        const startPos = dragStartElementPos ?? subtitlePosition;
        const deltaPercentX = (deltaX / scaleX) * 100;
        const deltaPercentY = (deltaY / scaleY) * 100;
        const newX = Math.max(0, Math.min(100, startPos.x + deltaPercentX));
        const newY = Math.max(0, Math.min(100, startPos.y + deltaPercentY));
        // diagnostics removed
        onSubtitleDrag?.({ x: newX, y: newY });
      }
    }
      
    if (isResizing && resizeStart) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();

      // Calculate the difference from the start position
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      // Apply resize based on direction
      if (resizeStart.direction === 'right') {
        newWidth = Math.max(50, Math.min(300, resizeStart.width + deltaX));
      } else if (resizeStart.direction === 'left') {
        newWidth = Math.max(50, Math.min(300, resizeStart.width - deltaX));
      }
      
      if (resizeStart.direction === 'bottom') {
        newHeight = Math.max(20, Math.min(100, resizeStart.height + deltaY));
      } else if (resizeStart.direction === 'top') {
        newHeight = Math.max(20, Math.min(100, resizeStart.height - deltaY));
      }

      if (isResizing === 'headline') {
        onHeadlineResize?.({ width: newWidth, height: newHeight });
      } else if (isResizing === 'subtitle') {
        onSubtitleResize?.({ width: newWidth, height: newHeight });
      }
    }
  };

  // Global mouse event listeners (EXACT same as Editor.tsx)
  useEffect(() => {
    if (isDragging || isResizing || dragOffset) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, dragTarget]);

  return (
    <div 
      className={`template-preview-container relative bg-gray-100 rounded-lg overflow-hidden ${className}`} 
      style={{ width: finalDimensions.width, height: finalDimensions.height }}
      ref={containerRef}
    >
      {/* Background */}
      {showBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <div className="text-gray-500 text-sm">{t("common.demoVideo")}</div>
        </div>
      )}

      {/* Headline */}
      <DraggableTextBlock
        id="headline"
        text={headlineText}
        position={headlinePosition}
        size={headlineSize}
        styles={{
          textColor: headlineStyles.textColor,
          backgroundColor: headlineStyles.backgroundColor,
          backgroundOpacity: headlineStyles.backgroundOpacity,
          fontSize: headlineFontComputed,
          fontFamily: headlineStyles.fontFamily,
          fontWeight: headlineStyles.fontWeight,
          fontStyle: headlineStyles.fontStyle,
          textDecoration: headlineStyles.textDecoration,
          textShadow: headlineStyles.textShadow,
          textStroke: headlineStyles.textStroke,
          textAlign: headlineStyles.textAlign,
          borderRadius: headlineStyles.borderRadius
        }}
        selected={selectedTextBlock === 'headline'}
        isDragging={isDragging === 'headline'}
        isResizing={isResizing === 'headline'}
        computedFontSize={headlineFontComputed}
        isInteractive={isInteractive}
        onDragStart={(id, e) => handleDragStart(id, e)}
        onResizeStart={(id, dir, e) => handleResizeStart(id, dir, e)}
        onClick={onHeadlineClick}
      />

      {/* Subtitle */}
      <DraggableTextBlock
        id="subtitle"
        text={subtitleText}
        position={subtitlePosition}
        size={subtitleSize}
        styles={{
          textColor: subtitleStyles.textColor,
          backgroundColor: subtitleStyles.backgroundColor,
          backgroundOpacity: subtitleStyles.backgroundOpacity,
          fontSize: subtitleFontComputed,
          fontFamily: subtitleStyles.fontFamily,
          fontWeight: subtitleStyles.fontWeight,
          fontStyle: subtitleStyles.fontStyle,
          textDecoration: subtitleStyles.textDecoration,
          textShadow: subtitleStyles.textShadow,
          textStroke: subtitleStyles.textStroke,
          textAlign: subtitleStyles.textAlign,
          borderRadius: subtitleStyles.borderRadius
        }}
        selected={selectedTextBlock === 'subtitle'}
        isDragging={isDragging === 'subtitle'}
        isResizing={isResizing === 'subtitle'}
        computedFontSize={subtitleFontComputed}
        isInteractive={isInteractive}
        onDragStart={(id, e) => handleDragStart(id, e)}
        onResizeStart={(id, dir, e) => handleResizeStart(id, dir, e)}
        onClick={onSubtitleClick}
      />
    </div>
  );
};

export default TemplatePreview;
