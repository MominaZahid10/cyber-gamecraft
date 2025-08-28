import React from 'react';
import { motion } from 'framer-motion';

interface GameControlsProps {
  gameType: 'fighting' | 'badminton' | 'racing';
  isGameStarted: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameType,
  isGameStarted,
  isPaused,
  onStart,
  onPause,
  onReset
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      {/* Start/Pause Button */}
      <motion.button
        onClick={isGameStarted ? onPause : onStart}
        className="btn-immersive px-6 py-3 text-sm font-bold tracking-wider"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isGameStarted ? (isPaused ? 'RESUME' : 'PAUSE') : 'START GAME'}
      </motion.button>

      {/* Reset Button */}
      {isGameStarted && (
        <motion.button
          onClick={onReset}
          className="btn-gaming-outline px-6 py-2 text-sm font-bold tracking-wider"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          RESET
        </motion.button>
      )}

      {/* Game Status Indicator */}
      <div className="hud-element p-3 rounded-lg">
        <div className="text-xs font-bold text-gaming-emerald tracking-wider">
          {isGameStarted ? (isPaused ? 'PAUSED' : 'PLAYING') : 'READY'}
        </div>
      </div>
    </div>
  );
};

export default GameControls;