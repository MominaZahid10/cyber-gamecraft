import { useState, useEffect, useCallback } from 'react';
import { useMultiGameWebSocket } from './useMultiGameWebSocket';
import type { GameType, UnifiedPersonality, AIActionResponse } from '@/lib/types';

interface GameState {
  fighting: {
    playerHealth: number;
    aiHealth: number;
    playerPosition: { x: number; y: number };
    aiPosition: { x: number; y: number };
    isPlayerTurn: boolean;
  };
  badminton: {
    playerScore: number;
    aiScore: number;
    rallyCount: number;
    shuttlecockPos: { x: number; y: number };
    playerPos: { x: number; y: number };
    aiPos: { x: number; y: number };
  };
  racing: {
    playerPosition: { x: number; y: number };
    aiPosition: { x: number; y: number };
    playerSpeed: number;
    aiSpeed: number;
    lap: number;
    trackSection: 'straight' | 'corner';
  };
}

export const useGameStateManager = (sessionId?: string) => {
  const [currentGame, setCurrentGame] = useState<GameType>('fighting');
  const [gameStates, setGameStates] = useState<GameState>({
    fighting: {
      playerHealth: 100,
      aiHealth: 100,
      playerPosition: { x: 100, y: 300 },
      aiPosition: { x: 500, y: 300 },
      isPlayerTurn: true
    },
    badminton: {
      playerScore: 0,
      aiScore: 0,
      rallyCount: 0,
      shuttlecockPos: { x: 300, y: 200 },
      playerPos: { x: 150, y: 350 },
      aiPos: { x: 450, y: 50 }
    },
    racing: {
      playerPosition: { x: 250, y: 400 },
      aiPosition: { x: 350, y: 380 },
      playerSpeed: 60,
      aiSpeed: 65,
      lap: 1,
      trackSection: 'straight'
    }
  });

  // Use the existing WebSocket hook
  const { 
    connected, 
    switchGame, 
    sendPlayerAction: wsSubmitAction, 
    gameState: wsGameState, 
    personalityData, 
    aiResponse 
  } = useMultiGameWebSocket(sessionId);

  // Update local game state when WebSocket data changes
  useEffect(() => {
    if (wsGameState && Object.keys(wsGameState).length > 0) {
      setGameStates(prev => ({
        ...prev,
        [currentGame]: { ...prev[currentGame], ...wsGameState }
      }));
    }
  }, [wsGameState, currentGame]);

  // Game switching with WebSocket integration
  const switchToGame = useCallback((newGame: GameType) => {
    setCurrentGame(newGame);
    switchGame(newGame);
  }, [switchGame]);

  // Enhanced player action sending
  const sendPlayerAction = useCallback((actionData: unknown) => {
    // Send through WebSocket
    wsSubmitAction(actionData);

    // Also send to specific game endpoint for immediate response
    if (sessionId) {
      fetch(`http://localhost:8000/api/v1/games/${currentGame}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          action_data: {
            ...(actionData as Record<string, unknown>),
            ...gameStates[currentGame]
          }
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.game_state) {
          setGameStates(prev => ({
            ...prev,
            [currentGame]: { ...prev[currentGame], ...data.game_state }
          }));
        }
      })
      .catch(console.error);
    }
  }, [wsSubmitAction, currentGame, sessionId, gameStates]);

  // Update game state helper
  const updateGameState = useCallback((newState: Partial<GameState[typeof currentGame]>) => {
    setGameStates(prev => ({
      ...prev,
      [currentGame]: { ...prev[currentGame], ...newState }
    }));
  }, [currentGame]);

  return {
    currentGame,
    gameStates,
    personalityProfile: personalityData,
    aiLastAction: aiResponse,
    connected,
    switchToGame,
    sendPlayerAction,
    updateGameState,
    setGameStates
  } as const;
};