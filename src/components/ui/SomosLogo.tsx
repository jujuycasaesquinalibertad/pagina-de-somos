import React from 'react';
import somosLogoImg from '../../assets/logo/somos_logo.png';

interface SomosLogoProps {
  variant?: 'light' | 'dark' | 'magenta';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const SomosLogo: React.FC<SomosLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const heightClasses = {
    sm: 'h-6 sm:h-7',
    md: 'h-7 sm:h-8',
    lg: 'h-10 sm:h-12',
    xl: 'h-14 sm:h-16',
  };

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <img
        src={somosLogoImg}
        alt="SOMOS - Partido Político Jujuy"
        className={`${heightClasses[size]} w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]`}
      />

      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-0.5 tracking-[0.35em] text-[9px] sm:text-[10px] font-black text-[#00AEEF] uppercase pl-0.5 drop-shadow-sm">
          <span>JUJUY</span>
        </div>
      )}
    </div>
  );
};
