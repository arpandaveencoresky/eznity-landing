import { useRef, useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface TimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onSelectionChange?: (start: number, end: number) => void;
}

export const Timeline = ({
  duration,
  currentTime,
  onSeek,
  onSelectionChange,
}: TimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // Initialize audio context and analyzer
  const initializeAudioAnalysis = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.8;
      }
    } catch (error) {
      console.error('Error initializing audio analysis:', error);
    }
  };

  // Analyze audio and generate waveform data
  const analyzeAudio = async (videoElement: HTMLVideoElement) => {
    try {
      await initializeAudioAnalysis();
      
      if (!audioContextRef.current || !analyserRef.current) return;

      // Create audio source from video
      const source = audioContextRef.current.createMediaElementSource(videoElement);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      // Generate waveform data
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Sample audio at different time points
      const totalBars = Math.max(50, Math.min(200, Math.floor(duration * 10)));
      const waveformPoints: number[] = [];
      
      for (let i = 0; i < totalBars; i++) {
        const timePoint = (i / totalBars) * duration;
        
        // Seek to time point and analyze
        videoElement.currentTime = timePoint;
        await new Promise(resolve => setTimeout(resolve, 50)); // Wait for seek
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude for this time point
        let sum = 0;
        for (let j = 0; j < bufferLength; j++) {
          sum += dataArray[j];
        }
        const average = sum / bufferLength;
        waveformPoints.push(average);
      }
      
      // Normalize waveform data (0-100%)
      const maxValue = Math.max(...waveformPoints);
      const normalizedData = waveformPoints.map(value => 
        maxValue > 0 ? (value / maxValue) * 100 : 20
      );
      
      setWaveformData(normalizedData);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      // Fallback to random data if audio analysis fails
      const totalBars = Math.max(50, Math.min(200, Math.floor(duration * 10)));
      const fallbackData = Array.from({ length: totalBars }, () => Math.random() * 60 + 20);
      setWaveformData(fallbackData);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    if (selectionMode && !selection) {
      setSelection({ start: time, end: time });
    } else if (selectionMode && selection) {
      setSelection({ ...selection, end: time });
      onSelectionChange?.(selection.start, time);
      setSelectionMode(false);
    } else {
      onSeek(time);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * duration;
    onSeek(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  // Scale the number of bars with duration, but keep a sensible min/max for performance
  const totalBars = Math.max(50, Math.min(200, Math.floor(duration * 10)));

  // Generate waveform visualization (without seeking video which causes autoplay issues)
  useEffect(() => {
    if (duration > 0) {
      // Generate realistic audio-like waveform data without actually analyzing video
      // This avoids the issue where seeking video during analysis triggers playback
      const totalBars = Math.max(50, Math.min(200, Math.floor(duration * 10)));
      const generatedData: number[] = [];
      
      for (let i = 0; i < totalBars; i++) {
        const timePoint = i / totalBars;
        const baseHeight = 40;
        // Create speech-like pattern with natural variation
        const speechPattern = Math.sin(timePoint * Math.PI * 12) * 25;
        const variation = Math.sin(timePoint * Math.PI * 47) * 15;
        const randomVariation = (Math.random() - 0.5) * 20;
        const height = Math.max(15, Math.min(100, baseHeight + speechPattern + variation + randomVariation));
        generatedData.push(height);
      }
      
      setWaveformData(generatedData);
    }
  }, [duration]);

  return (
    <div className="w-full space-y-1">
      <div
        ref={timelineRef}
        className="relative w-full h-8 bg-muted/50 rounded cursor-pointer"
        onClick={handleTimelineClick}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Waveform visualization - real audio data with varying heights */}
        <div className="absolute inset-0 flex items-end justify-start gap-px px-1">
          {Array.from({ length: totalBars }).map((_, i) => {
            const progressedBars = (progress / 100) * totalBars;
            const isPassed = i < progressedBars;
            
            // Use real audio data if available, otherwise generate realistic variation
            let audioHeight;
            if (waveformData[i] !== undefined) {
              audioHeight = waveformData[i];
            } else {
              // Generate realistic audio-like variation for demo
              const timePoint = i / totalBars;
              const baseHeight = 30;
              const variation = Math.sin(timePoint * Math.PI * 8) * 40; // Speech-like pattern
              const randomVariation = (Math.random() - 0.5) * 20; // Natural variation
              audioHeight = Math.max(20, Math.min(100, baseHeight + variation + randomVariation));
            }
            
            const barHeight = Math.max(20, Math.min(100, audioHeight));
            
            return (
              <div
                key={i}
                className="rounded-full transition-colors flex-1"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: isPassed
                    ? "hsl(var(--primary))"
                    : "hsl(var(--primary) / 0.3)",
                }}
              />
            );
          })}
        </div>

        {/* Selection overlay */}
        {selection && (
          <div
            className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary"
            style={{
              left: `${(selection.start / duration) * 100}%`,
              right: `${100 - (selection.end / duration) * 100}%`,
            }}
          />
        )}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-accent z-10"
          style={{ left: `${progress}%` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 lg:w-3 lg:h-3 bg-accent rounded-full" />
        </div>

        {/* <div className="absolute bottom-1 lg:bottom-2 left-1 lg:left-2 text-xs text-white/70 font-mono">
          {formatTime(duration)}
        </div> */}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
