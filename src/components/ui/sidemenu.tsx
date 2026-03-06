import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function SideMenu({
  className,
  title,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  
  return (
    <aside className="w-full lg:w-64 border-r border-border bg-card p-4">
      <div className="flex lg:flex-col gap-2 lg:space-y-2">
        <Button
          variant="ghost"
          className="flex-1 lg:w-full justify-start gap-2"
          onClick={() => navigate("/product/dashboard")}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t('dashboard.dashboard')}
          </span>
        </Button>
        <Button
          variant="ghost"
          className="flex-1 lg:w-full justify-start gap-2"
          onClick={() => navigate("/product/projects")}
        >
          <Radio className="h-4 w-4" />
          <span className="hidden sm:inline">{t('dashboard.streams')}</span>
        </Button>
      </div>

      <div className="mt-4 lg:mt-8 p-3 lg:p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-1">
          60 {t('dashboard.credits')}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          {t('dashboard.refreshesOn')} Nov 08, 2025
        </p>
        <Button variant="link" className="p-0 h-auto text-primary text-sm">
          {t('dashboard.upgrade')}
        </Button>
      </div>
    </aside>
  );
}

export { SideMenu };
