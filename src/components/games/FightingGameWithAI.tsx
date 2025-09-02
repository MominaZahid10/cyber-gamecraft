import React, { useEffect, useRef, useState } from 'react';
import { AIActionResponse } from '@/lib/types';

interface FightingGameState {
  playerHealth: number;
  aiHealth: number;
  playerPosition: { x: number; y: number };
  aiPosition: { x: number; y: number };
  isPlayerTurn: boolean;
}

interface FightingGameProps {
  gameState: FightingGameState;
  aiLastAction: AIActionResponse | null;
  sendPlayerAction: (action: unknown) => void;
  onStateUpdate: (newState: Partial<FightingGameState>) => void;
}

export const FightingGameWithAI: React.FC<FightingGameProps> = ({
  gameState,
  aiLastAction,
  sendPlayerAction,
  onStateUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const [comboCount, setComboCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game loop
    gameLoopRef.current = window.setInterval(() => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      drawBackground(ctx);
      
      // Draw game elements
      drawPlayer(ctx, gameState.playerPosition, gameState.playerHealth);
      drawAI(ctx, gameState.aiPosition, gameState.aiHealth);
      
      // Process AI action if available
      if (aiLastAction) {
        processAIAction(aiLastAction);
      }
    }, 1000 / 60); // 60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, aiLastAction]);

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Draw fighting arena
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw arena floor
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, ctx.canvas.height - 100, ctx.canvas.width, 100);
    
    // Center line
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, 0);
    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const handlePlayerMove = (moveType: 'punch' | 'kick' | 'combo', position: { x: number; y: number }) => {
    // Calculate if move was successful (basic hit detection)
    const distance = Math.abs(position.x - gameState.aiPosition.x);
    const success = distance < 80; // Hit if within 80 pixels

    // Send action to backend
    sendPlayerAction({
      action_type: 'attack',
      move_type: moveType,
      success: success,
      player_position: [position.x, position.y],
      damage: success ? calculateDamage(moveType) : 0,
      combo: moveType === 'combo' ? comboCount + 1 : 0,
      context: {
        player_health: gameState.playerHealth,
        ai_health: gameState.aiHealth,
        distance_to_opponent: distance
      }
    });

    // Update local game state immediately for responsiveness
    if (success) {
      const damage = calculateDamage(moveType);
      onStateUpdate({
        aiHealth: Math.max(0, gameState.aiHealth - damage)
      });
      
      if (moveType === 'combo') {
        setComboCount(prev => prev + 1);
      } else {
        setComboCount(0);
      }
    }
  };

  const processAIAction = (aiAction: AIActionResponse) => {
    if (!aiAction.current_game_action) return;

    const action = aiAction.current_game_action;
    
    switch (action) {
      case 'aggressive_combo':
      case 'quick_jab':
        // AI attacks - check if it hits player
        const distance = Math.abs(gameState.aiPosition.x - gameState.playerPosition.x);
        if (distance < 80) {
          onStateUpdate({
            playerHealth: Math.max(0, gameState.playerHealth - 12)
          });
        }
        break;
      case 'rush_forward':
        // AI moves closer
        onStateUpdate({
          aiPosition: {
            ...gameState.aiPosition,
            x: gameState.aiPosition.x - 30
          }
        });
        break;
      case 'block':
        // AI is defensive - visual feedback only
        break;
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, position: { x: number; y: number }, health: number) => {
    // Player character (green)
    ctx.fillStyle = '#48bb78';
    ctx.fillRect(position.x - 20, position.y - 30, 40, 60);
    
    // Player health bar
    ctx.fillStyle = '#f56565';
    ctx.fillRect(50, 20, 200, 15);
    ctx.fillStyle = '#48bb78';
    ctx.fillRect(50, 20, (health / 100) * 200, 15);
    
    // Health text
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`Player HP: ${health}`, 50, 50);
  };

  const drawAI = (ctx: CanvasRenderingContext2D, position: { x: number; y: number }, health: number) => {
    // AI character (red)
    ctx.fillStyle = '#f56565';
    ctx.fillRect(position.x - 20, position.y - 30, 40, 60);
    
    // AI health bar
    ctx.fillStyle = '#f56565';
    ctx.fillRect(350, 20, 200, 15);
    ctx.fillStyle = '#f56565';
    ctx.fillRect(350, 20, (health / 100) * 200, 15);
    
    // Health text
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`AI HP: ${health}`, 350, 50);
  };

  const calculateDamage = (moveType: 'punch' | 'kick' | 'combo'): number => {
    const damages = {
      punch: 8,
      kick: 12,
      combo: 15 + (comboCount * 3)
    };
    return damages[moveType] || 5;
  };

  // Input handlers
  const handleKeyPress = (event: KeyboardEvent) => {
    const position = gameState.playerPosition;
    
    switch (event.key.toLowerCase()) {
      case ' ': // Spacebar - punch
        handlePlayerMove('punch', position);
        break;
      case 'k': // K - kick
        handlePlayerMove('kick', position);
        break;
      case 'c': // C - combo
        handlePlayerMove('combo', position);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="fighting-game-container">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400}
        className="border border-border rounded-lg bg-background"
      />
      <div className="controls mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Controls: [Space] Punch, [K] Kick, [C] Combo
        </p>
        <div className="flex gap-2 text-sm">
          <span>Combo Count: {comboCount}</span>
          <span>•</span>
          <span>Distance: {Math.abs(gameState.playerPosition.x - gameState.aiPosition.x).toFixed(0)}px</span>
        </div>
        {aiLastAction && (
          <div className="ai-action-display p-2 bg-muted rounded">
            <div className="font-medium">AI Action: {aiLastAction.current_game_action}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Strategy: {aiLastAction.strategy}
            </div>
            <div className="text-xs text-muted-foreground">
              Confidence: {(aiLastAction.confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};