import React from 'react';

interface MMSCLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const MMSC_LOGO_IMAGE_PATH = '/src/assets/images/mmsc_official_logo_1790866791880.jpg';

export const MMSCLogo: React.FC<MMSCLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={MMSC_LOGO_IMAGE_PATH}
        alt="My Messiah School of Cavite Official Seal"
        className="w-full h-full object-contain rounded-full shadow-xs bg-white"
        onError={(e) => {
          // Fallback to SVG if image fails
          e.currentTarget.style.display = 'none';
          const sibling = e.currentTarget.nextElementSibling;
          if (sibling) (sibling as HTMLElement).style.display = 'block';
        }}
      />

      {/* High-Fidelity Vector Fallback matching the official MMSC Crest */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full hidden"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="98" fill="#F8FAFC" stroke="#0272B6" strokeWidth="2" />
        
        {/* Shield Outer Shape */}
        <path
          d="M 40 45 Q 100 25 160 45 L 165 95 Q 165 145 100 175 Q 35 145 35 95 Z"
          fill="#0272B6"
        />

        {/* Top Header Banner Arc */}
        <path
          d="M 38 45 Q 100 28 162 45 L 158 60 Q 100 45 42 60 Z"
          fill="#025A94"
        />
        <text
          x="100"
          y="54"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="1"
        >
          MY MESSIAH
        </text>

        {/* Shield Inner White Field */}
        <path
          d="M 44 65 Q 100 50 156 65 L 158 95 Q 158 138 100 165 Q 42 138 42 95 Z"
          fill="#FFFFFF"
          stroke="#0272B6"
          strokeWidth="1.5"
        />

        {/* Open Book in Center */}
        <g transform="translate(100, 95) scale(0.65)">
          <path
            d="M -70 10 Q -35 -5 0 5 Q 35 -5 70 10 L 70 65 Q 35 50 0 60 Q -35 50 -70 65 Z"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <path d="M 0 5 L 0 60" stroke="#1E293B" strokeWidth="2.5" />
          
          {/* Atom Rings on Left Page */}
          <ellipse cx="-35" cy="25" rx="16" ry="7" transform="rotate(-25, -35, 25)" stroke="#D97706" strokeWidth="1.2" fill="none" />
          <ellipse cx="-35" cy="25" rx="16" ry="7" transform="rotate(25, -35, 25)" stroke="#7C3AED" strokeWidth="1.2" fill="none" />
          <circle cx="-35" cy="25" r="3.5" fill="#EF4444" />
          <circle cx="-42" cy="22" r="2.5" fill="#7C3AED" />
          <circle cx="-28" cy="28" r="2.5" fill="#F59E0B" />

          {/* Compass Star on Left Page */}
          <g transform="translate(-35, 48) scale(0.6)">
            <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#D97706" />
          </g>

          {/* Dove on Right Page */}
          <g transform="translate(35, 30) scale(0.55)">
            <path
              d="M -15 10 Q -5 -10 15 -5 Q 25 -2 30 10 Q 15 15 5 12 Q 0 18 -15 10 Z"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="2"
            />
            <path d="M 0 5 Q 12 -5 20 -2" stroke="#0284C7" strokeWidth="1.5" />
          </g>
        </g>

        {/* Flaming Torch in the Center */}
        <g transform="translate(100, 95)">
          {/* Torch Handle */}
          <rect x="-3" y="10" width="6" height="38" fill="#F59E0B" rx="1.5" stroke="#B45309" strokeWidth="1" />
          <rect x="-6" y="8" width="12" height="4" fill="#D97706" rx="1" />
          {/* Flame */}
          <path
            d="M 0 -18 C -7 -10 -8 -2 0 6 C 8 -2 7 -10 0 -18 Z"
            fill="#F59E0B"
          />
          <path
            d="M 0 -14 C -4 -8 -4 -2 0 3 C 4 -2 4 -8 0 -14 Z"
            fill="#FBBF24"
          />
          <path
            d="M 0 -8 C -2 -4 -2 0 0 2 C 2 0 2 -4 0 -8 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Foundation Year: 2009 */}
        <text
          x="100"
          y="152"
          textAnchor="middle"
          fill="#0F172A"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="bold"
        >
          2009
        </text>

        {/* Laurel Leaves around shield */}
        <g stroke="#15803D" strokeWidth="1.5" fill="#22C55E">
          {/* Left Branch */}
          <path d="M 30 115 Q 25 135 45 155" fill="none" strokeWidth="2" />
          <circle cx="28" cy="118" r="3" />
          <circle cx="24" cy="128" r="3" />
          <circle cx="28" cy="138" r="3" />
          <circle cx="36" cy="148" r="3" />
          
          {/* Right Branch */}
          <path d="M 170 115 Q 175 135 155 155" fill="none" strokeWidth="2" stroke="#15803D" />
          <circle cx="172" cy="118" r="3" />
          <circle cx="176" cy="128" r="3" />
          <circle cx="172" cy="138" r="3" />
          <circle cx="164" cy="148" r="3" />
        </g>

        {/* Bottom Ribbon Banner: SCHOOL · MMSC · OF CAVITE */}
        <g transform="translate(100, 168)">
          {/* Left fold */}
          <path d="M -85 -10 L -45 -10 L -50 8 L -90 8 Z" fill="#FFFFFF" stroke="#0272B6" strokeWidth="1.5" />
          <text x="-67" y="2" textAnchor="middle" fill="#025A94" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
            SCHOOL
          </text>

          {/* Right fold */}
          <path d="M 45 -10 L 85 -10 L 90 8 L 50 8 Z" fill="#FFFFFF" stroke="#0272B6" strokeWidth="1.5" />
          <text x="67" y="2" textAnchor="middle" fill="#025A94" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
            OF CAVITE
          </text>

          {/* Center Main Plaque */}
          <path
            d="M -50 -14 L 50 -14 L 45 12 L -45 12 Z"
            fill="#FFFFFF"
            stroke="#0272B6"
            strokeWidth="2"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#025A94"
            fontFamily="Georgia, serif"
            fontSize="15"
            fontWeight="bold"
            letterSpacing="1"
          >
            MMSC
          </text>
        </g>
      </svg>
    </div>
  );
};
