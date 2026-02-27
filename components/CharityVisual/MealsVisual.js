'use client';
import { motion } from 'framer-motion';

export default function MealsVisual({ progressPercentage }) {
  // Much lower thresholds - each milestone at ~0.025% intervals
  const showRice = progressPercentage >= 0.025;
  const showCurry = progressPercentage >= 0.05;
  const showFull = progressPercentage >= 0.075;
  const showSteam = progressPercentage >= 0.10;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* Background */}
      <rect width="400" height="400" fill="#FEF3C7" />
      
      {/* Table */}
      <rect x="50" y="250" width="300" height="20" fill="#92400E" rx="5" />
      
      {/* Plate */}
      <ellipse cx="200" cy="250" rx="120" ry="20" fill="#E5E7EB" />
      <ellipse cx="200" cy="245" rx="110" ry="18" fill="#F3F4F6" />
      
      {/* Rice */}
      {showRice && (
        <motion.ellipse
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          cx="200" cy="230" rx="80" ry="30"
          fill="#FFFBEB"
          style={{ transformOrigin: 'center' }}
        />
      )}
      
      {/* Curry */}
      {showCurry && (
        <motion.ellipse
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          cx="160" cy="220" rx="40" ry="25"
          fill="#F59E0B"
          style={{ transformOrigin: 'center' }}
        />
      )}
      
      {/* Full Meal - Vegetables */}
      {showFull && (
        <>
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            cx="240" cy="220" r="15"
            fill="#10B981"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            cx="260" cy="230" r="12"
            fill="#EF4444"
          />
        </>
      )}
      
      {/* Steam Animation */}
      {showSteam && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.path
              key={i}
              d={`M ${180 + i * 20} 200 Q ${185 + i * 20} 180 ${180 + i * 20} 160`}
              stroke="#9CA3AF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              animate={{
                opacity: [0, 0.6, 0],
                y: [0, -20, -40]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </>
      )}
      
      {/* Spoon */}
      <ellipse cx="280" cy="260" rx="15" ry="8" fill="#D1D5DB" />
      <rect x="278" y="260" width="4" height="60" fill="#D1D5DB" rx="2" />
    </svg>
  );
}
