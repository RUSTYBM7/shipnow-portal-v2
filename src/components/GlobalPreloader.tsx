/**
 * AirPak Express - Global Route Preloader
 * White full-screen loader with dual rolling SVG circles
 * Outer ring: #E5E5EA clockwise, Inner ring: #007AFF counter-clockwise
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';

interface GlobalPreloaderProps {
  isLoading: boolean;
  minDisplayMs?: number;
}

const GlobalPreloader: React.FC<GlobalPreloaderProps> = ({
  isLoading,
  minDisplayMs = 800
}) => {
  const [startTime] = useState(Date.now());
  const [shouldShow, setShouldShow] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
      setIsExiting(false);
    } else {
      // Ensure minimum display time
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);

      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShouldShow(false);
          setIsExiting(false);
        }, 400); // Exit animation duration
      }, remaining);
    }
  }, [isLoading, startTime, minDisplayMs]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -20,
            transition: { duration: 0.4, ease: 'easeOut' }
          }}
          style={{
            pointerEvents: isExiting ? 'none' : 'all',
            overscrollBehavior: 'none'
          }}
        >
          {/* AirPak Logo */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#DC143C] to-[#B01030] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Package className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Animated Dual Circles */}
          <div className="relative w-24 h-24 mb-6">
            {/* Outer Circle - Clockwise, #E5E5EA */}
            <motion.svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E5EA"
                strokeWidth="4"
              />
              {/* Animated progress - clockwise */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E5EA"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="0 251"
                initial={{ rotate: -90 }}
                animate={{
                  rotate: 270,
                  strokeDasharray: ['0 251', '251 0']
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.65, 0, 0.35, 1],
                  repeat: Infinity
                }}
                style={{ transformOrigin: 'center' }}
              />
            </motion.svg>

            {/* Inner Circle - Counter-clockwise, #007AFF */}
            <motion.svg
              className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)]"
              viewBox="0 0 100 100"
            >
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#E5E5EA"
                strokeWidth="4"
              />
              {/* Animated progress - counter-clockwise */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#007AFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="0 251"
                initial={{ rotate: 90 }}
                animate={{
                  rotate: -270,
                  strokeDasharray: ['0 251', '251 0']
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.65, 0, 0.35, 1],
                  repeat: Infinity,
                  delay: 0.3
                }}
                style={{ transformOrigin: 'center' }}
              />
            </motion.svg>
          </div>

          {/* AirPak Text */}
          <motion.p
            className="text-lg font-medium text-gray-400 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            AirPak Express
          </motion.p>
          <motion.p
            className="text-xs text-gray-300 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            ShipNow Portal
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalPreloader;
