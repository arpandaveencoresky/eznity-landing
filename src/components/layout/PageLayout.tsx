// PageLayout - Route-based layout with Header only (no sidebar)
// Used as a layout route wrapper in App.tsx for pages like Profile, Settings, Upload
// Header config is automatically set by route-based defaults in HeaderConfigContext

import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { HeaderConfigProvider } from "@/contexts/HeaderConfigContext";

export const PageLayout = () => {
  return (
    <HeaderConfigProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <Outlet />
      </div>
    </HeaderConfigProvider>
  );
};

export default PageLayout;
