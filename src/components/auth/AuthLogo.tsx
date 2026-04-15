import { cn } from '@/lib/utils';
import EznityLogo from '../common/EznityLogo';

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
    <div className={cn('flex items-center gap-1 hover:opacity-80 cursor-pointer select-none', className)}
    onClick={() => onClick?.()}
    >
      <EznityLogo variant="inline" height={32} color={type === 'white' ? 'white' : 'currentColor'} />
    </div>
  );
};

