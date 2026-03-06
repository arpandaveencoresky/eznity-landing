// Reusable disconnect confirmation dialog component
// Used for disconnecting social accounts

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DisconnectConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  platform: string;
  accountName?: string | null;
  isDisconnecting?: boolean;
}

export const DisconnectConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  platform,
  accountName,
  isDisconnecting = false,
}: DisconnectConfirmationDialogProps) => {
  const { t } = useTranslation();
  
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const displayName = accountName || platformName;

  // Get platform-specific disconnect description
  const getDisconnectDescription = () => {
    if (platform === 'twitch') {
      return t('settings.disconnectDescriptionTwitch', { accountName: displayName });
    } else if (platform === 'instagram') {
      return t('settings.disconnectDescriptionInstagram', { accountName: displayName });
    } else {
      return t('settings.disconnectDescription', { platform: platformName, accountName: displayName });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('settings.disconnectTitle', { platform: platformName })}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDisconnectDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisconnecting}>{t('common.buttons.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDisconnecting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.buttons.disconnecting')}
              </>
            ) : (
              t('common.buttons.disconnect')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisconnectConfirmationDialog;

