'use client';

export default function DonFanLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizes[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle - represents community */}
        <circle cx="50" cy="50" r="48" fill="#10B981" opacity="0.1"/>
        <circle cx="50" cy="50" r="48" stroke="#10B981" strokeWidth="2"/>
        
        {/* Heart shape - represents donation/charity */}
        <path
          d="M50 70 C50 70, 30 55, 30 42 C30 35, 35 30, 42 30 C46 30, 48 32, 50 35 C52 32, 54 30, 58 30 C65 30, 70 35, 70 42 C70 55, 50 70, 50 70 Z"
          fill="#10B981"
        />
        
        {/* Hand giving - represents support */}
        <path
          d="M35 45 L40 40 L40 50 L35 50 Z"
          fill="#059669"
          opacity="0.8"
        />
        <path
          d="M65 45 L60 40 L60 50 L65 50 Z"
          fill="#059669"
          opacity="0.8"
        />
        
        {/* Sparkle effect - represents impact */}
        <circle cx="35" cy="30" r="2" fill="#34D399"/>
        <circle cx="65" cy="30" r="2" fill="#34D399"/>
        <circle cx="50" cy="25" r="2" fill="#34D399"/>
      </svg>
    </div>
  );
}
