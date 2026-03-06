import { Button } from "@/components/ui/button";
import { DeviceType } from "@/hooks/use-device";
import { responsiveSizing } from "@/utils/responsive";

interface EditorSidebarProps {
  menuItems: Array<{ id: string; icon: React.ComponentType<{ className?: string }> }>;
  activePanel: string;
  onPanelChange: (panelId: string) => void;
  deviceType: DeviceType;
  isTablet: boolean;
}

export const EditorSidebar = ({
  menuItems,
  activePanel,
  onPanelChange,
  deviceType,
  isTablet,
}: EditorSidebarProps) => {
  const sidebarWidth = isTablet 
    ? responsiveSizing.sidebar.width.tablet 
    : responsiveSizing.sidebar.width.desktop;
  
  const buttonSize = isTablet
    ? responsiveSizing.sidebar.button.tablet
    : responsiveSizing.sidebar.button.desktop;
  
  const iconSize = isTablet
    ? responsiveSizing.sidebar.icon.tablet
    : responsiveSizing.sidebar.icon.desktop;

  return (
    <aside 
      className={`hidden md:flex ${sidebarWidth} border-r border-border bg-card flex-col items-center justify-start py-4 gap-2 fixed left-0 z-50`}
      style={{ top: '80px', height: 'calc(100vh - 80px)' }}
    >
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-lg ${
            activePanel === item.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onPanelChange(item.id)}
        >
          <item.icon className={iconSize} />
        </Button>
      ))}
    </aside>
  );
};

