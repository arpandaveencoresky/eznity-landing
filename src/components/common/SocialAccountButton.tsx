// Reusable Social Account Connection Button
// Used in Settings page for connecting/disconnecting social accounts

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, Unlink } from "lucide-react";
import { SocialPlatform } from "./SocialIcon";
import { ReactNode, useState } from "react";
import { DisconnectConfirmationDialog } from "./DisconnectConfirmationDialog";

// Social platform icons (inline SVGs for complete control)
const platformIcons: Record<SocialPlatform, (props: { className?: string }) => JSX.Element> = {
  instagram: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  youtube: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  tiktok: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  twitch: ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428H12l-3.429 3.428v-3.428H3.714V1.714h16.857Z" />
    </svg>
  ),
};

const platformColors: Record<SocialPlatform, string> = {
  instagram: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
  youtube: 'bg-red-600',
  tiktok: 'bg-gray-900',
  twitch: 'bg-primary',
};

interface SocialAccountButtonProps {
  platform: SocialPlatform;
  displayName: string;
  isConnected: boolean;
  isLinking: boolean;
  isDisconnecting: boolean;
  avatarUrl?: string | null;
  connectedAccountName?: string | null;
  onClick: () => void;
  onDisconnect: (e: React.MouseEvent) => void;
}

export const SocialAccountButton = ({
  platform,
  displayName,
  isConnected,
  isLinking,
  isDisconnecting,
  avatarUrl,
  connectedAccountName,
  onClick,
  onDisconnect,
}: SocialAccountButtonProps) => {
  const { t } = useTranslation();
  const Icon = platformIcons[platform];
  const bgColor = platformColors[platform];
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const handleDisconnectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDisconnectDialog(true);
  };

  const handleConfirmDisconnect = () => {
    setShowDisconnectDialog(false);
    // Create a synthetic event for the onDisconnect handler
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.MouseEvent;
    onDisconnect(syntheticEvent);
  };

  return (
    <>
      <div className="relative">
        <div
          className={`group/btn w-full p-4 rounded-lg border-2 transition-all duration-300 ${
            isConnected
              ? 'border-primary bg-primary/5'
              : isLinking
              ? 'border-border bg-muted/50 opacity-60'
              : 'border-border bg-background hover:border-primary/50 hover:shadow-md cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-4">
            {isConnected && avatarUrl ? (
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 rounded-lg border-2 border-primary/20">
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={connectedAccountName || displayName}
                    className="rounded-lg"
                  />
                  <AvatarFallback className={`rounded-lg ${bgColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${bgColor} border-2 border-background flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            ) : (
              <div
                className={`flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center transition-all duration-300 bg-muted group-hover/btn:${bgColor.replace('bg-', 'bg-')}`}
                style={{ backgroundColor: isConnected || isLinking ? undefined : undefined }}
              >
                <Icon
                  className={`w-6 h-6 transition-all duration-300 ${
                    isConnected ? 'text-white' : 'text-muted-foreground group-hover/btn:text-white'
                  }`}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold transition-colors duration-300 ${isConnected ? 'text-foreground' : 'text-muted-foreground group-hover/btn:text-foreground'}`}>
                {isConnected && connectedAccountName ? connectedAccountName : displayName}
              </p>
              {isLinking && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span>{t('common.buttons.connecting')}</span>
                </p>
              )}
              {isConnected && (
                <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t('settings.connected')}</span>
                </p>
              )}
              {!isConnected && !isLinking && (
                <p className="text-xs text-muted-foreground mt-1">{t('settings.clickToConnect')}</p>
              )}
            </div>
            {isConnected && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDisconnectClick}
                disabled={isDisconnecting}
                className="flex-shrink-0 h-9 px-3 text-xs border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
              >
                <Unlink className="h-3 w-3" />
                {t('common.buttons.disconnect')}
              </Button>
            )}
            {!isConnected && !isLinking && (
              <button
                onClick={onClick}
                className="absolute inset-0 w-full h-full rounded-lg"
                aria-label={t('settings.clickToConnect')}
              />
            )}
          </div>
        </div>
      </div>

      <DisconnectConfirmationDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
        onConfirm={handleConfirmDisconnect}
        platform={platform}
        accountName={connectedAccountName}
        isDisconnecting={isDisconnecting}
      />
    </>
  );
};

export default SocialAccountButton;

