import React, { useEffect, useRef, useState } from 'react';
import { AIActionResponse } from '@/lib/types';

interface BadmintonGameState {
  playerScore: number;
  aiScore: number;
  rallyCount: number;
  shuttlecockPos: { x: number; y: number };
  playerPos: { x: number; y: number };
  aiPos: { x: number; y: number };
}

interface BadmintonGameProps {
  gameState: BadmintonGameState;
  aiLastAction: AIActionResponse | null;
  sendPlayerAction: (action: unknown) => void;
  onStateUpdate: (newState: Partial<BadmintonGameState>) => void;
}

export const BadmintonGameWithAI: React.FC<BadmintonGameProps> = ({
  gameState,
  aiLastAction,
  sendPlayerAction,
  onStateUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShot, setSelectedShot] = useState<'clear' | 'drop' | 'smash' | 'net' | 'drive'>('clear');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw court
      drawCourt(ctx);
      drawPlayer(ctx, gameState.playerPos);
      drawAI(ctx, gameState.aiPos);
      drawShuttlecock(ctx, gameState.shuttlecockPos);
      drawScore(ctx, gameState.playerScore, gameState.aiScore);
      
      // Process AI action
      if (aiLastAction) {
        processAIBadmintonAction(aiLastAction);
      }
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, aiLastAction]);

  const handlePlayerShot = (targetPos: { x: number; y: number }, powerLevel: number) => {
    const shotSuccess = Math.random() > 0.2; // 80% success rate
    
    sendPlayerAction({
      action_type: 'shot',
      shot_type: selectedShot,
      target: [targetPos.x, targetPos.y],
      power_level: powerLevel,
      rally_count: gameState.rallyCount + 1,
      player_position: [gameState.playerPos.x, gameState.playerPos.y],
      shuttlecock_position: [gameState.shuttlecockPos.x, gameState.shuttlecockPos.y],
      success: shotSuccess,
      context: {
        rally_count: gameState.rallyCount,
        court_side: gameState.playerPos.x < 300 ? 'left' : 'right',
        game_score: [gameState.playerScore, gameState.aiScore]
      }
    });

    if (shotSuccess) {
      onStateUpdate({
        shuttlecockPos: targetPos,
        rallyCount: gameState.rallyCount + 1
      });
    }
  };

  const processAIBadmintonAction = (aiAction: AIActionResponse) => {
    if (!aiAction.current_game_action) return;

    const action = aiAction.current_game_action;
    let newShuttlecockPos = gameState.shuttlecockPos;
    
    switch (action) {
      case 'smash':
      case 'aggressive_smash':
        newShuttlecockPos = { x: Math.random() * 400 + 100, y: 300 };
        break;
      case 'drop_shot':
        newShuttlecockPos = { x: Math.random() * 200 + 100, y: 250 };
        break;
      case 'clear_shot':
        newShuttlecockPos = { x: Math.random() * 400 + 100, y: 350 };
        break;
      case 'net_shot':
        newShuttlecockPos = { x: Math.random() * 300 + 150, y: 200 };
        break;
    }

    onStateUpdate({
      shuttlecockPos: newShuttlecockPos,
      rallyCount: gameState.rallyCount + 1
    });
  };

  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    // Court background
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Court boundaries
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 500, 300);
    
    // Net
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(550, 200);
    ctx.stroke();
    
    // Service lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 120, 500, 160);
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) => {
    ctx.fillStyle = '#48bb78';
    ctx.fillRect(pos.x - 15, pos.y - 15, 30, 30);
    
    // Player label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('P', pos.x - 5, pos.y + 5);
  };

  const drawAI = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) => {
    ctx.fillStyle = '#f56565';
    ctx.fillRect(pos.x - 15, pos.y - 15, 30, 30);
    
    // AI label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('AI', pos.x - 8, pos.y + 5);
  };

  const drawShuttlecock = (ctx: CanvasRenderingContext2D, pos: { x: number; y: number }) => {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Feathers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x + Math.cos(angle) * 10, pos.y + Math.sin(angle) * 10);
      ctx.stroke();
    }
  };

  const drawScore = (ctx: CanvasRenderingContext2D, playerScore: number, aiScore: number) => {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Player: ${playerScore}`, 60, 30);
    ctx.fillText(`AI: ${aiScore}`, 450, 30);
    
    // Rally count
    ctx.font = '14px Arial';
    ctx.fillText(`Rally: ${gameState.rallyCount}`, 280, 30);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const targetPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    const powerLevel = 0.7; // Default power
    handlePlayerShot(targetPos, powerLevel);
  };

  return (
    <div className="badminton-game-container">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400}
        onClick={handleCanvasClick}
        className="border border-border rounded-lg cursor-crosshair bg-background"
      />
      <div className="controls mt-4 space-y-3">
        <div className="shot-selector">
          <p className="text-sm font-medium mb-2">Select Shot Type:</p>
          <div className="flex gap-2">
            {['clear', 'drop', 'smash', 'drive', 'net'].map(shot => (
              <button
                key={shot}
                onClick={() => setSelectedShot(shot as any)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedShot === shot 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {shot.charAt(0).toUpperCase() + shot.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Click on the court to hit the shuttlecock with selected shot type!
        </p>
        
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