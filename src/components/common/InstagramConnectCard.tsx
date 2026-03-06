// Instagram connection card component
// Shows when Instagram is not connected, prompting user to connect

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SocialIcon, WatermarkIcon, getSocialIconBgColor } from '@/components/common/SocialIcon';
import { useInstagramConnection } from '@/hooks/useInstagramConnection';
import { useTranslation } from 'react-i18next';
import { Loader2, Link2 } from 'lucide-react';

export const InstagramConnectCard = () => {
  const { t } = useTranslation();
  const { connectInstagram, isLinking } = useInstagramConnection();

  return (
    <Card className="p-4 sm:p-6 border-2 border-dashed border-primary/30 hover:border-primary hover:shadow-lg transition-all relative overflow-hidden bg-primary/5">
      {/* Background Instagram logo watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.06]">
        <WatermarkIcon platform="instagram" className="w-32 h-32" />
      </div>
      
      {/* Mobile: 3-row layout (icon, text, button) */}
      <div className="flex flex-col sm:hidden gap-3 relative z-10">
        {/* Row 1: Icon centered */}
        <div className="flex justify-center">
          <div
            className={`w-12 h-12 rounded-lg ${getSocialIconBgColor('instagram')} flex items-center justify-center shadow-sm`}
          >
            <SocialIcon platform="instagram" size="lg" />
          </div>
        </div>
        
        {/* Row 2: Text content */}
        <div className="text-center">
          {/* <p className="text-xs text-muted-foreground mb-1">
            {t('dashboard.instagramReels')}
          </p> */}
          <p className="text-sm font-semibold text-foreground mb-1.5">
            {t('dashboard.connectInstagram')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.connectInstagramDescription')}
          </p>
        </div>
        
        {/* Row 3: Button */}
        <div className="flex justify-center">
          <Button
            onClick={connectInstagram}
            disabled={isLinking}
            size="sm"
            className="h-8 px-4 text-xs"
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t('common.buttons.connecting')}
              </>
            ) : (
              <>
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                {t('dashboard.connect')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop: 2-row layout (icon+text, button) */}
      <div className="hidden sm:flex sm:flex-col lg:flex-row lg:items-center gap-4 relative z-10">
        {/* Row 1: Icon and text side by side */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-lg ${getSocialIconBgColor('instagram')} flex items-center justify-center shadow-sm`}
          >
            <SocialIcon platform="instagram" size="lg" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {t('dashboard.instagramReels')}
            </p>
            {/* <p className="text-base font-semibold text-foreground mb-1.5">
              {t('dashboard.connectInstagram')}
            </p> */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {t('dashboard.connectInstagramDescription')}
            </p>
          </div>
        </div>
        {/* Row 2: Button */}
        <div className="flex justify-end">
          <Button
            onClick={connectInstagram}
            disabled={isLinking}
            size="sm"
            className="h-8 px-4 text-xs"
          >
            {isLinking ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {t('common.buttons.connecting')}
              </>
            ) : (
              <>
                {/* <Link2 className="mr-1.5 h-3.5 w-3.5" /> */}
                {t('dashboard.connect')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

