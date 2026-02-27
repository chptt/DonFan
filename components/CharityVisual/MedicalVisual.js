'use client';
import { motion } from 'framer-motion';

export default function MedicalVisual({ progressPercentage }) {
  // Much lower thresholds - each milestone at ~0.025% intervals
  const showBuilding = progressPercentage >= 0.025;
  const showStructure = progressPercentage >= 0.05;
  const showCross = progressPercentage >= 0.075;
  const showAmbulance = progressPercentage >= 0.075;
  const showGlow = progressPercentage >= 0.10;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* Sky */}
      <rect width="400" height="400" fill="#DBEAFE" />
      
      {/* Ground */}
      <rect y="320" width="400" height="80" fill="#D1D5DB" />
      
      {/* Base Building */}
      {showBuilding && (
        <motion.rect
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6 }}
          x="120" y="200" width="160" height="120"
          fill="#F3F4F6"
          style={{ transformOrigin: 'bottom' }}
        />
      )}
      
      {/* Hospital Structure */}
      {showStructure && (
        <>
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5 }}
            x="140" y="160" width="120" height="40"
            fill="#E5E7EB"
            style={{ transformOrigin: 'bottom' }}
          />
          {/* Windows */}
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <motion.rect
                key={`${row}-${col}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + (row * 3 + col) * 0.1 }}
                x={145 + col * 35}
                y={220 + row * 30}
                width="20"
                height="20"
                fill="#93C5FD"
              />
            ))
          )}
        </>
      )}
      
      {/* Red Cross */}
      {showCross && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <rect x="190" y="165" width="20" height="30" fill="#DC2626" />
          <rect x="185" y="175" width="30" height="20" fill="#DC2626" />
        </motion.g>
      )}
      
      {/* Ambulance */}
      {showAmbulance && (
        <motion.g
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 1 }}
        >
          <rect x="50" y="280" width="80" height="40" fill="#FFFFFF" rx="5" />
          <rect x="60" y="285" width="30" height="20" fill="#93C5FD" />
          <circle cx="70" cy="320" r="8" fill="#1F2937" />
          <circle cx="110" cy="320" r="8" fill="#1F2937" />
          <rect x="90" y="290" width="15" height="10" fill="#DC2626" />
          <rect x="95" y="285" width="5" height="20" fill="#DC2626" />
        </motion.g>
      )}
      
      {/* Glow Effect */}
      {showGlow && (
        <motion.circle
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          cx="200" cy="180"
          r="60"
          fill="#FCA5A5"
          opacity="0.3"
        />
      )}
    </svg>
  );
}
