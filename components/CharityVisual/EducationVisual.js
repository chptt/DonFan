'use client';
import { motion } from 'framer-motion';

export default function EducationVisual({ progressPercentage }) {
  // Much lower thresholds - each milestone at ~0.025% intervals
  const showDesks = progressPercentage >= 0.025;
  const showBooks = progressPercentage >= 0.05;
  const showBoard = progressPercentage >= 0.05;
  const showLaptop = progressPercentage >= 0.075;
  const showLights = progressPercentage >= 0.10;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* Background */}
      <rect width="400" height="400" fill="#EEF2FF" />
      
      {/* Floor */}
      <rect y="300" width="400" height="100" fill="#D1D5DB" />
      
      {/* Blackboard */}
      {showBoard && (
        <motion.g
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: 'center' }}
        >
          <rect x="80" y="80" width="240" height="140" fill="#1F2937" rx="5" />
          <text x="200" y="130" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontFamily="Arial">
            ABC
          </text>
          <text x="200" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="32" fontFamily="Arial">
            123
          </text>
        </motion.g>
      )}
      
      {/* Desks */}
      {showDesks && (
        <>
          {[0, 1].map((row) =>
            [0, 1].map((col) => (
              <motion.g
                key={`${row}-${col}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: (row * 2 + col) * 0.2 }}
              >
                <rect
                  x={100 + col * 120}
                  y={240 + row * 40}
                  width="80"
                  height="40"
                  fill="#92400E"
                  rx="3"
                />
                <rect
                  x={110 + col * 120}
                  y={235 + row * 40}
                  width="60"
                  height="5"
                  fill="#78350F"
                />
              </motion.g>
            ))
          )}
        </>
      )}
      
      {/* Books */}
      {showBooks && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <rect x="110" y="230" width="15" height="20" fill="#EF4444" />
          <rect x="127" y="230" width="15" height="20" fill="#3B82F6" />
          <rect x="144" y="230" width="15" height="20" fill="#10B981" />
        </motion.g>
      )}
      
      {/* Laptop */}
      {showLaptop && (
        <motion.g
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <rect x="230" y="235" width="50" height="30" fill="#374151" rx="2" />
          <rect x="235" y="240" width="40" height="20" fill="#60A5FA" />
          <rect x="220" y="265" width="70" height="3" fill="#374151" />
        </motion.g>
      )}
      
      {/* Bright Lighting */}
      {showLights && (
        <>
          <motion.circle
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            cx="200" cy="50" r="40"
            fill="#FCD34D"
            opacity="0.4"
          />
          <motion.circle
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            cx="200" cy="200" r="100"
            fill="#FEF3C7"
            opacity="0.3"
          />
        </>
      )}
    </svg>
  );
}
