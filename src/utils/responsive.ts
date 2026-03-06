/**
 * Responsive utility functions for cleaner conditional styling
 */

export interface ResponsiveClasses {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  base?: string;
}

/**
 * Returns the appropriate class based on device type
 */
export const getResponsiveClass = (
  classes: ResponsiveClasses,
  deviceType: 'mobile' | 'tablet' | 'desktop'
): string => {
  const deviceClass = classes[deviceType] || classes.base || '';
  const baseClass = classes.base || '';
  
  return `${baseClass} ${deviceClass}`.trim();
};

/**
 * Responsive spacing utilities
 */
export const responsiveSpacing = {
  padding: {
    tablet: 'p-3',
    desktop: 'p-3 lg:p-4',
  },
  margin: {
    sidebar: {
      tablet: '48px',
      desktop: '64px',
    },
    leftPanel: {
      tablet: '256px',
      desktop: '288px',
    },
  },
};

/**
 * Responsive sizing utilities
 */
export const responsiveSizing = {
  sidebar: {
    width: {
      tablet: 'w-12',
      desktop: 'lg:w-16',
    },
    button: {
      tablet: 'w-10 h-10',
      desktop: 'w-12 h-12',
    },
    icon: {
      tablet: 'h-4 w-4',
      desktop: 'h-5 w-5',
    },
  },
  leftPanel: {
    width: {
      tablet: 'w-64',
      desktop: 'lg:w-72',
    },
    left: {
      tablet: 'left-12',
      desktop: 'lg:left-16',
    },
  },
  text: {
    heading: {
      tablet: 'text-sm',
      desktop: 'text-sm lg:text-base',
    },
    body: {
      tablet: 'text-xs',
      desktop: 'text-xs lg:text-sm',
    },
  },
};

/**
 * Get responsive class for a specific property
 */
export const getResponsiveValue = <T>(
  values: { tablet: T; desktop: T },
  deviceType: 'tablet' | 'desktop'
): T => {
  return values[deviceType];
};

