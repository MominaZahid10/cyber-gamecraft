import React from 'react';
import { motion } from 'framer-motion';

interface ScoreBarProps {
  gameType: 'fighting' | 'badminton' | 'racing';
  playerScore: number;
  aiScore: number;
  extraInfo?: string;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ gameType, playerScore, aiScore, extraInfo }) => {
  const getScoreLabel = () => {
    switch (gameType) {
      case 'fighting':
        return { player: 'PLAYER HP', ai: 'AI HP', unit: '' };
      case 'badminton':
        return { player: 'PLAYER', ai: 'AI', unit: '' };
      case 'racing':
        return { player: 'LAP', ai: 'POSITION', unit: '' };
      default:
        return { player: 'PLAYER', ai: 'AI', unit: '' };
    }
  };

  const labels = getScoreLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
    >
      <div className="score-bar flex items-center gap-8 min-w-[400px] justify-center">
        {/* Player Score */}
        <div className="flex items-center gap-3">
          <div className="text-gaming-emerald font-bold text-sm tracking-wider">
            {labels.player}
          </div>
          <div className="text-2xl font-bold font-gaming">
            {playerScore}{labels.unit}
          </div>
        </div>

        {/* VS Separator */}
        <div className="text-white/60 font-gaming text-lg">VS</div>

        {/* AI Score */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold font-gaming">
            {aiScore}{labels.unit}
          </div>
          <div className="text-gaming-sapphire font-bold text-sm tracking-wider">
            {labels.ai}
          </div>
        </div>

        {/* Extra Info */}
        {extraInfo && (
          <div className="ml-4 pl-4 border-l border-white/20">
            <div className="text-sm text-white/80 font-medium">
              {extraInfo}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ScoreBar;