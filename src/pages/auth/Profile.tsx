// Profile page component

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Settings as SettingsIcon, Crown, ArrowUpRight, X, Check } from 'lucide-react';
import { getUserInitials } from '@/utils/authHelpers';
import subscriptionPlansData from '@/data/subscriptionPlans.json';
import { LiveIndicator } from '@/components/common/LiveIndicator';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLive } = useAuth();

  // Get current plan details from static data
  const getCurrentPlanDetails = () => {
    if (!user?.active_plan) return null;
    return subscriptionPlansData.plans.find(
      (plan) => plan.name.toLowerCase() === user.active_plan?.name.toLowerCase()
    );
  };

  const currentPlanDetails = getCurrentPlanDetails();
  const hasActivePlan = !!user?.active_plan;

  const handleUpdatePlan = () => {
    navigate('/product/subscription');
  };

  const handleCancelSubscription = () => {
    // TODO: Implement cancel subscription logic
    console.log('Cancel subscription');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Profile Information Card */}
        <Card className="lg:w-auto lg:flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t("profile.profileInformation")}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t("profile.accountDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 overflow-visible p-6 sm:p-8">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="relative overflow-visible" style={{ zIndex: 1 }}>
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                  {isLive && (
                    <>
                      <div className="live-avatar-wave" />
                      <div className="live-avatar-wave" />
                      <div className="live-avatar-wave" />
                    </>
                  )}
                  <Avatar className={cn(
                    "h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 border-2 relative z-10",
                    isLive ? "border-red-500 live-avatar-border" : "border-transparent"
                  )}>
                    <AvatarFallback className="text-base sm:text-lg lg:text-xl bg-primary text-primary-foreground">
                      {getUserInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {isLive && <LiveIndicator isLive={isLive} size="md" />}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                  {user?.name || t("profile.user")}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">{t("profile.name")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {user?.name || t("profile.notSet")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">{t("profile.email")}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Account Actions + Subscription */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-1">
          {/* Account Actions Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">{t("profile.accountActions")}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t("profile.manageAccountSettings")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-sm sm:text-base"
                onClick={() => navigate('/product/settings')}
              >
                <SettingsIcon className="h-4 w-4" />
                {t("profile.settings")}
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          {!hasActivePlan ? (
            // No active plan - Show upgrade block
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-primary flex-shrink-0">
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg">{t("profile.subscription.noPlan.title")}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{t("profile.subscription.noPlan.description")}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("profile.subscription.noPlan.benefits")}
                </p>
                <ul className="space-y-1.5 sm:space-y-2">
                  {subscriptionPlansData.plans
                    .filter((plan) => plan.id !== 'free')
                    .slice(0, 3)
                    .map((plan) => (
                      <li key={plan.id} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{plan.features[0]}</span>
                      </li>
                    ))}
                </ul>
                <Button
                  className="w-full bg-gradient-primary hover:opacity-90 text-sm sm:text-base"
                  onClick={() => navigate('/product/subscription')}
                >
                  {t("profile.subscription.noPlan.upgradeButton")}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Has active plan - Show plan details
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-primary flex-shrink-0">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg">{t("profile.subscription.activePlan.title")}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {t("profile.subscription.activePlan.description")}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-primary text-xs sm:text-sm w-fit">
                    {user.active_plan.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4 sm:space-y-6">
                {/* Plan Details */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">{user.active_plan.name}</h3>
                    <p className="text-xl sm:text-2xl font-bold">
                      ${user.active_plan.price}
                      <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                        /{user.active_plan.interval}
                      </span>
                    </p>
                  </div>

                  {/* Plan Dates */}
                  <div className="pt-3 sm:pt-4 border-t space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {t("profile.subscription.activePlan.startDate")}:
                      </span>
                      <span className="ml-auto">
                        {new Date(user.active_plan.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        {t("profile.subscription.activePlan.endDate")}:
                      </span>
                      <span className="ml-auto">
                        {new Date(user.active_plan.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                  <Button
                    variant="default"
                    className="w-full text-sm sm:text-base"
                    onClick={handleUpdatePlan}
                  >
                    {t("profile.subscription.activePlan.updatePlanButton")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-sm sm:text-base"
                    onClick={handleCancelSubscription}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t("profile.subscription.activePlan.cancelButton")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
