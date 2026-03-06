// Settings page component

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SocialAccountButton } from '@/components/common/SocialAccountButton';
import { Loader2, Lock, Eye, EyeOff, Shield, Link2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/validations/auth';
import {
  initiateOAuthRedirect,
  type SocialPlatform,
} from '@/utils/oauth';
import {
  getConnectedAccountsCount,
  isSocialAccountConnected,
  getConnectedAccountDisplayName,
  getConnectedAccountAvatarUrl,
  capitalizeFirst,
} from '@/utils/authHelpers';

const Settings = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast({
        title: t('common.toast.success'),
        description: t('auth.messages.passwordChanged'),
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: t('common.toast.error'),
        description: error.message || t('auth.messages.passwordChangeFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAccountClick = async (platform: SocialPlatform) => {
    if (isLinking) return;

    if (isSocialAccountConnected(user, platform)) {
      return;
    }

    setIsLinking(platform);
    try {
      // Initiate OAuth redirect (in-window instead of popup)
      await initiateOAuthRedirect(platform, '/settings');
      // Note: User will be redirected away, so setIsLinking won't be called
      // The OAuthCallback page will handle the completion
    } catch (error: any) {
      toast({
        title: t('common.toast.error'),
        description: error.message || t('auth.messages.connectionFailed', { platform }),
        variant: 'destructive',
      });
      setIsLinking(null);
    }
  };

  const handleDisconnect = async (platform: SocialPlatform, e: React.MouseEvent) => {
    console.log("🚀 ~ handleDisconnect ~ platform:", platform)
    e.preventDefault();
    e.stopPropagation();
    
    setIsDisconnecting(platform);
    
    try {
      await authService.disconnectSocialAccount(platform);
      await refreshUser();
      
      toast({
        title: t('common.toast.success'),
        description: t('auth.messages.accountDisconnected', { platform: capitalizeFirst(platform) }),
      });
    } catch (error: any) {
      toast({
        title: t('common.toast.error'),
        description: error.message || t('auth.messages.disconnectionFailed', { platform }),
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(null);
    }
  };

  // Social platform configuration
  const socialPlatforms: { platform: SocialPlatform; displayName: string }[] = [
    { platform: 'instagram', displayName: 'Instagram' },
    // { platform: 'youtube', displayName: 'YouTube' },
    // { platform: 'tiktok', displayName: 'TikTok' },
    { platform: 'twitch', displayName: 'Twitch' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
      {/* Page Header */}
      <div className="mb-10 sm:mb-14">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              {t('settings.title')}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
          {t('settings.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1px_1fr] gap-8 xl:gap-12">
        {/* Left Section - Update Password */}
        <div className="space-y-6">
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{t('settings.updatePasswordTitle')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('settings.updatePasswordDescription')}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-sm font-semibold">
                          {t('common.labels.currentPassword')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showCurrentPassword ? 'text' : 'password'}
                              placeholder={t('common.placeholders.currentPassword')}
                              className="pl-10 pr-10 h-11"
                              disabled={isLoading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {fieldState.error && <FormMessage />}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-sm font-semibold">
                          {t('common.labels.newPassword')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder={t('common.placeholders.newPassword')}
                              className="pl-10 pr-10 h-11"
                              disabled={isLoading}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                form.trigger('confirmPassword');
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {fieldState.error && <FormMessage />}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-sm font-semibold">
                          {t('common.labels.confirmNewPassword')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder={t('common.placeholders.confirmNewPassword')}
                              className="pl-10 pr-10 h-11"
                              disabled={isLoading}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {fieldState.error && <FormMessage />}
                      </FormItem>
                    )}
                  />
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full sm:w-auto min-w-[180px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.buttons.updating')}
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {t('auth.buttons.updatePassword')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden xl:block w-px bg-border"></div>

        {/* Right Section - Social Accounts */}
        <div className="space-y-6">
          <div className="group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <Link2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{t('settings.socialAccountsTitle')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t('settings.socialAccountsDescription')}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    {t('settings.availablePlatforms')}
                  </h3>
                  {/* <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                    {t('settings.connectedCount', { count: getConnectedAccountsCount(user), total: 4 })}
                  </span> */}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('settings.connectDescription')}
                </p>
              </div>

              <div className="space-y-3">
                {socialPlatforms.map(({ platform, displayName }) => (
                  <SocialAccountButton
                    key={platform}
                    platform={platform}
                    displayName={displayName}
                    isConnected={isSocialAccountConnected(user, platform)}
                    isLinking={isLinking === platform}
                    isDisconnecting={isDisconnecting === platform}
                    avatarUrl={getConnectedAccountAvatarUrl(user, platform)}
                    connectedAccountName={getConnectedAccountDisplayName(user, platform)}
                    onClick={() => handleSocialAccountClick(platform)}
                    onDisconnect={(e) => handleDisconnect(platform, e)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
