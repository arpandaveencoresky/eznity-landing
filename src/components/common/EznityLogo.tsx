import React from 'react';

interface EznityLogoProps {
  className?: string;
  /** 'stacked' = vertical logo (default, matches provided design)
   *  'inline'  = horizontal compact logo for navbars/headers */
  variant?: 'stacked' | 'inline';
  /** Height of the logo in px — width scales automatically */
  height?: number;
  /** Fill color for all logo elements */
  color?: string;
}

const EznityLogo: React.FC<EznityLogoProps> = () => {
  return (
    <svg width="84" height="50" viewBox="0 0 520 113" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M75.8018 19.6094H23.7842V46.415H71.9023V66.0244H23.7842V92.8848H76.0215V112.494H0V0H75.8018V19.6094ZM173.335 14.1162L117.143 92.8848H173.444V112.494H87.3154V98.3779L143.453 19.6094H87.2061V0H173.335V14.1162ZM254.938 70.748H255.927V0H279.601V112.494H259.058L210.116 41.6904H209.292V112.494H185.508V0H206.381L254.938 70.748ZM304.682 100.247C307.93 100.247 311.046 101.537 313.343 103.834C315.639 106.131 316.93 109.246 316.93 112.494H292.435C292.435 109.246 293.725 106.131 296.021 103.834C298.318 101.537 301.434 100.247 304.682 100.247ZM413.479 19.6094H384.532V112.494H361.022V19.6094H326.582V0H402.423L413.479 19.6094ZM466.609 48.4473H467.708L493.359 0H520L478.968 72.7256V112.494H455.349V72.7256L438.893 43.5586L438.905 43.5518L414.349 0H440.957L466.609 48.4473ZM316.849 88.5586H293.064V0H316.849V88.5586Z" fill="white" />
    </svg>

  );
};

export default EznityLogo;
