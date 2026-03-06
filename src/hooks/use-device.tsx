import * as React from "react";

const BREAKPOINTS = {
  mobile: 768,   // md - matches Tailwind's md breakpoint
  tablet: 1024,  // lg - matches Tailwind's lg breakpoint
  desktop: 1280, // xl - matches Tailwind's xl breakpoint
};

export type DeviceType = "mobile" | "tablet" | "desktop";

export function useDevice() {
  const [deviceType, setDeviceType] = React.useState<DeviceType>("desktop");

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setDeviceType("mobile");
      } else if (width < BREAKPOINTS.tablet) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    // Set initial value
    updateDeviceType();

    // Listen for resize events
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.desktop - 1}px)`);
    const handleResize = () => {
      updateDeviceType();
    };

    window.addEventListener("resize", handleResize);
    mql.addEventListener("change", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mql.removeEventListener("change", handleResize);
    };
  }, []);

  return {
    deviceType,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
  };
}

