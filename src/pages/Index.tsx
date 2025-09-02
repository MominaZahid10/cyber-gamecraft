import React, { useState, useEffect } from 'react';
import GameLauncher from '@/components/GameLauncher';
import GameArena from '@/components/GameArena';
import AnalyticsOverlay from '@/components/AnalyticsOverlay';
import { useGameStateManager } from '@/hooks/useGameStateManager';
import { FightingGameWithAI } from '@/components/games/FightingGameWithAI';
import { BadmintonGameWithAI } from '@/components/games/BadmintonGameWithAI';
import { RacingGameWithAI } from '@/components/games/RacingGameWithAI';
import type { GameType, UnifiedPersonality } from '@/lib/types';

const PersonalityDisplay = ({ personality }: { personality: UnifiedPersonality | null }) => {
  if (!personality) return (
    <div className="text-sm text-muted-foreground">No personality data yet...</div>
  );

  return (
    <div className="personality-panel bg-muted text-foreground p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">AI Personality Analysis</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Aggression: <span className="text-blue-400">{(personality.aggression_level * 100).toFixed(0)}%</span></div>
        <div>Risk Tolerance: <span className="text-green-400">{(personality.risk_tolerance * 100).toFixed(0)}%</span></div>
        <div>Strategic Thinking: <span className="text-purple-400">{(personality.strategic_thinking * 100).toFixed(0)}%</span></div>
        <div>Patience: <span className="text-yellow-400">{(personality.patience_level * 100).toFixed(0)}%</span></div>
        <div>Precision: <span className="text-red-400">{(personality.precision_focus * 100).toFixed(0)}%</span></div>
        <div>Competitive: <span className="text-orange-400">{(personality.competitive_drive * 100).toFixed(0)}%</span></div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Confidence: {(personality.confidence_score * 100).toFixed(0)}%
      </div>
    </div>
  );
};

const Index = () => {
  const sessionId = 'user_' + Date.now();
  const {
    currentGame,
    gameStates,
    personalityProfile,
    aiLastAction,
    connected,
    switchToGame,
    sendPlayerAction,
    updateGameState
  } = useGameStateManager(sessionId);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [personalityFromAPI, setPersonalityFromAPI] = useState<UnifiedPersonality | null>(null);

  // Fetch personality updates periodically
  useEffect(() => {
    const fetchPersonality = () => {
      fetch(`http://localhost:8000/api/v1/personality/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.personality) {
            setPersonalityFromAPI(data.raw_scores || data.personality);
          }
        })
        .catch(console.error);
    };

    const interval = setInterval(fetchPersonality, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleGameSelect = (game: GameType) => {
    switchToGame(game);
  };

  const handleGameChange = (game: GameType) => {
    switchToGame(game);
  };

  const handleToggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  const handleBackToLauncher = () => {
    // Reset to launcher mode but keep the game state manager active
    setShowAnalytics(false);
  };

  const renderCurrentGame = () => {
    switch (currentGame) {
      case 'fighting':
        return (
          <FightingGameWithAI
            gameState={gameStates.fighting}
            aiLastAction={aiLastAction}
            sendPlayerAction={sendPlayerAction}
            onStateUpdate={updateGameState}
          />
        );
      case 'badminton':
        return (
          <BadmintonGameWithAI
            gameState={gameStates.badminton}
            aiLastAction={aiLastAction}
            sendPlayerAction={sendPlayerAction}
            onStateUpdate={updateGameState}
          />
        );
      case 'racing':
        return (
          <RacingGameWithAI
            gameState={gameStates.racing}
            aiLastAction={aiLastAction}
            sendPlayerAction={sendPlayerAction}
            onStateUpdate={updateGameState}
          />
        );
      default:
        return <div>Select a game to start</div>;
    }
  };

  if (!currentGame) {
    return <GameLauncher onGameSelect={handleGameSelect} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-muted p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Multi-Game Arena</h1>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3">Games</h3>
              <div className="space-y-2">
                {(['fighting', 'badminton', 'racing'] as const).map(game => (
                  <button
                    key={game}
                    onClick={() => switchToGame(game)}
                    className={`w-full p-2 rounded text-left transition-colors ${
                      currentGame === game 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {game.charAt(0).toUpperCase() + game.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Display */}
            <PersonalityDisplay 
              personality={personalityFromAPI || personalityProfile} 
            />

            {/* AI Action Display */}
            {aiLastAction && (
              <div className="bg-muted p-4 rounded-lg mt-4">
                <h3 className="text-lg font-semibold mb-2">Latest AI Action</h3>
                <div className="text-sm">
                  <div><strong>Action:</strong> {aiLastAction.current_game_action}</div>
                  <div className="text-muted-foreground mt-1">
                    <strong>Strategy:</strong> {aiLastAction.strategy}
                  </div>
                  <div className="text-muted-foreground">
                    <strong>Confidence:</strong> {(aiLastAction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {currentGame.charAt(0).toUpperCase() + currentGame.slice(1)} Game
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleAnalytics}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                  >
                    {showAnalytics ? 'Hide' : 'Show'} Analytics
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Session: {sessionId.slice(-8)}
                  </div>
                </div>
              </div>
              
              {renderCurrentGame()}
            </div>

            {/* Game Stats */}
            <div className="bg-muted p-4 rounded-lg mt-4">
              <h3 className="text-lg font-semibold mb-3">Game Statistics</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {currentGame === 'fighting' ? `${gameStates.fighting.playerHealth}%` :
                     currentGame === 'badminton' ? gameStates.badminton.playerScore :
                     `${gameStates.racing.playerSpeed} km/h`}
                  </div>
                  <div className="text-muted-foreground">
                    {currentGame === 'fighting' ? 'Health' :
                     currentGame === 'badminton' ? 'Score' : 'Speed'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {currentGame === 'fighting' ? `${gameStates.fighting.aiHealth}%` :
                     currentGame === 'badminton' ? gameStates.badminton.aiScore :
                     `${gameStates.racing.aiPosition.y.toFixed(0)}m`}
                  </div>
                  <div className="text-muted-foreground">
                    {currentGame === 'fighting' ? 'AI Health' :
                     currentGame === 'badminton' ? 'AI Score' : 'AI Position'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-foreground">
                    {currentGame === 'badminton' ? gameStates.badminton.rallyCount :
                     currentGame === 'racing' ? gameStates.racing.lap : '100%'}
                  </div>
                  <div className="text-muted-foreground">
                    {currentGame === 'badminton' ? 'Rally Count' :
                     currentGame === 'racing' ? 'Lap' : 'Ready'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnalyticsOverlay
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
      
      {/* Back to Launcher Button */}
      <button
        onClick={handleBackToLauncher}
        className="fixed top-4 right-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 text-sm z-40 rounded transition-colors"
      >
        ← MAIN MENU
      </button>
    </div>
  );
};

export default Index;
