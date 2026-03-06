// Reusable count card component for dashboard

import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface CountCardProps {
  icon: ReactNode;
  label: string;
  count: number | string;
  isLoading?: boolean;
  iconBgColor?: string;
  watermarkIcon?: ReactNode;
}

export const CountCard = ({
  icon,
  label,
  count,
  isLoading = false,
  iconBgColor = 'bg-primary',
  watermarkIcon,
}: CountCardProps) => {
  return (
    <Card className="p-4 sm:p-6 border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 hover:shadow-md transition-all relative overflow-hidden">
      {/* Background watermark */}
      {watermarkIcon && (
        <div className="absolute -right-8 -bottom-8 opacity-[0.06]">
          {watermarkIcon}
        </div>
      )}
      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
        <div
          className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${iconBgColor} flex items-center justify-center shadow-sm`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {isLoading ? '...' : count}
          </p>
        </div>
      </div>
    </Card>
  );
};

