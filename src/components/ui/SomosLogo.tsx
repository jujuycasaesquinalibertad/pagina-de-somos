import React from 'react';

interface SomosLogoProps {
  variant?: 'light' | 'dark' | 'magenta';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const SomosLogo: React.FC<SomosLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const textColor =
    variant === 'magenta'
      ? 'text-[#EE007C]'
      : variant === 'dark'
      ? 'text-[#0C2340]'
      : 'text-white';

  const sizeClasses = {
    sm: 'text-xl tracking-wider',
    md: 'text-2xl sm:text-3xl tracking-wider',
    lg: 'text-4xl sm:text-5xl tracking-widest',
    xl: 'text-5xl sm:text-7xl tracking-widest',
  };

  const heartSize = {
    sm: 'w-5 h-5 mx-0.5',
    md: 'w-7 h-7 mx-1',
    lg: 'w-11 h-11 mx-1.5',
    xl: 'w-16 h-16 mx-2',
  };

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className={`flex items-center font-black font-montserrat ${sizeClasses[size]} ${textColor}`}>
        <span className="leading-none">S</span>
        <span className="leading-none">O</span>
        <span className="leading-none">M</span>

        {/* Isotipo Corazón Patrio Argentino (Celeste, Blanco, Sol) */}
        <div className={`inline-flex items-center justify-center shrink-0 ${heartSize[size]}`}>
          <svg
            viewBox="0 0 100 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
          >
            <defs>
              <clipPath id="heartClip">
                <path d="M50 86C50 86 6 56 6 28C6 12 18 4 32 4C41 4 47 9 50 14C53 9 59 4 68 4C82 4 94 12 94 28C94 56 50 86 50 86Z" />
              </clipPath>
            </defs>

            <g clipPath="url(#heartClip)">
              <rect x="0" y="0" width="100" height="30" fill="#00AEEF" />
              <rect x="0" y="30" width="100" height="30" fill="#FFFFFF" />
              <rect x="0" y="60" width="100" height="30" fill="#00AEEF" />

              <circle cx="50" cy="45" r="9" fill="#F8C300" stroke="#E5AC00" strokeWidth="1" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <line
                  key={i}
                  x1={50 + 10 * Math.cos((angle * Math.PI) / 180)}
                  y1={45 + 10 * Math.sin((angle * Math.PI) / 180)}
                  x2={50 + 13.5 * Math.cos((angle * Math.PI) / 180)}
                  y2={45 + 13.5 * Math.sin((angle * Math.PI) / 180)}
                  stroke="#F8C300"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ))}
            </g>
          </svg>
        </div>

        <span className="leading-none">S</span>
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-0.5 tracking-[0.3em] text-[10px] sm:text-xs font-bold text-[#00AEEF] uppercase pl-0.5">
          <span>JUJUY</span>
        </div>
      )}
    </div>
  );
};
