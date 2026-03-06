/**
 * useVideoControls Hook
 * 
 * Manages video playback controls: play/pause, seek, replay, fullscreen, speed.
 */

import { RefObject, useCallback, useEffect, useState } from 'react';

export interface VideoControlsOptions {
  videoRef: RefObject<HTMLVideoElement>;
  containerRef?: RefObject<HTMLDivElement>;
  selection?: { start: number; end: number } | null;
}

export interface VideoControlsState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
}

export interface VideoControlsActions {
  handlePlayPause: () => void;
  handleReplay: () => void;
  handleSeek: (time: number) => void;
  handleFullscreen: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export type UseVideoControlsReturn = VideoControlsState & VideoControlsActions;

export function useVideoControls({
  videoRef,
  containerRef,
  selection,
}: VideoControlsOptions): UseVideoControlsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Ensure video starts paused
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [videoRef.current?.src]);

  // Safeguard - pause on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (videoRef.current && !isPlaying) {
        videoRef.current.pause();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Update playback speed when changed
  useEffect(() => {
    if (videoRef.current && playbackSpeed !== 1) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (selection) {
        videoRef.current.currentTime = selection.start;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, selection]);

  const handleReplay = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = selection?.start || 0;
    videoRef.current.play();
    setIsPlaying(true);
  }, [selection]);

  const handleSeek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleFullscreen = useCallback(() => {
    const target = containerRef?.current;
    if (!target) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      target.requestFullscreen();
    }
  }, [containerRef]);

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    if (videoRef.current && !isPlaying) {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  return {
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    handlePlayPause,
    handleReplay,
    handleSeek,
    handleFullscreen,
    setPlaybackSpeed,
    setCurrentTime,
    setDuration: handleDurationChange,
    setIsPlaying,
  };
}

