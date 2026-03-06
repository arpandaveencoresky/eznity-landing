import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { AuthLayout } from "@/components/auth/AuthLayout";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    logger.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-foreground">{t('notFound.title')}</h1>
        <p className="mb-6 text-xl sm:text-2xl text-muted-foreground">{t('notFound.description')}</p>
        <Button asChild variant="default">
          <Link to="/product/">{t('notFound.returnHome')}</Link>
        </Button>
      </div>
    </AuthLayout>
  );
};

export default NotFound;
