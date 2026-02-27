'use client';
import { motion } from 'framer-motion';

export default function HousingVisual({ progressPercentage }) {
  const showFoundation = progressPercentage >= 20;
  const showWalls = progressPercentage >= 40;
  const showRoof = progressPercentage >= 60;
  const showDetails = progressPercentage >= 80;
  const showLights = progressPercentage >= 100;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* Sky */}
      <rect width="400" height="400" fill="#E0F2FE" />
      
      {/* Ground */}
      <rect y="300" width="400" height="100" fill="#86EFAC" />
      
      {/* Foundation */}
      {showFoundation && (
        <motion.rect
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.5 }}
          x="100" y="280" width="200" height="20"
          fill="#78716C"
          style={{ transformOrigin: 'bottom' }}
        />
      )}
      
      {/* Walls */}
      {showWalls && (
        <motion.rect
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6 }}
          x="100" y="180" width="200" height="100"
          fill="#FCA5A5"
          style={{ transformOrigin: 'bottom' }}
        />
      )}
      
      {/* Roof */}
      {showRoof && (
        <motion.polygon
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          points="200,120 80,180 320,180"
          fill="#DC2626"
        />
      )}
      
      {/* Door and Windows */}
      {showDetails && (
        <>
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4 }}
            x="170" y="220" width="60" height="80"
            fill="#92400E"
            style={{ transformOrigin: 'bottom' }}
          />
          <motion.rect
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            x="120" y="200" width="40" height="40"
            fill="#DBEAFE"
            style={{ transformOrigin: 'center' }}
          />
          <motion.rect
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            x="240" y="200" width="40" height="40"
            fill="#DBEAFE"
            style={{ transformOrigin: 'center' }}
          />
        </>
      )}
      
      {/* Lights Glow */}
      {showLights && (
        <>
          <motion.circle
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            cx="140" cy="220" r="30"
            fill="#FCD34D"
            opacity="0.5"
          />
          <motion.circle
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            cx="260" cy="220" r="30"
            fill="#FCD34D"
            opacity="0.5"
          />
        </>
      )}
    </svg>
  );
}
