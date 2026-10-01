import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function GoldScissorsIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf3cd" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8d6b15" />
        </linearGradient>
        <filter id="goldDropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      <g filter="url(#goldDropShadow)">
        {/* Left blade */}
        <path
          d="M12 36C15.3137 36 18 33.3137 18 30C18 27.5 16.5 25.4 14.3 24.5L25 18L38 8C38.5 7.6 39 8.2 38.6 8.7L27 21L36 34C37 35.5 35.5 37 34 36L23 27L16.2 33.7C15.4 35.1 13.8 36 12 36ZM12 33C10.3431 33 9 31.6569 9 30C9 28.3431 10.3431 27 12 27C13.6569 27 15 28.3431 15 30C15 31.6569 13.6569 33 12 33Z"
          fill="url(#goldSheen)"
        />
        {/* Pivot pin */}
        <circle cx="24.5" cy="22.5" r="2.5" fill="#fdf3cd" stroke="#8d6b15" strokeWidth="1" />
      </g>
    </svg>
  );
}

export function GoldRazorIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="razorBlade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#75560a" />
        </linearGradient>
        <linearGradient id="razorHandle" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a30" />
          <stop offset="50%" stopColor="#121216" />
          <stop offset="100%" stopColor="#08080a" />
        </linearGradient>
      </defs>
      {/* Handle */}
      <path
        d="M8 38C7 36 10 24 16 18C18 16 20 17 19 19C15 24 12 34 13 37C13.5 38.5 9 40 8 38Z"
        fill="url(#razorHandle)"
        stroke="#d4af37"
        strokeWidth="1.5"
      />
      {/* Pivot */}
      <circle cx="17.5" cy="18.5" r="2.5" fill="#d4af37" stroke="#000" strokeWidth="0.8" />
      {/* Straight Razor Blade */}
      <path
        d="M17.5 18.5L34 8C36 6.8 38.5 7.5 39.5 9.5C40.2 11 39.8 12.8 38.5 13.8L23 23L17.5 18.5Z"
        fill="url(#razorBlade)"
        stroke="#aa820a"
        strokeWidth="1"
      />
      {/* Hollow Ground Notch */}
      <line x1="20" y1="19" x2="35" y2="10" stroke="#fdf3cd" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function GoldClipperIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="clipperGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf3cd" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#6e4f0a" />
        </linearGradient>
      </defs>
      {/* Clipper Teeth */}
      <path d="M18 8H30V12H18V8Z" fill="url(#clipperGold)" />
      <line x1="20" y1="8" x2="20" y2="12" stroke="#121216" strokeWidth="1" />
      <line x1="22" y1="8" x2="22" y2="12" stroke="#121216" strokeWidth="1" />
      <line x1="24" y1="8" x2="24" y2="12" stroke="#121216" strokeWidth="1" />
      <line x1="26" y1="8" x2="26" y2="12" stroke="#121216" strokeWidth="1" />
      <line x1="28" y1="8" x2="28" y2="12" stroke="#121216" strokeWidth="1" />
      {/* Clipper Body */}
      <path
        d="M17 12C15 16 16 26 18 36C18.5 38.5 20.5 40 23 40H25C27.5 40 29.5 38.5 30 36C32 26 33 16 31 12H17Z"
        fill="#18181e"
        stroke="url(#clipperGold)"
        strokeWidth="2"
      />
      {/* Gold Trim Accent / Switch */}
      <rect x="21" y="24" width="6" height="8" rx="2" fill="url(#clipperGold)" />
      <circle cx="24" cy="18" r="1.5" fill="#fdf3cd" />
    </svg>
  );
}

export function GoldCombIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="combGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef6dc" />
          <stop offset="60%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8d6b15" />
        </linearGradient>
      </defs>
      {/* Comb spine */}
      <rect x="8" y="14" width="32" height="6" rx="2" fill="url(#combGrad)" />
      {/* Comb teeth */}
      {[10, 13, 16, 19, 22, 25, 28, 31, 34, 37].map((x) => (
        <line
          key={x}
          x1={x}
          y1="20"
          x2={x}
          y2="32"
          stroke="url(#combGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function GoldBeardIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="beardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fae7b5" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#7d5d0f" />
        </linearGradient>
      </defs>
      {/* Mustache */}
      <path
        d="M24 16C21 13 14 14 10 18C12 21 19 21 23 18C23.5 17.5 24.5 17.5 25 18C29 21 36 21 38 18C34 14 27 13 24 16Z"
        fill="url(#beardGrad)"
      />
      {/* Sculpted Beard */}
      <path
        d="M12 24C12 32 17 38 24 40C31 38 36 32 36 24C34 26 31 27 28 27C27 27 26 26.5 24 28C22 26.5 21 27 20 27C17 27 14 26 12 24Z"
        fill="url(#beardGrad)"
        fillOpacity="0.9"
        stroke="#d4af37"
        strokeWidth="1"
      />
    </svg>
  );
}

export function GoldHairComboIcon({ className = '', size = 28 }: IconProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <GoldScissorsIcon size={size} className="transform -rotate-12 translate-x-1" />
      <GoldBeardIcon size={Math.round(size * 0.8)} className="absolute -bottom-1 -right-1" />
    </div>
  );
}

export function GoldEyebrowIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="browGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef3d1" />
          <stop offset="60%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8d6b15" />
        </linearGradient>
      </defs>
      {/* Sharply contoured eyebrow arch */}
      <path
        d="M8 26C14 21 24 17 32 18C37 18.5 41 21 42 22C39 23 35 22.5 31 22C23 21 15 24 8 26Z"
        fill="url(#browGrad)"
      />
      <circle cx="38" cy="28" r="1.5" fill="#d4af37" />
      <circle cx="42" cy="29" r="1" fill="#fdf3cd" />
    </svg>
  );
}

export function GoldColorBrushIcon({ className = '', size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="brushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#7a5a0c" />
        </linearGradient>
      </defs>
      {/* Brush Bristles */}
      <path d="M28 8L38 18L33 23L23 13L28 8Z" fill="url(#brushGrad)" />
      {/* Ferrule */}
      <path d="M23 13L33 23L29 27L19 17L23 13Z" fill="#18181e" stroke="#d4af37" strokeWidth="1.5" />
      {/* Handle */}
      <path d="M19 17L29 27L13 41C11.5 42.5 9 42.5 7.5 41C6 39.5 6 37 7.5 35.5L19 17Z" fill="url(#brushGrad)" />
    </svg>
  );
}

export function RodrigoEmblemLogo({ size = 88 }: { size?: number }) {
  return (
    <div className="relative inline-flex items-center justify-center p-1 rounded-full group cursor-pointer">
      {/* Outer Golden Halo Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#997316] via-[#d4af37] to-[#fce096] opacity-30 blur-md group-hover:opacity-60 transition duration-700"></div>

      {/* Outer Rim */}
      <div 
        style={{ width: size, height: size }}
        className="relative rounded-full p-[2px] bg-gradient-to-b from-[#fce096] via-[#d4af37] to-[#594208] shadow-2xl flex items-center justify-center"
      >
        {/* Inner Black Disk */}
        <div className="w-full h-full rounded-full bg-[#0d0d12] flex flex-col items-center justify-center relative overflow-hidden border border-[#26262e]">
          {/* Subtle Sunray Pattern in Background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37] via-transparent to-transparent"></div>

          {/* Golden Crossed Barber Tools in Center */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="font-luxury font-bold text-xs tracking-widest text-[#f5deb3]/80 uppercase">
              RB
            </span>
            <div className="my-0.5">
              <GoldScissorsIcon size={size * 0.38} />
            </div>
            <span className="text-[8px] font-semibold tracking-[0.2em] text-[#d4af37] uppercase">
              PROFISSIONAL
            </span>
          </div>

          {/* Fine Golden Beaded Edge */}
          <div className="absolute inset-1 rounded-full border border-[#d4af37]/25 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
