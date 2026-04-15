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

const EznityLogo: React.FC<EznityLogoProps> = ({
  className,
  variant = 'stacked',
  height = 48,
  color = 'currentColor',
}) => {
  if (variant === 'inline') {
    // Horizontal layout: [!icon] EZN!TY — compact for navbars
    const h = height;
    const iconW = h * 0.45;            // icon is narrower
    const gap = h * 0.15;
    const fontSize = h * 0.62;
    const totalW = iconW + gap + fontSize * 3.6; // rough text width

    return (
      <svg
        viewBox={`0 0 ${totalW} ${h}`}
        height={h}
        width={totalW}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="EZNITY"
        role="img"
      >
        {/* ! icon */}
        <rect
          x={(iconW - iconW * 0.55) / 2}
          y={h * 0.04}
          width={iconW * 0.55}
          height={h * 0.58}
          rx={iconW * 0.1}
          fill={color}
        />
        <circle
          cx={iconW / 2}
          cy={h * 0.87}
          r={iconW * 0.24}
          fill={color}
        />

        {/* EZN!TY text */}
        <text
          x={iconW + gap}
          y={h * 0.80}
          fontFamily="Impact, 'Arial Black', 'Haettenschweiler', sans-serif"
          fontSize={fontSize}
          fontWeight="900"
          letterSpacing="-0.03em"
          fill={color}
        >
          EZN!TY
        </text>
      </svg>
    );
  }

  // Stacked / vertical — matches provided logo design exactly
  return (
    <svg
      viewBox="0 0 280 520"
      height={height}
      width={(height / 520) * 280}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EZNITY"
      role="img"
    >
      {/* EZN! */}
      <text
        x="140"
        y="88"
        textAnchor="middle"
        fontFamily="Impact, 'Arial Black', 'Haettenschweiler', sans-serif"
        fontSize="80"
        fontWeight="900"
        letterSpacing="-1"
        fill={color}
      >EZN!</text>

      {/* ! body */}
      <rect x="104" y="108" width="72" height="228" rx="10" fill={color} />
      {/* ! dot */}
      <circle cx="140" cy="390" r="40" fill={color} />

      {/* TY */}
      <text
        x="140"
        y="490"
        textAnchor="middle"
        fontFamily="Impact, 'Arial Black', 'Haettenschweiler', sans-serif"
        fontSize="80"
        fontWeight="900"
        letterSpacing="-1"
        fill={color}
      >TY</text>
    </svg>
  );
};

export default EznityLogo;
