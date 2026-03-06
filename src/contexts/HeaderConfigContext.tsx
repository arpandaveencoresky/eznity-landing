import { createContext, useContext, useMemo, useState, useCallback, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type HeaderVariant = "dashboard" | "standard" | "minimal";

export type HeaderActions = {
  onSaveStyle?: () => void;
  onExportVideo?: () => void;
  isExporting?: boolean;
  onBack?: () => void;
};

export type HeaderUI = {
  showUpgrade?: boolean;
  showBack?: boolean;
  extraRight?: ReactNode;
};

export type HeaderConfig = {
  variant?: HeaderVariant;
  actions?: HeaderActions;
  ui?: HeaderUI;
  customButtons?: ReactNode;
};

// Route-based default configurations
const getRouteDefaults = (pathname: string): Partial<HeaderConfig> => {
  // Exact route matches
  if (pathname === "/dashboard" || pathname === "/projects") {
    return {
      variant: "dashboard",
      ui: { showUpgrade: true },
    };
  }

  if (pathname === "/upload" || pathname === "/profile" || pathname === "/change-password" || pathname === "/settings" || pathname === "/subscription") {
    return {
      variant: "standard",
      ui: { showUpgrade: false },
    };
  }

  // Pattern matches
  if (pathname.startsWith("/editor")) {
    return {
      variant: "dashboard",
      ui: { showUpgrade: false },
    };
  }

  if (pathname.startsWith("/reel/")) {
    return {
      variant: "dashboard",
      ui: { showUpgrade: true },
    };
  }

  if (pathname.startsWith("/project/") && pathname.includes("/reels")) {
    return {
      variant: "dashboard",
      ui: { showUpgrade: true },
    };
  }

  if (pathname === "/videos") {
    return {
      variant: "dashboard",
      ui: { showUpgrade: true },
    };
  }

  // Default fallback
  return {
    variant: "standard",
    ui: { showUpgrade: false },
  };
};

type HeaderConfigContextValue = {
  config: HeaderConfig;
  setHeaderConfig: (config: Partial<HeaderConfig>) => void;
};

const HeaderConfigContext = createContext<HeaderConfigContextValue>({
  config: { variant: "standard" },
  setHeaderConfig: () => {},
});

export const HeaderConfigProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [config, setConfigState] = useState<HeaderConfig>({ variant: "standard" });

  // Get route-based defaults
  const routeDefaults = useMemo(() => getRouteDefaults(location.pathname), [location.pathname]);

  // Auto-set route defaults on route change (reset everything, components will set actions if needed)
  useEffect(() => {
    setConfigState({
      ...routeDefaults,
      actions: undefined,
      customButtons: undefined,
    });
  }, [location.pathname, routeDefaults]);

  // Component override method - merges with route defaults
  const setHeaderConfig = useCallback((override: Partial<HeaderConfig>) => {
    setConfigState((prev) => {
      // Start with route defaults
      const base = getRouteDefaults(location.pathname);
      
      return {
        ...base,
        ...prev,
        ...override,
        // Full replacement (not merge) for nested objects and customButtons
        actions: override.actions !== undefined ? override.actions : prev.actions,
        ui: override.ui !== undefined ? override.ui : prev.ui,
        customButtons: override.customButtons !== undefined ? override.customButtons : prev.customButtons,
      };
    });
  }, [location.pathname]);

  const value = useMemo(
    () => ({
      config,
      setHeaderConfig,
    }),
    [config, setHeaderConfig],
  );

  return <HeaderConfigContext.Provider value={value}>{children}</HeaderConfigContext.Provider>;
};

export const useHeaderConfig = () => useContext(HeaderConfigContext);


