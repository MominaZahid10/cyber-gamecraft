import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Plane, Text3D, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface GameArenaProps {
  gameType: 'fighting' | 'badminton' | 'racing';
  onGameChange: (game: 'fighting' | 'badminton' | 'racing') => void;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
}

// Fighter Character Component
const FighterCharacter = ({ position, color, isPlayer = false }: { position: [number, number, number], color: string, isPlayer?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isAttacking, setIsAttacking] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && !isAttacking) {
      // Idle animation - slight breathing motion
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const performAttack = () => {
    if (!meshRef.current || isAttacking) return;
    
    setIsAttacking(true);
    const originalX = meshRef.current.position.x;
    
    // Attack animation
    meshRef.current.position.x += isPlayer ? 0.3 : -0.3;
    
    setTimeout(() => {
      if (meshRef.current) {
        meshRef.current.position.x = originalX;
        setIsAttacking(false);
      }
    }, 300);
  };

  // Keyboard controls for player
  useEffect(() => {
    if (!isPlayer) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'j':
        case 'k':
          performAttack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlayer]);

  return (
    <group position={position}>
      {/* Main body */}
      <Box ref={meshRef} args={[0.4, 1.2, 0.3]}>
        <meshPhongMaterial color={color} />
      </Box>
      
      {/* Head */}
      <Sphere args={[0.15]} position={[0, 0.8, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      
      {/* Arms */}
      <Box args={[0.15, 0.6, 0.15]} position={[-0.3, 0.2, 0]}>
        <meshPhongMaterial color={color} />
      </Box>
      <Box args={[0.15, 0.6, 0.15]} position={[0.3, 0.2, 0]}>
        <meshPhongMaterial color={color} />
      </Box>
      
      {/* Legs */}
      <Box args={[0.15, 0.8, 0.15]} position={[-0.15, -1, 0]}>
        <meshPhongMaterial color={color} />
      </Box>
      <Box args={[0.15, 0.8, 0.15]} position={[0.15, -1, 0]}>
        <meshPhongMaterial color={color} />
      </Box>
      
      {/* Energy effects for cyberpunk look */}
      <Sphere args={[0.05]} position={[0, 0.8, 0.2]}>
        <meshBasicMaterial color="#00D4FF" />
      </Sphere>
      <Sphere args={[0.05]} position={[0, 0.8, -0.2]}>
        <meshBasicMaterial color="#39FF14" />
      </Sphere>
    </group>
  );
};

// Badminton Player Component
const BadmintonPlayer = ({ position, color }: { position: [number, number, number], color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Slight movement animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Player body */}
      <Box ref={meshRef} args={[0.3, 1, 0.2]}>
        <meshPhongMaterial color={color} />
      </Box>
      
      {/* Head */}
      <Sphere args={[0.12]} position={[0, 0.7, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      
      {/* Racket */}
      <Box args={[0.02, 0.6, 0.02]} position={[0.2, 0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshPhongMaterial color="#8B4513" />
      </Box>
      <Sphere args={[0.15]} position={[0.35, 0.6, 0]}>
        <meshBasicMaterial color="#FFFFFF" wireframe />
      </Sphere>
    </group>
  );
};

// Racing Car Component
const RacingCar = ({ position, color }: { position: [number, number, number], color: string }) => {
  const carRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (carRef.current) {
      // Engine vibration effect
      carRef.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * 20) * 0.01;
    }
  });

  return (
    <group ref={carRef} position={position}>
      {/* Car body */}
      <Box args={[1.8, 0.4, 0.8]}>
        <meshPhongMaterial color={color} />
      </Box>
      
      {/* Wheels */}
      <Sphere args={[0.2]} position={[-0.6, -0.3, 0.5]}>
        <meshPhongMaterial color="#333333" />
      </Sphere>
      <Sphere args={[0.2]} position={[0.6, -0.3, 0.5]}>
        <meshPhongMaterial color="#333333" />
      </Sphere>
      <Sphere args={[0.2]} position={[-0.6, -0.3, -0.5]}>
        <meshPhongMaterial color="#333333" />
      </Sphere>
      <Sphere args={[0.2]} position={[0.6, -0.3, -0.5]}>
        <meshPhongMaterial color="#333333" />
      </Sphere>
      
      {/* Windshield */}
      <Box args={[1.6, 0.3, 0.02]} position={[0, 0.15, 0.39]}>
        <meshPhongMaterial color="#87CEEB" transparent opacity={0.7} />
      </Box>
    </group>
  );
};

// Arena Environment Component
const ArenaEnvironment = ({ gameType }: { gameType: 'fighting' | 'badminton' | 'racing' }) => {
  return (
    <>
      {/* Arena Floor */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshPhongMaterial color="#1a1a1a" />
      </Plane>
      
      {/* Arena Walls for fighting game */}
      {gameType === 'fighting' && (
        <>
          <Plane args={[20, 10]} position={[0, 3, -10]}>
            <meshPhongMaterial color="#2a2a2a" />
          </Plane>
          <Plane args={[20, 10]} rotation={[0, Math.PI, 0]} position={[0, 3, 10]}>
            <meshPhongMaterial color="#2a2a2a" />
          </Plane>
        </>
      )}
      
      {/* Badminton net */}
      {gameType === 'badminton' && (
        <Box args={[0.05, 2, 8]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#FFFFFF" wireframe />
        </Box>
      )}
      
      {/* Racing track */}
      {gameType === 'racing' && (
        <>
          <Plane args={[30, 4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
            <meshPhongMaterial color="#333333" />
          </Plane>
          {/* Track lines */}
          <Plane args={[30, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 1.8]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
          <Plane args={[30, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, -1.8]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
        </>
      )}
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00D4FF" />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} color="#39FF14" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFFFFF" />
    </>
  );
};

// Camera Controller (prevents auto-rotation)
const CameraController = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(5, 3, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

const GameArena: React.FC<GameArenaProps> = ({ gameType, onGameChange, showAnalytics, onToggleAnalytics }) => {
  const [gameStarted, setGameStarted] = useState(false);

  const renderGameContent = () => {
    switch (gameType) {
      case 'fighting':
        return (
          <>
            <FighterCharacter position={[-2, 0, 0]} color="#00D4FF" isPlayer />
            <FighterCharacter position={[2, 0, 0]} color="#FF6B35" />
          </>
        );
      case 'badminton':
        return (
          <>
            <BadmintonPlayer position={[-3, 0, 0]} color="#00D4FF" />
            <BadmintonPlayer position={[3, 0, 0]} color="#FF6B35" />
            {/* Shuttlecock */}
            <Sphere args={[0.05]} position={[0, 2, 0]}>
              <meshBasicMaterial color="#FFFFFF" />
            </Sphere>
          </>
        );
      case 'racing':
        return (
          <>
            <RacingCar position={[-1, 0, 0]} color="#00D4FF" />
            <RacingCar position={[1, 0, -2]} color="#FF6B35" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* Game Arena */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [5, 3, 8], fov: 75 }}
          shadows
        >
          <CameraController />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
            autoRotate={false} // CRITICAL: No auto-rotation
          />
          
          <ArenaEnvironment gameType={gameType} />
          {renderGameContent()}
        </Canvas>
      </div>

      {/* Game UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          {/* Game Switcher */}
          <div className="flex gap-2">
            {(['fighting', 'badminton', 'racing'] as const).map((game) => (
              <motion.button
                key={game}
                onClick={() => onGameChange(game)}
                className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-300 ${
                  gameType === game
                    ? 'btn-gaming'
                    : 'btn-gaming-outline'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {game}
              </motion.button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex gap-3 items-center">
            {/* Voice Command Button */}
            <motion.button
              className="hud-element p-3 rounded-full hover:bg-primary/20 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </motion.button>

            {/* Analytics Button */}
            <motion.button
              onClick={onToggleAnalytics}
              className="hud-element px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Analytics
            </motion.button>
          </div>
        </div>

        {/* Game Controls Info */}
        {gameType === 'fighting' && (
          <div className="absolute bottom-4 left-4 hud-element p-4 rounded-lg">
            <div className="text-sm font-medium text-foreground/80">
              <div className="text-primary font-bold mb-2">CONTROLS</div>
              <div>WASD: Move</div>
              <div>J/K: Attack</div>
              <div>SPACE: Jump</div>
              <div>L: Block</div>
            </div>
          </div>
        )}

        {/* Game Status */}
        <div className="absolute bottom-4 right-4 hud-element p-4 rounded-lg">
          <div className="text-sm font-medium">
            <div className="text-primary font-bold">STATUS</div>
            <div className="text-accent">READY TO FIGHT</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameArena;