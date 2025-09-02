import React, { useEffect, useRef, useState } from 'react';
import { AIActionResponse } from '@/lib/types';

interface RacingGameState {
  playerPosition: { x: number; y: number };
  aiPosition: { x: number; y: number };
  playerSpeed: number;
  aiSpeed: number;
  lap: number;
  trackSection: 'straight' | 'corner';
}

interface RacingGameProps {
  gameState: RacingGameState;
  aiLastAction: AIActionResponse | null;
  sendPlayerAction: (action: unknown) => void;
  onStateUpdate: (newState: Partial<RacingGameState>) => void;
}

export const RacingGameWithAI: React.FC<RacingGameProps> = ({
  gameState,
  aiLastAction,
  sendPlayerAction,
  onStateUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameLoopRef.current = window.setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw track
      drawTrack(ctx);
      drawPlayer(ctx, gameState.playerPosition);
      drawAI(ctx, gameState.aiPosition);
      drawSpeedometer(ctx, gameState.playerSpeed);
      drawLapCounter(ctx, gameState.lap);
      
      // Update positions based on input
      updatePlayerPosition();
      
      // Process AI action
      if (aiLastAction) {
        processAIRacingAction(aiLastAction);
      }
    }, 1000 / 60);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, aiLastAction, keys]);

  const updatePlayerPosition = () => {
    let newPos = { ...gameState.playerPosition };
    let newSpeed = gameState.playerSpeed;
    let actionType = 'maintain_speed';
    
    if (keys['ArrowUp'] || keys['w']) {
      newSpeed = Math.min(140, newSpeed + 1.5);
      newPos.y -= 2;
      actionType = 'accelerate';
    }
    if (keys['ArrowDown'] || keys['s']) {
      newSpeed = Math.max(10, newSpeed - 2);
      actionType = 'brake';
    }
    if (keys['ArrowLeft'] || keys['a']) {
      newPos.x = Math.max(70, newPos.x - 2);
      actionType = 'steer';
    }
    if (keys['ArrowRight'] || keys['d']) {
      newPos.x = Math.min(530, newPos.x + 2);
      actionType = 'steer';
    }

    // Check if lap completed
    let newLap = gameState.lap;
    if (newPos.y <= 50 && gameState.playerPosition.y > 350) {
      newLap++;
    }

    // Send action to backend if player is doing something
    if (actionType !== 'maintain_speed') {
      sendPlayerAction({
        action_type: actionType,
        speed: newSpeed,
        player_position: [newPos.x, newPos.y],
        ai_position: [gameState.aiPosition.x, gameState.aiPosition.y],
        track_section: determineTrackSection(newPos),
        overtaking_attempt: isOvertaking(newPos, gameState.aiPosition),
        success: true,
        context: {
          lap_number: newLap,
          position_in_race: newPos.y < gameState.aiPosition.y ? 1 : 2,
          distance_to_finish: Math.abs(newPos.y - 50)
        }
      });
    }

    onStateUpdate({
      playerPosition: newPos,
      playerSpeed: newSpeed,
      lap: newLap,
      trackSection: determineTrackSection(newPos)
    });
  };

  const processAIRacingAction = (aiAction: AIActionResponse) => {
    if (!aiAction.current_game_action) return;

    const action = aiAction.current_game_action;
    let newAIPos = { ...gameState.aiPosition };
    let newAISpeed = gameState.aiSpeed;
    
    switch (action) {
      case 'overtake_attempt':
        newAIPos.x += gameState.playerPosition.x > gameState.aiPosition.x ? 8 : -8;
        newAIPos.y -= 2;
        newAISpeed = Math.min(150, newAISpeed + 3);
        break;
      case 'perfect_racing_line':
        newAIPos.y -= 2;
        newAISpeed = Math.min(130, newAISpeed + 1);
        break;
      case 'blocking_defense':
        newAIPos.x = gameState.playerPosition.x + (Math.random() - 0.5) * 50;
        newAIPos.y -= 1;
        break;
      case 'aggressive_overtake':
        newAIPos.y -= 3;
        newAISpeed = Math.min(160, newAISpeed + 4);
        break;
      default:
        newAIPos.y -= 1.5;
        newAISpeed = Math.max(40, newAISpeed - 0.5);
    }

    // Keep AI on track
    newAIPos.x = Math.max(70, Math.min(530, newAIPos.x));
    
    // AI lap completion
    let newAILap = gameState.lap;
    if (newAIPos.y <= 50 && gameState.aiPosition.y > 350) {
      newAILap++;
    }

    onStateUpdate({
      aiPosition: newAIPos,
      aiSpeed: newAISpeed
    });
  };

  const drawTrack = (ctx: CanvasRenderingContext2D) => {
    // Track background
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Track surface
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(50, 0, 500, ctx.canvas.height);
    
    // Track boundaries
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 0, 500, ctx.canvas.height);
    
    // Center line
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, ctx.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Finish line
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 25; i++) {
      ctx.fillRect(50 + (i * 20), 40, 20, 20);
      ctx.fillStyle = ctx.fillStyle === '#fff' ? '#000' : '#fff';
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) => {
    // Player car (green)
    ctx.fillStyle = '#48bb78';
    ctx.fillRect(pos.x - 15, pos.y - 20, 30, 40);
    
    // Car details
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(pos.x - 10, pos.y - 15, 20, 8);
    ctx.fillRect(pos.x - 10, pos.y + 7, 20, 8);
  };

  const drawAI = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) => {
    // AI car (red)
    ctx.fillStyle = '#f56565';
    ctx.fillRect(pos.x - 15, pos.y - 20, 30, 40);
    
    // Car details
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(pos.x - 10, pos.y - 15, 20, 8);
    ctx.fillRect(pos.x - 10, pos.y + 7, 20, 8);
  };

  const drawSpeedometer = (ctx: CanvasRenderingContext2D, speed: number) => {
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText(`Speed: ${Math.round(speed)} km/h`, 10, 30);
    
    // Speed bar
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(10, 40, 200, 10);
    ctx.fillStyle = speed > 100 ? '#f56565' : '#48bb78';
    ctx.fillRect(10, 40, (speed / 160) * 200, 10);
  };

  const drawLapCounter = (ctx: CanvasRenderingContext2D, lap: number) => {
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText(`Lap: ${lap}`, 10, 80);
  };

  const determineTrackSection = (pos: { x: number; y: number }): 'straight' | 'corner' => {
    return pos.y < 100 || pos.y > 300 ? 'corner' : 'straight';
  };

  const isOvertaking = (playerPos: { x: number; y: number }, aiPos: { x: number; y: number }): boolean => {
    return Math.abs(playerPos.x - aiPos.x) < 60 && Math.abs(playerPos.y - aiPos.y) < 50;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [event.key]: true }));
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    setKeys(prev => ({ ...prev, [event.key]: false }));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="racing-game-container">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400}
        className="border border-border rounded-lg bg-background"
        tabIndex={0}
      />
      <div className="controls mt-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Controls: Arrow keys or WASD to steer, accelerate, and brake
        </p>
        <div className="flex gap-4 text-sm">
          <span>Position: {gameState.playerPosition.y < gameState.aiPosition.y ? '1st' : '2nd'}</span>
          <span>•</span>
          <span>Track: {gameState.trackSection}</span>
          <span>•</span>
          <span>Overtaking: {isOvertaking(gameState.playerPosition, gameState.aiPosition) ? 'Yes' : 'No'}</span>
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
