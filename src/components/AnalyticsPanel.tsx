import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalyticsData {
  unified_personality: {
    aggression_level: number;
    risk_tolerance: number;
    analytical_thinking: number;
    patience_level: number;
    precision_focus: number;
    competitive_drive: number;
    strategic_thinking: number;
    adaptability: number;
    confidence_score: number;
    games_played: string[];
  };
  cross_game_insights: {
    consistency_across_games: number;
    learning_rate: number;
    dominant_strategy: string;
  };
  session_stats: {
    total_actions: number;
    session_duration: number;
    improvement_rate: number;
  };
}

interface AnalyticsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  gameType: 'fighting' | 'badminton' | 'racing';
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ isVisible, onClose, gameType }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    unified_personality: {
      aggression_level: 0.75,
      risk_tolerance: 0.82,
      analytical_thinking: 0.68,
      patience_level: 0.45,
      precision_focus: 0.73,
      competitive_drive: 0.89,
      strategic_thinking: 0.71,
      adaptability: 0.66,
      confidence_score: 0.78,
      games_played: ['fighting', 'badminton', 'racing']
    },
    cross_game_insights: {
      consistency_across_games: 0.82,
      learning_rate: 0.76,
      dominant_strategy: 'Aggressive Precision'
    },
    session_stats: {
      total_actions: 247,
      session_duration: 8.5,
      improvement_rate: 0.23
    }
  });

  const personalityTraits = [
    { name: "Aggression", value: analyticsData.unified_personality.aggression_level, color: "#ff4444" },
    { name: "Risk Tolerance", value: analyticsData.unified_personality.risk_tolerance, color: "#ff8800" },
    { name: "Analytical", value: analyticsData.unified_personality.analytical_thinking, color: "#4488ff" },
    { name: "Patience", value: analyticsData.unified_personality.patience_level, color: "#44ff88" },
    { name: "Precision", value: analyticsData.unified_personality.precision_focus, color: "#8844ff" },
    { name: "Competitive", value: analyticsData.unified_personality.competitive_drive, color: "#ff44ff" },
    { name: "Strategic", value: analyticsData.unified_personality.strategic_thinking, color: "#ffff44" },
    { name: "Adaptability", value: analyticsData.unified_personality.adaptability, color: "#44ffff" }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute inset-4 bg-gradient-to-br from-gaming-emerald/10 to-gaming-sapphire/10 rounded-2xl border border-gaming-emerald/20 backdrop-blur-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gaming-emerald/20">
              <h2 className="text-3xl font-bold font-gaming bg-gradient-to-r from-gaming-emerald to-gaming-sapphire bg-clip-text text-transparent">
                AI ANALYTICS DASHBOARD
              </h2>
              <button
                onClick={onClose}
                className="btn-gaming-outline px-6 py-2"
              >
                BACK TO GAME
              </button>
            </div>

            {/* Analytics Content */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Unified Personality Radar */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gaming-emerald">Unified Personality Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  {personalityTraits.map((trait) => (
                    <div key={trait.name} className="hud-element p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{trait.name}</span>
                        <span className="text-sm font-bold">{(trait.value * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-background/20 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${trait.value * 100}%`,
                            backgroundColor: trait.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Personality Archetype */}
                <div className="hud-element p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-gaming-sapphire mb-3">Personality Archetype</h4>
                  <div className="text-2xl font-gaming text-gaming-emerald mb-2">
                    🎯 The Strategic Competitor
                  </div>
                  <div className="text-gaming-teal">
                    ⚡ Lightning Adaptor
                  </div>
                  <div className="text-sm text-foreground/70 mt-3">
                    High aggression with strategic precision. Adapts quickly to new challenges.
                  </div>
                </div>
              </div>

              {/* Cross-Game Performance */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gaming-sapphire">Cross-Game Performance</h3>
                
                {/* Game-Specific Metrics */}
                <div className="grid gap-4">
                  {['fighting', 'badminton', 'racing'].map((game) => (
                    <div key={game} className="hud-element p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold capitalize">{game}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          gameType === game ? 'bg-gaming-emerald text-black' : 'bg-background/20'
                        }`}>
                          {gameType === game ? 'ACTIVE' : 'PLAYED'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-foreground/60">Accuracy</div>
                          <div className="font-bold text-gaming-emerald">
                            {game === 'fighting' ? '85%' : game === 'badminton' ? '78%' : '92%'}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/60">Style</div>
                          <div className="font-bold text-gaming-sapphire">
                            {game === 'fighting' ? 'Aggressive' : game === 'badminton' ? 'Tactical' : 'Precise'}
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/60">Score</div>
                          <div className="font-bold text-gaming-teal">
                            {game === 'fighting' ? 'A+' : game === 'badminton' ? 'B+' : 'A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Insights */}
                <div className="hud-element p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-gaming-emerald mb-3">Real-Time AI Insights</h4>
                  <div className="space-y-3">
                    <div className="border-l-2 border-gaming-emerald pl-3">
                      <div className="text-sm font-bold">Strategy Change Detected</div>
                      <div className="text-xs text-foreground/70">
                        Player adapted to defensive strategy in fighting game
                      </div>
                    </div>
                    <div className="border-l-2 border-gaming-sapphire pl-3">
                      <div className="text-sm font-bold">Cross-Game Pattern</div>
                      <div className="text-xs text-foreground/70">
                        High precision in racing correlates with badminton accuracy
                      </div>
                    </div>
                    <div className="border-l-2 border-gaming-teal pl-3">
                      <div className="text-sm font-bold">Learning Progress</div>
                      <div className="text-xs text-foreground/70">
                        23% improvement rate across all games
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Statistics */}
                <div className="hud-element p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-gaming-sapphire mb-3">Session Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gaming-emerald">247</div>
                      <div className="text-xs text-foreground/60">Total Actions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gaming-sapphire">8.5m</div>
                      <div className="text-xs text-foreground/60">Play Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gaming-teal">78%</div>
                      <div className="text-xs text-foreground/60">Confidence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsPanel;