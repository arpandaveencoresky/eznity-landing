// Shared header component for all authenticated pages

import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, Crown, LogOut, User, Settings, Save, Download, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserInitials } from '@/utils/authHelpers';
import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { LiveStreamPopup } from '@/components/common/LiveStreamPopup';
import { AuthLogo } from '../auth/AuthLogo';
import { useHeaderConfig } from '@/contexts/HeaderConfigContext';
import { ModeToggle } from '@/components/mode-toggle';

// Routes that should not show back button
const NO_BACK_ROUTES = ['/dashboard', '/product/dashboard', '/projects'];

// Routes that should go to dashboard on back
const BACK_TO_DASHBOARD_ROUTES = ['/upload', '/subscription'];

export const AppHeader = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user, logout, isLive, streamData } = useAuth();
  const { config } = useHeaderConfig();
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add a small delay before showing popup to avoid flickering
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isHoveringProfile && isLive && streamData) {
      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      timeoutId = setTimeout(() => setShowPopup(true), 300);
    } else {
      // Add delay before hiding to allow moving to popup
      hideTimeoutRef.current = setTimeout(() => setShowPopup(false), 150);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isHoveringProfile, isLive, streamData]);

  // Debug: Log isLive in AppHeader
  useEffect(() => {
    console.log('🚀 AppHeader - isLive value:', isLive);
  }, [isLive]);
  const { variant, actions = {}, ui = {}, customButtons } = config;
  const { onSaveStyle, onExportVideo, onBack, isExporting } = actions;
  const { showUpgrade = variant === 'dashboard', showBack } = ui;

  const handleLogout = () => {
    logout();
    navigate('/product/login', { replace: true });
  };

  // Determine if back button should be shown
  const shouldShowBack = useCallback(() => {
    if (typeof showBack === 'boolean') return showBack;
    if (variant === 'minimal') return false;
    if (NO_BACK_ROUTES.includes(location.pathname)) {
      return false;
    }
    // Show back for all other routes
    return true;
  }, [location.pathname, showBack, variant]);

  // Handle back navigation intelligently
  const handleBackClick = useCallback(() => {
    if (onBack) {
      // Use custom back handler if provided
      onBack();
      return;
    }

    const pathname = location.pathname;
    const state = location.state as { projectId?: string } | null;

    // Handle specific routes
    if (pathname.startsWith('/reel/')) {
      // From reel details, go to project reels if projectId available
      const projectId = params.projectId || state?.projectId;
      if (projectId) {
        navigate(`/product/project/${projectId}/reels`);
      } else {
        navigate('/dashboard');
      }
    } else if (pathname.startsWith('/editor')) {
      // From editor, go to reel details if reelId available
      const reelId = params.reelId;
      if (reelId) {
        navigate(`/reel/${reelId}`, {
          state: state?.projectId ? { projectId: state.projectId } : undefined
        });
      } else {
        navigate('/dashboard');
      }
    } else if (pathname.startsWith('/project/') && pathname.endsWith('/reels')) {
      // From project reels, go to dashboard
      navigate('/dashboard');
    } else if (BACK_TO_DASHBOARD_ROUTES.includes(pathname)) {
      // Specific routes that should go to dashboard
      navigate('/dashboard');
    } else {
      // Default: browser back
      navigate(-1);
    }
  }, [location, params, navigate, onBack]);

  const showBackButton = shouldShowBack();

  const shouldShowEditorActions = useMemo(
    () => Boolean(onSaveStyle && onExportVideo),
    [onSaveStyle, onExportVideo]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
        {/* Left Section: Back Button + Logo */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Back Button Container - Smooth width animation */}
          <div
            style={{
              width: showBackButton ? '44px' : '0px',
              marginRight: showBackButton ? '6px' : '0px',
              opacity: showBackButton ? 1 : 0,
              transform: showBackButton ? 'scale(1) translateX(0)' : 'scale(0.6) translateX(-12px)',
              transition: 'all 400ms cubic-bezier(0.32, 0.72, 0, 1)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-xl"
              onClick={handleBackClick}
              aria-label={t('common.buttons.back')}
              tabIndex={showBackButton ? 0 : -1}
            >
              <ChevronLeft className="!h-7 !w-7" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Logo */}
          {/* <h1 
            className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent cursor-pointer hover:opacity-80 select-none"
            onClick={() => navigate('/dashboard')}
            style={{
              transition: 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            EZNITY.AI
          </h1> */}
          <AuthLogo onClick={() => navigate('/dashboard')} />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3 sm:gap-3 lg:gap-3 flex-shrink-0">
          {/* Save & Export Buttons - Only shown in Editor */}
          {shouldShowEditorActions && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="group gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={onSaveStyle}
              >
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary group-hover:text-accent-foreground transition-colors duration-200" />
                <span className="hidden sm:inline font-medium text-xs sm:text-sm">{t('common.buttons.save')}</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 group border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={onExportVideo}
                aria-label={t('common.buttons.export')}
                disabled={!onExportVideo || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary group-hover:text-accent-foreground transition-colors duration-200" />
                )}
              </Button>
            </>
          )}

          {/* Custom Buttons Slot - Rendered after predefined actions */}
          {customButtons && customButtons}

          {/* Upgrade Button */}
          {showUpgrade && (
            <Button
              variant="outline"
              size="sm"
              className="group gap-1.5 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
              onClick={() => navigate('/subscription')}
            >
              <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent group-hover:text-white transition-colors duration-200" />
              <span className="hidden sm:inline">{t('header.upgrade')}</span>
            </Button>
          )}

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => {
              if (isLive && streamData) {
                setIsHoveringProfile(true);
              }
            }}
            onMouseLeave={(e) => {
              // Check if we're moving to the popup
              const relatedTarget = e.relatedTarget as HTMLElement;
              const isMovingToPopup = relatedTarget?.closest('[data-live-popup]');
              if (!isMovingToPopup) {
                setIsHoveringProfile(false);
              }
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-profile-avatar
                  variant="ghost"
                  className={cn(
                    "relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full p-0 overflow-visible flex items-center justify-center",
                    isLive && "hover:bg-transparent"
                  )}
                >
                  <div className="relative overflow-visible z-0 flex items-center justify-center w-full h-full">
                    <div className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 flex items-center justify-center">
                      {isLive && (
                        <>
                          <div className="live-avatar-wave" />
                          <div className="live-avatar-wave" />
                          <div className="live-avatar-wave" />
                        </>
                      )}
                      <Avatar className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 relative z-10 border-2",
                        isLive ? "border-red-500 live-avatar-border" : "border-transparent"
                      )}>
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs sm:text-sm">
                          {getUserInitials(user?.name, user?.email)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || t('header.user')}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/product/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/product/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('header.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logOut')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isLive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-none z-50">
                <LiveIndicator isLive={isLive} size="sm" />
              </div>
            )}
            {/* Live Stream Popup - appears on hover */}
            {isLive && streamData && (
              <LiveStreamPopup
                streamData={streamData}
                isVisible={showPopup}
                onMouseEnterPopup={() => {
                  // Cancel any pending hide timeout when entering popup
                  if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                  }
                  setIsHoveringProfile(true);
                  setShowPopup(true);
                }}
                onClose={() => {
                  setIsHoveringProfile(false);
                  setShowPopup(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

