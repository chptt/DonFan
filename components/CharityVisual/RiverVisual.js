'use client';
import { motion } from 'framer-motion';

export default function RiverVisual({ progressPercentage }) {
  // Much lower thresholds - each milestone at ~0.02% intervals
  const trashRemoved = progressPercentage >= 0.02;
  const cleanerWater = progressPercentage >= 0.04;
  const showFish = progressPercentage >= 0.06;
  const showTrees = progressPercentage >= 0.08;
  const showFlow = progressPercentage >= 0.10;

  const waterColor = cleanerWater ? '#3B82F6' : '#6B7280';

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto">
      {/* Sky */}
      <rect width="400" height="400" fill="#DBEAFE" />
      
      {/* Banks */}
      <rect y="280" width="400" height="120" fill="#86EFAC" />
      
      {/* River */}
      <motion.path
        d="M 0 200 Q 100 180 200 200 T 400 200 L 400 280 L 0 280 Z"
        fill={waterColor}
        animate={showFlow ? {
          d: [
            "M 0 200 Q 100 180 200 200 T 400 200 L 400 280 L 0 280 Z",
            "M 0 200 Q 100 220 200 200 T 400 200 L 400 280 L 0 280 Z",
            "M 0 200 Q 100 180 200 200 T 400 200 L 400 280 L 0 280 Z"
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Trash (if not removed) */}
      {!trashRemoved && (
        <>
          <rect x="80" y="220" width="20" height="15" fill="#78716C" />
          <circle cx="180" cy="230" r="10" fill="#DC2626" />
          <rect x="280" y="225" width="25" height="20" fill="#92400E" />
        </>
      )}
      
      {/* Fish */}
      {showFish && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.g
              key={i}
              animate={{
                x: [0, 50, 0],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.8
              }}
            >
              <ellipse
                cx={100 + i * 80}
                cy={230 + i * 10}
                rx="15"
                ry="8"
                fill="#F97316"
              />
              <polygon
                points={`${85 + i * 80},${230 + i * 10} ${75 + i * 80},${225 + i * 10} ${75 + i * 80},${235 + i * 10}`}
                fill="#F97316"
              />
            </motion.g>
          ))}
        </>
      )}
      
      {/* Trees */}
      {showTrees && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.g
              key={i}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <rect x={50 + i * 150} y="300" width="15" height="40" fill="#92400E" />
              <circle cx={57 + i * 150} cy="295" r="25" fill="#10B981" />
            </motion.g>
          ))}
        </>
      )}
      
      {/* Birds */}
      {showTrees && (
        <>
          {[0, 1].map((i) => (
            <motion.path
              key={i}
              d={`M ${100 + i * 100} ${100 + i * 20} q 10 -5 20 0`}
              stroke="#1F2937"
              strokeWidth="2"
              fill="none"
              animate={{
                x: [0, 100, 200],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 2
              }}
            />
          ))}
        </>
      )}
      
      {/* Water Flow Animation */}
      {showFlow && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <motion.ellipse
              key={i}
              cx={50 + i * 80}
              cy={240}
              rx="30"
              ry="5"
              fill="#FFFFFF"
              opacity="0.4"
              animate={{
                x: [0, 400],
                opacity: [0.4, 0.1, 0.4]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </>
      )}
    </svg>
  );
}
