import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsOverlay: React.FC<AnalyticsOverlayProps> = ({ isOpen, onClose }) => {
  // Mock analytics data
  const analyticsData = {
    totalGames: 147,
    winRate: 68,
    avgGameTime: "4:32",
    favoriteGame: "Fighting",
    recentMatches: [
      { game: "Fighting", result: "Win", duration: "3:45", opponent: "AI Challenger" },
      { game: "Badminton", result: "Loss", duration: "6:12", opponent: "Pro Player" },
      { game: "Racing", result: "Win", duration: "2:33", opponent: "Speed Demon" },
      { game: "Fighting", result: "Win", duration: "4:01", opponent: "Combat Master" },
    ],
    skillLevels: {
      fighting: 85,
      badminton: 72,
      racing: 91
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-glow">ARENA ANALYTICS</h1>
              <motion.button
                onClick={onClose}
                className="btn-gaming-outline px-6 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                BACK TO GAME
              </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="gaming-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary">Total Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analyticsData.totalGames}</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-accent">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analyticsData.winRate}%</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gaming-orange">Avg Game Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{analyticsData.avgGameTime}</div>
                </CardContent>
              </Card>

              <Card className="gaming-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gaming-purple">Favorite Game</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{analyticsData.favoriteGame}</div>
                </CardContent>
              </Card>
            </div>

            {/* Skill Levels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-primary">Skill Levels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analyticsData.skillLevels).map(([game, level]) => (
                    <div key={game} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{game}</span>
                        <span className="text-accent font-bold">{level}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${level}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="bg-gradient-gaming h-2 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Matches */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-accent">Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.recentMatches.map((match, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{match.game}</div>
                          <div className="text-sm text-muted-foreground">vs {match.opponent}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${match.result === 'Win' ? 'text-accent' : 'text-destructive'}`}>
                            {match.result}
                          </div>
                          <div className="text-sm text-muted-foreground">{match.duration}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart Placeholder */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-primary">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">📊</div>
                    <div className="text-muted-foreground">Performance charts coming soon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsOverlay;