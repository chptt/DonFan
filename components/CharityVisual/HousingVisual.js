'use client';
import { motion } from 'framer-motion';

export default function HousingVisual({ progressPercentage }) {
  // Much lower thresholds - each milestone at ~0.02% intervals
  const showFoundation = progressPercentage >= 0.02;
  const showWalls = progressPercentage >= 0.04;
  const showRoof = progressPercentage >= 0.06;
  const showDetails = progressPercentage >= 0.08;
  const showLights = progressPercentage >= 0.10;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* Sky with gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#87CEEB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#E0F2FE', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#86EFAC', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#4ADE80', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Sky */}
      <rect width="400" height="400" fill="url(#skyGradient)" />
      
      {/* Sun */}
      <circle cx="320" cy="80" r="35" fill="#FCD34D" opacity="0.8" />
      <circle cx="320" cy="80" r="40" fill="#FCD34D" opacity="0.3" />
      
      {/* Clouds */}
      <ellipse cx="100" cy="60" rx="30" ry="15" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="120" cy="55" rx="35" ry="18" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="140" cy="60" rx="25" ry="12" fill="#FFFFFF" opacity="0.7" />
      
      {/* Ground with grass */}
      <rect y="280" width="400" height="120" fill="url(#grassGradient)" />
      
      {/* Grass details */}
      {[...Array(20)].map((_, i) => (
        <line
          key={i}
          x1={20 + i * 20}
          y1="280"
          x2={20 + i * 20}
          y2="290"
          stroke="#22C55E"
          strokeWidth="2"
          opacity="0.5"
        />
      ))}
      
      {/* Foundation - concrete base */}
      {showFoundation && (
        <motion.g
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: 'bottom' }}
        >
          <rect x="90" y="270" width="220" height="15" fill="#9CA3AF" />
          <rect x="90" y="270" width="220" height="3" fill="#6B7280" />
        </motion.g>
      )}
      
      {/* Walls - brick texture */}
      {showWalls && (
        <motion.g
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6 }}
          style={{ transformOrigin: 'bottom' }}
        >
          {/* Main wall */}
          <rect x="90" y="160" width="220" height="110" fill="#DC2626" />
          
          {/* Brick pattern */}
          {[...Array(8)].map((_, row) => (
            <g key={row}>
              {[...Array(6)].map((_, col) => (
                <rect
                  key={col}
                  x={95 + col * 35 + (row % 2 === 0 ? 0 : -17)}
                  y={165 + row * 13}
                  width="32"
                  height="12"
                  fill="none"
                  stroke="#B91C1C"
                  strokeWidth="1"
                />
              ))}
            </g>
          ))}
        </motion.g>
      )}
      
      {/* Roof - realistic shingles */}
      {showRoof && (
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main roof */}
          <polygon points="200,100 70,160 330,160" fill="#7C2D12" />
          
          {/* Roof shingles */}
          {[...Array(4)].map((_, row) => (
            <g key={row}>
              {[...Array(10)].map((_, col) => (
                <rect
                  key={col}
                  x={80 + col * 24 - row * 12}
                  y={120 + row * 10}
                  width="22"
                  height="8"
                  fill="#92400E"
                  opacity="0.8"
                />
              ))}
            </g>
          ))}
          
          {/* Roof edge */}
          <polygon points="200,100 70,160 330,160" fill="none" stroke="#78350F" strokeWidth="2" />
        </motion.g>
      )}
      
      {/* Door and Windows */}
      {showDetails && (
        <>
          {/* Door */}
          <motion.g
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4 }}
            style={{ transformOrigin: 'bottom' }}
          >
            <rect x="170" y="210" width="60" height="60" fill="#78350F" rx="3" />
            {/* Door panels */}
            <rect x="175" y="215" width="25" height="25" fill="none" stroke="#92400E" strokeWidth="2" />
            <rect x="175" y="242" width="25" height="25" fill="none" stroke="#92400E" strokeWidth="2" />
            <rect x="205" y="215" width="25" height="25" fill="none" stroke="#92400E" strokeWidth="2" />
            <rect x="205" y="242" width="25" height="25" fill="none" stroke="#92400E" strokeWidth="2" />
            {/* Door knob */}
            <circle cx="220" cy="245" r="3" fill="#FCD34D" />
          </motion.g>
          
          {/* Left Window */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ transformOrigin: 'center' }}
          >
            <rect x="110" y="190" width="45" height="50" fill="#93C5FD" rx="2" />
            {/* Window frame */}
            <rect x="110" y="190" width="45" height="50" fill="none" stroke="#1E3A8A" strokeWidth="3" />
            {/* Window panes */}
            <line x1="132" y1="190" x2="132" y2="240" stroke="#1E3A8A" strokeWidth="2" />
            <line x1="110" y1="215" x2="155" y2="215" stroke="#1E3A8A" strokeWidth="2" />
            {/* Window reflection */}
            <rect x="115" y="195" width="15" height="15" fill="#FFFFFF" opacity="0.4" />
          </motion.g>
          
          {/* Right Window */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{ transformOrigin: 'center' }}
          >
            <rect x="245" y="190" width="45" height="50" fill="#93C5FD" rx="2" />
            {/* Window frame */}
            <rect x="245" y="190" width="45" height="50" fill="none" stroke="#1E3A8A" strokeWidth="3" />
            {/* Window panes */}
            <line x1="267" y1="190" x2="267" y2="240" stroke="#1E3A8A" strokeWidth="2" />
            <line x1="245" y1="215" x2="290" y2="215" stroke="#1E3A8A" strokeWidth="2" />
            {/* Window reflection */}
            <rect x="250" y="195" width="15" height="15" fill="#FFFFFF" opacity="0.4" />
          </motion.g>
          
          {/* Chimney */}
          <motion.g
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <rect x="250" y="110" width="25" height="50" fill="#7C2D12" />
            <rect x="247" y="107" width="31" height="6" fill="#92400E" />
          </motion.g>
        </>
      )}
      
      {/* Lights Glow - warm evening lighting */}
      {showLights && (
        <>
          {/* Window lights */}
          <motion.rect
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            x="110" y="190" width="45" height="50"
            fill="#FCD34D"
            opacity="0.6"
          />
          <motion.rect
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            x="245" y="190" width="45" height="50"
            fill="#FCD34D"
            opacity="0.6"
          />
          
          {/* Chimney smoke */}
          {[0, 1, 2].map((i) => (
            <motion.ellipse
              key={i}
              cx={262}
              cy={100}
              rx="8"
              ry="12"
              fill="#D1D5DB"
              opacity="0.5"
              animate={{
                y: [-10, -40],
                opacity: [0.5, 0],
                scale: [1, 1.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1
              }}
            />
          ))}
        </>
      )}
      
      {/* Small bushes in front */}
      {showDetails && (
        <>
          <ellipse cx="70" cy="275" rx="20" ry="15" fill="#22C55E" />
          <ellipse cx="330" cy="275" rx="20" ry="15" fill="#22C55E" />
        </>
      )}
    </svg>
  );
}
