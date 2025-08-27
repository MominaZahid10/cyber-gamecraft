import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import arenaBg from '@/assets/arena-bg.jpg';

interface GameLauncherProps {
  onGameSelect: (game: 'fighting' | 'badminton' | 'racing') => void;
}

const GameLauncher: React.FC<GameLauncherProps> = ({ onGameSelect }) => {
  const games = [
    {
      id: 'fighting' as const,
      title: 'COMBAT ARENA',
      description: 'Realistic martial arts combat with advanced physics',
      color: 'text-primary',
      bgColor: 'from-primary/20 to-primary/5',
      icon: '🥊'
    },
    {
      id: 'badminton' as const,
      title: 'BADMINTON PRO',
      description: 'Professional badminton with realistic shuttlecock physics',
      color: 'text-accent',
      bgColor: 'from-accent/20 to-accent/5',
      icon: '🏸'
    },
    {
      id: 'racing' as const,
      title: 'SPEED CIRCUIT',
      description: 'High-speed racing with dynamic environments',
      color: 'text-gaming-orange',
      bgColor: 'from-gaming-orange/20 to-gaming-orange/5',
      icon: '🏎️'
    }
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-8"
      style={{ backgroundImage: `url(${arenaBg})` }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-glow mb-4 bg-gradient-gaming bg-clip-text text-transparent">
            AI MULTI-GAME ARENA
          </h1>
          <p className="text-xl text-muted-foreground">
            Select your battleground and prove your skills
          </p>
        </motion.div>

        {/* Game Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className={`gaming-card cursor-pointer h-80 overflow-hidden relative group bg-gradient-to-br ${game.bgColor} border-2 hover:border-primary/50 transition-all duration-300`}
                onClick={() => onGameSelect(game.id)}
              >
                <CardContent className="p-8 h-full flex flex-col justify-between">
                  <div>
                    <div className="text-6xl mb-4 text-center group-hover:animate-bounce">
                      {game.icon}
                    </div>
                    <h3 className={`text-2xl font-bold mb-3 ${game.color} text-center`}>
                      {game.title}
                    </h3>
                    <p className="text-muted-foreground text-center">
                      {game.description}
                    </p>
                  </div>
                  
                  <motion.button
                    className="btn-gaming w-full mt-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ENTER ARENA
                  </motion.button>
                </CardContent>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-gaming opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Use WASD for movement • J/K for combat • Click and drag to rotate view
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default GameLauncher;