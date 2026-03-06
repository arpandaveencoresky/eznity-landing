/**
 * useDragResize Hook
 * 
 * Manages drag and resize operations for text overlays on video.
 */

import { useCallback, useEffect, useState } from 'react';

export interface Position {
  x: number;
  y: number;
  centered?: boolean;
}

export interface Size {
  width: number;
  height: number;
}

export interface DragResizeState {
  isDragging: string | null;
  isResizing: string | null;
  dragTarget: string | null;
}

export interface DragResizeOptions {
  headlinePosition: Position;
  setHeadlinePosition: (pos: Position) => void;
  subtitlePosition: Position;
  setSubtitlePosition: (pos: Position) => void;
  wordSubtitlePosition: Position;
  setWordSubtitlePosition: (pos: Position) => void;
  titlePosition: Position;
  setTitlePosition: (pos: Position) => void;
  headlineSize: Size;
  setHeadlineSize: (size: Size) => void;
  subtitleSize: Size;
  setSubtitleSize: (size: Size) => void;
}

export function useDragResize(options: DragResizeOptions) {
  const {
    headlinePosition,
    setHeadlinePosition,
    subtitlePosition,
    setSubtitlePosition,
    wordSubtitlePosition,
    setWordSubtitlePosition,
    titlePosition,
    setTitlePosition,
    headlineSize,
    setHeadlineSize,
    subtitleSize,
    setSubtitleSize,
  } = options;

  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [dragStartElementPos, setDragStartElementPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    direction: string;
  } | null>(null);

  const getPositionForElement = useCallback((element: string): Position => {
    switch (element) {
      case 'headline':
        return headlinePosition;
      case 'wordSubtitle':
        return wordSubtitlePosition;
      case 'title':
        return titlePosition;
      default:
        return subtitlePosition;
    }
  }, [headlinePosition, subtitlePosition, wordSubtitlePosition, titlePosition]);

  const handleDragStart = useCallback((element: string, e: React.MouseEvent) => {
    setDragOffset({ x: e.clientX, y: e.clientY });
    setDragTarget(element);
    const startPos = getPositionForElement(element);
    setDragStartElementPos({ x: startPos.x, y: startPos.y });
  }, [getPositionForElement]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
    setDragOffset(null);
    setDragTarget(null);
  }, []);

  const handleResizeStart = useCallback((element: string, direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(element);

    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
      const currentSize = element === 'headline' ? headlineSize : subtitleSize;
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: currentSize.width,
        height: currentSize.height,
        direction,
      });
    }
  }, [headlineSize, subtitleSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
    setResizeStart(null);
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent, element: string) => {
    if (!isDragging || isDragging !== element) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (element === 'headline') {
      setHeadlinePosition({ x: clampedX, y: clampedY });
    } else if (element === 'subtitle') {
      setSubtitlePosition({ x: clampedX, y: clampedY });
    }
  }, [isDragging, setHeadlinePosition, setSubtitlePosition]);

  // Global mouse move handler
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    // Check if we should start dragging
    if (dragOffset && !isDragging && !isResizing) {
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 5 && dragTarget) {
        setIsDragging(dragTarget);
      }
    }

    if (isDragging && dragOffset) {
      const videoContainer = document.querySelector('.video-container');
      if (!videoContainer) return;

      const content = document.querySelector('.video-container .video-content') as HTMLElement | null;
      const rect = (content || videoContainer).getBoundingClientRect();
      const deltaX = e.clientX - dragOffset.x;
      const deltaY = e.clientY - dragOffset.y;
      const scaleX = rect.width;
      const scaleY = rect.height;

      const calculateNewPosition = (startPos: Position, centered = true): Position => {
        const deltaPercentX = (deltaX / scaleX) * 100;
        const deltaPercentY = (deltaY / scaleY) * 100;
        return {
          x: Math.max(0, Math.min(100, startPos.x + deltaPercentX)),
          y: Math.max(0, Math.min(100, startPos.y + deltaPercentY)),
          centered,
        };
      };

      const startPos = dragStartElementPos ?? getPositionForElement(isDragging);

      switch (isDragging) {
        case 'headline':
          setHeadlinePosition(calculateNewPosition(startPos));
          break;
        case 'subtitle':
          setSubtitlePosition(calculateNewPosition(startPos));
          break;
        case 'wordSubtitle':
          setWordSubtitlePosition(calculateNewPosition(startPos, false));
          break;
        case 'title':
          setTitlePosition(calculateNewPosition(startPos, false));
          break;
      }
    }

    if (isResizing && resizeStart) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      switch (resizeStart.direction) {
        case 'left':
          newWidth = Math.max(60, Math.min(400, resizeStart.width - deltaX));
          break;
        case 'right':
          newWidth = Math.max(60, Math.min(400, resizeStart.width + deltaX));
          break;
        case 'top':
          newHeight = Math.max(24, Math.min(200, resizeStart.height - deltaY));
          break;
        case 'bottom':
          newHeight = Math.max(24, Math.min(200, resizeStart.height + deltaY));
          break;
      }

      if (isResizing === 'headline') {
        setHeadlineSize({ width: newWidth, height: newHeight });
      } else if (isResizing === 'subtitle') {
        setSubtitleSize({ width: newWidth, height: newHeight });
      }
    }
  }, [
    dragOffset,
    isDragging,
    isResizing,
    dragTarget,
    dragStartElementPos,
    resizeStart,
    getPositionForElement,
    setHeadlinePosition,
    setSubtitlePosition,
    setWordSubtitlePosition,
    setTitlePosition,
    setHeadlineSize,
    setSubtitleSize,
  ]);

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(null);
    setIsResizing(null);
    setResizeStart(null);
    setDragOffset(null);
    setDragTarget(null);
  }, []);

  // Attach global listeners
  useEffect(() => {
    if (isDragging || isResizing || dragOffset) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, handleGlobalMouseMove, handleGlobalMouseUp]);

  return {
    isDragging,
    isResizing,
    dragTarget,
    handleDragStart,
    handleDragEnd,
    handleResizeStart,
    handleResizeEnd,
    handleDragMove,
  };
}

