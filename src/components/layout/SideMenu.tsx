// Enhanced SideMenu component with active route detection and flexibility

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LucideIcon, LayoutDashboard, Radio, Sparkles, Crown, ArrowRight } from "lucide-react";

export interface MenuItem {
  id: string;
  labelKey: string; // Translation key instead of label
  icon: LucideIcon;
  path: string;
}

// Default menu items for dashboard/projects pages
export const defaultMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    labelKey: "dashboard.dashboard",
    icon: LayoutDashboard,
    path: "/product/dashboard",
  },
  {
    id: "streams",
    labelKey: "dashboard.streams",
    icon: Radio,
    path: "/product/projects",
  },
];

interface SideMenuProps {
  className?: string;
  menuItems?: MenuItem[];
  showUpgradeCard?: boolean;
}

export const SideMenu = ({
  className,
  menuItems = defaultMenuItems,
  showUpgradeCard = true,
}: SideMenuProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className={cn("w-full lg:w-64 border-r border-border bg-card p-2 sm:p-3 lg:p-4 flex-shrink-0 flex flex-col lg:block overflow-y-auto", className)}>
      <div className="flex lg:flex-col gap-2 flex-shrink-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Button
              key={item.id}
              variant={active ? "secondary" : "ghost"}
              className={cn(
                "flex-1 lg:w-full justify-start gap-2",
                active && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{t(item.labelKey)}</span>
            </Button>
          );
        })}
      </div>

      {/* Pro Subscription Card */}
      {showUpgradeCard && (
        <div className="hidden md:block mt-2 lg:mt-8 p-2 sm:p-3 lg:p-4 rounded-lg lg:rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 relative overflow-hidden group/upgrade flex-shrink-0">
          {/* Decorative sparkles */}
          <div className="absolute top-1 right-1 lg:top-2 lg:right-2 opacity-60">
            <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 text-accent animate-pulse" />
          </div>
          <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 opacity-40">
            <Sparkles className="h-2 w-2 lg:h-3 lg:w-3 text-accent/70" />
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
            <Crown className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-accent group-hover/upgrade:text-white transition-colors flex-shrink-0" />
            <span className="font-bold text-xs lg:text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              Go Pro
            </span>
          </div>

          <p className="text-[10px] lg:text-xs text-muted-foreground mb-2 lg:mb-3 leading-relaxed line-clamp-2 lg:line-clamp-none">
            Unlock unlimited reels, premium templates & priority processing
          </p>

          <Button
            size="sm"
            className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium group text-xs lg:text-sm h-7 lg:h-9"
            onClick={() => navigate('/product/subscription')}
          >
            <span className="truncate">{t("sideMenu.upgradeNow")}</span>
            <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </Button>
        </div>
      )}
    </aside>
  );
};

export default SideMenu;

