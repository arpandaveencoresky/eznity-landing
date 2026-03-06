import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { SubscriptionPlan } from "@/types";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  limitations: string[];
  popular?: boolean;
  icon: typeof Crown;
  buttonText: string;
  buttonLink?: string;
  gradient: string;
}

const Subscription = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current plan from user's active plan
  const getCurrentPlanId = (): number | null => {
    if (user?.active_plan) {
      return user.active_plan.id;
    }
    return null;
  };

  // Fetch plans from API
  useEffect(() => {
    const currentPlanId = getCurrentPlanId();

    // Map API plan to component plan format
    const mapApiPlanToComponentPlan = (apiPlan: SubscriptionPlan): Plan => {
      const planName = apiPlan.name.toLowerCase();
      let icon = Zap;
      let gradient = "from-gray-500 to-gray-700";
      let features: PlanFeature[] = [];
      let limitations: string[] = [];
      let popular = false;

      // Determine plan characteristics based on name
      if (planName.includes('basic')) {
        icon = Zap;
        gradient = "from-gray-500 to-gray-700";
        features = [
          { text: "Basic templates library", included: true },
          { text: "Standard export quality", included: true },
          { text: "Community support", included: true },
        ];
        limitations = [
          "10 videos per month",
          "Max 5 minutes per video",
        ];
      } else if (planName.includes('standard')) {
        icon = Crown;
        gradient = "from-primary to-[#2d5a8a]";
        popular = true;
        features = [
          { text: "Premium templates library", included: true },
          { text: "Priority processing", included: true },
          { text: "Unlimited exports", included: true },
          { text: "Priority support", included: true },
          { text: "No watermark", included: true },
        ];
        limitations = [
          "50 videos per month",
          "Max 15 minutes per video",
        ];
      } else if (planName.includes('premium')) {
        icon = Rocket;
        gradient = "from-[#2d5a8a] to-accent";
        features = [
          { text: "All Standard features", included: true },
          { text: "Unlimited exports", included: true },
          { text: "No watermark", included: true },
          { text: "Custom branding", included: true },
          { text: "API access", included: true },
          { text: "Dedicated support team", included: true },
        ];
        limitations = [];
      }

      // Use description from API if available, otherwise use default
      const description = apiPlan.description || 
        (planName.includes('basic') ? "Perfect for getting started with basic video editing" :
         planName.includes('standard') ? "For creators who want unlimited possibilities" :
         "Ultimate plan with all premium features");

      return {
        id: apiPlan.id.toString(),
        name: apiPlan.name,
        description: description,
        price: `$${apiPlan.price}`,
        period: apiPlan.interval,
        icon,
        gradient,
        features,
        limitations,
        popular,
        buttonText: currentPlanId === apiPlan.id 
          ? t("subscription.buttons.currentPlan")
          : t("subscription.buttons.upgrade"),
        buttonLink: "#",
      };
    };

    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getSubscriptionPlans();
        
        // Filter only active plans and sort by price (ascending)
        const activePlans = response.plans
          .filter(plan => plan.active)
          .sort((a, b) => a.price - b.price)
          .map(mapApiPlanToComponentPlan);
        
        setPlans(activePlans);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load subscription plans");
        console.error("Error fetching subscription plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user, t]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center mb-3">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-[#2d5a8a] bg-clip-text text-transparent">
              {t("subscription.title")}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("subscription.description")}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("subscription.loading") || "Loading plans..."}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => {
            const Icon = plan.icon;
            const currentPlanId = getCurrentPlanId();
            const isCurrentPlan = currentPlanId?.toString() === plan.id;
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-all duration-300 hover:shadow-lg",
                  isCurrentPlan && "border-2 border-primary bg-primary/5 shadow-lg"
                )}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-white px-3 py-0.5 text-xs font-semibold shadow-lg">
                      {t("subscription.currentPlan")}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5">
                    <div
                      className={cn(
                        "p-1.5 sm:p-2 rounded-lg bg-gradient-to-br",
                        plan.gradient
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <CardTitle className="text-lg sm:text-xl">
                        {plan.name}
                      </CardTitle>
                      {plan.popular && !isCurrentPlan && (
                        <Badge 
                          className="relative bg-gradient-primary text-white px-2 py-0.5 text-xs font-semibold overflow-hidden"
                        >
                          <span className="relative z-10">{t("subscription.popular")}</span>
                          <span 
                            className="absolute inset-0 opacity-40 animate-shimmer-slide"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)',
                              width: '50%',
                            }}
                          />
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs sm:text-sm">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Pricing */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-bold">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          /{plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                      {t("subscription.featuresTitle")}
                    </h3>
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-1.5 text-xs sm:text-sm"
                        >
                          {feature.included ? (
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className="flex-1">
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t">
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li
                            key={index}
                            className="text-xs text-muted-foreground"
                          >
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4">
                  {isCurrentPlan ? (
                    <Button
                      className="w-full font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                      disabled
                    >
                      {t("subscription.buttons.currentPlan")}
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "w-full font-semibold transition-all duration-200",
                        plan.popular
                          ? "bg-gradient-primary hover:opacity-90 text-white"
                          : "bg-primary hover:bg-primary/90"
                      )}
                      onClick={() => {
                        if (plan.buttonLink && plan.buttonLink !== "#") {
                          window.open(plan.buttonLink, "_blank");
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
          </div>
        )}

        {/* FAQ or Additional Info Section */}
        {/* <div className="mt-12 sm:mt-16 lg:mt-20 max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("subscription.footer")}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Subscription;
