import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LiveIndicator = ({ isLive = false, className, size = 'md' }: LiveIndicatorProps) => {
  const sizeClasses = {
    sm: 'text-[7px] px-1 py-[2px] leading-[1]',
    md: 'text-[8px] px-1.5 py-[2px] leading-[1]',
    lg: 'text-[9px] px-2 py-[3px] leading-[1]',
  };

  if (!isLive) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute bottom-2 left-1/2',
        'bg-red-500 text-white font-bold rounded-full',
        'border-2 border-white shadow-lg',
        'flex items-center justify-center',
        'overflow-hidden relative',
        'whitespace-nowrap',
        'z-50',
        'live-indicator-spring',
        sizeClasses[size],
        className
      )}
      style={{ minWidth: 'fit-content', maxWidth: 'fit-content' }}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 opacity-60 live-indicator-shimmer" />
      
      {/* Live text */}
      <span className="relative z-10 font-semibold tracking-tighter text-[6px] lg:text-[7px]">LIVE</span>
      
      {/* Pulsing red dot */}
      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
    </div>
  );
};

