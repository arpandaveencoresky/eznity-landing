// DashboardLayout - Route-based layout with Header + Sidebar
// Used as a layout route wrapper in App.tsx for dashboard pages
// Header config is automatically set by route-based defaults in HeaderConfigContext

import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { SideMenu, MenuItem, defaultMenuItems } from "./SideMenu";
import { HeaderConfigProvider } from "@/contexts/HeaderConfigContext";

interface DashboardLayoutProps {
  menuItems?: MenuItem[];
  showSidebar?: boolean;
  showUpgradeCard?: boolean;
}

export const DashboardLayout = ({
  menuItems = defaultMenuItems,
  showSidebar = true,
  showUpgradeCard = true,
}: DashboardLayoutProps = {}) => {
  return (
    <HeaderConfigProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <AppHeader />

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Sidebar - Fixed, non-scrollable */}
          {showSidebar && (
            <SideMenu 
              menuItems={menuItems} 
              showUpgradeCard={showUpgradeCard} 
            />
          )}

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </HeaderConfigProvider>
  );
};

// Layout without sidebar (for pages like ProjectReels)
export const DashboardLayoutNoSidebar = () => {
  return (
    <HeaderConfigProvider>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </HeaderConfigProvider>
  );
};

export default DashboardLayout;
