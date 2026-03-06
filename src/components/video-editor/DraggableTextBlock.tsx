import React from "react";

export interface TextStyles {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  fontSize?: number; // not used directly; computed font size is passed
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

interface DraggableTextBlockProps {
  id: "headline" | "subtitle";
  text: string;
  position: { x: number; y: number }; // percentage based
  size: { width: number; height: number }; // px
  styles: TextStyles;
  selected: boolean;
  isDragging?: boolean;
  isResizing?: boolean;
  computedFontSize: number;
  isInteractive?: boolean;
  onDragStart?: (id: "headline" | "subtitle", e: React.MouseEvent) => void;
  onResizeStart?: (id: "headline" | "subtitle", direction: "left" | "right" | "top" | "bottom", e: React.MouseEvent) => void;
  onClick?: (id: "headline" | "subtitle") => void;
}

export const DraggableTextBlock: React.FC<DraggableTextBlockProps> = ({
  id,
  text,
  position,
  size,
  styles,
  selected,
  isDragging,
  isResizing,
  computedFontSize,
  isInteractive = true,
  onDragStart,
  onResizeStart,
  onClick,
}) => {
  return (
    <div 
      className={`text-overlay-container absolute select-none ${isDragging || isResizing ? 'z-50' : 'z-10'} ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${isDragging || isResizing || selected ? 'selected' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: `${size.width}px`,
        height: `${size.height}px`,
        borderRadius: '4px',
        boxSizing: 'border-box',
        overflow: 'visible'
      }}
      onMouseDown={(e) => {
        if (!isInteractive) return;
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.text-content')) {
          // Don't prevent default here - let click events work
          // Only start drag if mouse moves significantly
          onDragStart?.(id, e);
        }
      }}
      onClick={(e) => {
        if (!isInteractive) return;
        e.stopPropagation();
        onClick?.(id);
      }}
    >
      <div 
        className="text-content w-full h-full flex items-center justify-center"
        style={{ 
          padding: '3px',
          backgroundColor: styles?.backgroundColor || '#000000',
          opacity: (styles?.backgroundOpacity || 100) / 100,
          borderRadius: `${styles?.borderRadius || 0}px`,
          boxSizing: 'border-box'
        }}
      >
        <p 
          className="text-center overflow-hidden font-bold flex items-center justify-center w-full h-full m-0"
          style={{
            color: styles?.textColor || '#ffffff',
            fontSize: `${computedFontSize}px`,
            fontFamily: styles?.fontFamily || 'Arial, sans-serif',
            fontWeight: styles?.fontWeight || 'normal',
            fontStyle: styles?.fontStyle || 'normal',
            textDecoration: styles?.textDecoration || 'none',
            textTransform: styles?.textTransform || 'none',
            textAlign: (styles?.textAlign as any) || 'center',
            textShadow: styles?.textShadow?.enabled 
              ? `${styles.textShadow.offsetX}px ${styles.textShadow.offsetY}px ${styles.textShadow.blur}px ${styles.textShadow.color}`
              : '2px 2px 4px rgba(0,0,0,0.8)',
            WebkitTextStroke: styles?.textStroke?.enabled 
              ? `${styles.textStroke.width}px ${styles.textStroke.color}`
              : 'none',
            whiteSpace: size.height > 40 ? 'normal' : 'nowrap',
            lineHeight: '1.1'
          }}
        >
          {text}
        </p>
      </div>

      {/* Resize handles - shown via CSS when container has .selected */}
      {isInteractive && (
        <>
          <div 
            className="resize-handle resize-handle-left"
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(id, 'left', e); }}
          />
          <div 
            className="resize-handle resize-handle-right"
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(id, 'right', e); }}
          />
          <div 
            className="resize-handle resize-handle-top"
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(id, 'top', e); }}
          />
          <div 
            className="resize-handle resize-handle-bottom"
            onMouseDown={(e) => { e.stopPropagation(); onResizeStart?.(id, 'bottom', e); }}
          />
        </>
      )}
    </div>
  );
};

export default DraggableTextBlock;


