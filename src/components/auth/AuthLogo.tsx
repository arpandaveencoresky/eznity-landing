import { cn } from '@/lib/utils';

interface AuthLogoProps {
  className?: string;
  badgeText?: string;
  title?: string;
  type?: 'primary' | 'white';
  onClick?: () => void;
}

export const AuthLogo = ({
  className,
  badgeText = 'EZ',
  title = 'EZNITY.AI',
  type = 'primary',
  onClick,
}: AuthLogoProps) => {
  return (
    <div className={cn('flex items-center gap-1 text-primary-foreground/90 hover:opacity-80 cursor-pointer select-none', className)}
    onClick={() => onClick?.()}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary border border-white/25 backdrop-blur-sm font-semibold tracking-wide">
        {badgeText}
        </div>
        <div className={cn('text-sm font-semibold uppercase tracking-[0.12em]', type === 'primary' ? 'text-primary' : 'text-white')}>
        {title}
      </div>
    </div>
  );
};

