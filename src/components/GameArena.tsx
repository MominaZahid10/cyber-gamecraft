import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Plane, Text3D, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import Shuttlecock from './Shuttlecock';

interface GameArenaProps {
  gameType: 'fighting' | 'badminton' | 'racing';
  onGameChange: (game: 'fighting' | 'badminton' | 'racing') => void;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
}

// Fighter Character Component - Realistic with animations
const FighterCharacter = ({ position, color, isPlayer = false }: { position: [number, number, number], color: string, isPlayer?: boolean }) => {
  const meshRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [position2D, setPosition2D] = useState(position);
  const [facingDirection, setFacingDirection] = useState(isPlayer ? 1 : -1);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Realistic idle animation - breathing and slight movement
      if (!isAttacking && !isWalking) {
        meshRef.current.position.y = position2D[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;

        // Subtle arm sway during idle
        if (leftArmRef.current) {
          leftArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
          leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.z = -Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
          rightArmRef.current.rotation.x = -Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
        }

        // Body breathing animation
        if (bodyRef.current) {
          bodyRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
        }
      }

      // Walking animation
      if (isWalking && !isAttacking) {
        const walkCycle = state.clock.elapsedTime * 8;

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.4;
          rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.4;
        }

        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
          rightArmRef.current.rotation.x = Math.sin(walkCycle) * 0.3;
        }

        // Walking bob
        meshRef.current.position.y = position2D[1] + Math.abs(Math.sin(walkCycle * 2)) * 0.05;
      }

      // Always face opponent
      if (meshRef.current) {
        meshRef.current.rotation.y = facingDirection < 0 ? Math.PI : 0;
      }
    }
  });

  const performAttack = (attackType: 'punch' | 'kick' = 'punch') => {
    if (!meshRef.current || isAttacking) return;

    setIsAttacking(true);
    const originalX = position2D[0];

    if (attackType === 'punch') {
      // Realistic punch animation with full body movement
      if (rightArmRef.current && bodyRef.current) {
        rightArmRef.current.rotation.x = -Math.PI / 2;
        rightArmRef.current.rotation.z = facingDirection * -0.3;
        bodyRef.current.rotation.y = facingDirection * -0.1;
      }

      // Forward lunge with proper spacing
      setPosition2D([originalX + (facingDirection * 0.3), position2D[1], position2D[2]]);

      setTimeout(() => {
        if (rightArmRef.current && bodyRef.current) {
          rightArmRef.current.rotation.x = 0;
          rightArmRef.current.rotation.z = 0;
          bodyRef.current.rotation.y = 0;
        }
        setPosition2D([originalX, position2D[1], position2D[2]]);
        setIsAttacking(false);
      }, 400);
    } else if (attackType === 'kick') {
      // Kick animation
      if (rightLegRef.current && bodyRef.current) {
        rightLegRef.current.rotation.x = Math.PI / 3;
        bodyRef.current.rotation.y = facingDirection * -0.15;
      }

      setPosition2D([originalX + (facingDirection * 0.4), position2D[1], position2D[2]]);

      setTimeout(() => {
        if (rightLegRef.current && bodyRef.current) {
          rightLegRef.current.rotation.x = 0;
          bodyRef.current.rotation.y = 0;
        }
        setPosition2D([originalX, position2D[1], position2D[2]]);
        setIsAttacking(false);
      }, 500);
    }
  };

  // Enhanced movement with WASD
  useEffect(() => {
    if (!isPlayer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAttacking) return;

      const moveSpeed = 0.08;
      const prevPos = position2D;

      switch (event.key.toLowerCase()) {
        case 'w':
          setPosition2D(prev => [prev[0], prev[1], Math.max(-4, prev[2] - moveSpeed)]);
          setIsWalking(true);
          break;
        case 's':
          setPosition2D(prev => [prev[0], prev[1], Math.min(4, prev[2] + moveSpeed)]);
          setIsWalking(true);
          break;
        case 'a':
          setPosition2D(prev => [Math.max(-6, prev[0] - moveSpeed), prev[1], prev[2]]);
          setFacingDirection(-1);
          setIsWalking(true);
          break;
        case 'd':
          setPosition2D(prev => [Math.min(6, prev[0] + moveSpeed), prev[1], prev[2]]);
          setFacingDirection(1);
          setIsWalking(true);
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 's':
        case 'a':
        case 'd':
          setIsWalking(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlayer, isAttacking, position2D]);

  // Combat controls
  useEffect(() => {
    if (!isPlayer) return;

    const handleCombatKeys = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'j':
          performAttack('punch');
          break;
        case 'k':
          performAttack('kick');
          break;
        case 'l':
          // Block animation
          if (!isAttacking && !isBlocking) {
            setIsBlocking(true);
            if (leftArmRef.current && rightArmRef.current) {
              leftArmRef.current.rotation.x = -Math.PI / 4;
              rightArmRef.current.rotation.x = -Math.PI / 4;
              leftArmRef.current.position.z = facingDirection * 0.2;
              rightArmRef.current.position.z = facingDirection * 0.2;
            }
            setTimeout(() => {
              if (leftArmRef.current && rightArmRef.current) {
                leftArmRef.current.rotation.x = 0;
                rightArmRef.current.rotation.x = 0;
                leftArmRef.current.position.z = 0;
                rightArmRef.current.position.z = 0;
              }
              setIsBlocking(false);
            }, 800);
          }
          break;
        case ' ':
          // Jump animation with realistic arc
          if (meshRef.current && !isAttacking && !isBlocking) {
            const originalY = position2D[1];
            let jumpHeight = 0;
            const jumpDuration = 600;
            const startTime = Date.now();

            const animateJump = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / jumpDuration, 1);

              // Parabolic jump curve
              jumpHeight = Math.sin(progress * Math.PI) * 0.8;
              setPosition2D(prev => [prev[0], originalY + jumpHeight, prev[2]]);

              if (progress < 1) {
                requestAnimationFrame(animateJump);
              }
            };

            animateJump();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleCombatKeys);
    return () => window.removeEventListener('keydown', handleCombatKeys);
  }, [isPlayer, isAttacking, isBlocking, position2D, facingDirection]);

  return (
    <group ref={meshRef} position={position2D}>
      {/* Realistic body with better proportions */}
      <Box ref={bodyRef} args={[0.45, 1.2, 0.3]} position={[0, 0.1, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      {/* Head with helmet effect */}
      <Sphere args={[0.16]} position={[0, 0.8, 0]}>
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.1} />
      </Sphere>

      {/* Enhanced Animated Arms with shoulders */}
      <Sphere args={[0.12]} position={[-0.32, 0.5, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={leftArmRef} args={[0.16, 0.6, 0.16]} position={[-0.35, 0.1, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      <Sphere args={[0.12]} position={[0.32, 0.5, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={rightArmRef} args={[0.16, 0.6, 0.16]} position={[0.35, 0.1, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      {/* Enhanced Legs with hips */}
      <Sphere args={[0.10]} position={[-0.15, -0.6, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={leftLegRef} args={[0.16, 0.8, 0.16]} position={[-0.15, -1.0, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      <Sphere args={[0.10]} position={[0.15, -0.6, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={rightLegRef} args={[0.16, 0.8, 0.16]} position={[0.15, -1.0, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      {/* Feet */}
      <Box args={[0.2, 0.1, 0.3]} position={[-0.15, -1.45, 0.05]}>
        <meshPhongMaterial color={color} />
      </Box>
      <Box args={[0.2, 0.1, 0.3]} position={[0.15, -1.45, 0.05]}>
        <meshPhongMaterial color={color} />
      </Box>
      
      {/* Professional gaming effects */}
      <Sphere args={[0.08]} position={[0, 0.9, 0.25]}>
        <meshBasicMaterial color="#4ECDC4" />
      </Sphere>
      <Sphere args={[0.08]} position={[0, 0.9, -0.25]}>
        <meshBasicMaterial color="#A855F7" />
      </Sphere>
      
      {/* Chest panel */}
      <Box args={[0.3, 0.4, 0.05]} position={[0, 0.2, 0.18]}>
        <meshPhongMaterial color="#4ECDC4" emissive="#4ECDC4" emissiveIntensity={0.3} />
      </Box>
    </group>
  );
};

// Badminton Player Component - Realistic with animations
const BadmintonPlayer = ({ position, color, isPlayer = false }: { position: [number, number, number], color: string, isPlayer?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const racketRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const [playerPos, setPlayerPos] = useState(position);
  const [isSwinging, setIsSwinging] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [racketPower, setRacketPower] = useState(0);
  const [facingDirection, setFacingDirection] = useState(isPlayer ? 1 : -1);

  useFrame((state, delta) => {
    if (bodyRef.current) {
      if (!isSwinging && !isMoving) {
        // Natural breathing and ready stance
        bodyRef.current.position.y = playerPos[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.03;

        // Racket ready position with subtle movement
        if (racketRef.current) {
          racketRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
          racketRef.current.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
        }

        // Subtle arm sway
        if (leftArmRef.current && rightArmRef.current) {
          leftArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
          rightArmRef.current.rotation.z = -Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
        }
      }

      // Enhanced walking animation
      if (isMoving && !isSwinging) {
        const walkCycle = state.clock.elapsedTime * 6;

        if (leftLegRef.current && rightLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkCycle) * 0.3;
          rightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * 0.3;
        }

        // Walking bob
        bodyRef.current.position.y = playerPos[1] + Math.abs(Math.sin(walkCycle * 2)) * 0.04;

        // Racket movement during walk
        if (racketRef.current) {
          racketRef.current.rotation.x = Math.sin(walkCycle) * 0.1;
        }
      }

      // Face the net
      if (groupRef.current) {
        groupRef.current.rotation.y = facingDirection < 0 ? Math.PI : 0;
      }
    }
  });

  // Enhanced player movement for badminton
  useEffect(() => {
    if (!isPlayer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSwinging) return;

      const moveSpeed = 0.12;
      switch (event.key.toLowerCase()) {
        case 'w':
          setPlayerPos(prev => [prev[0], prev[1], Math.max(-5, prev[2] - moveSpeed)]);
          setIsMoving(true);
          break;
        case 's':
          setPlayerPos(prev => [prev[0], prev[1], Math.min(5, prev[2] + moveSpeed)]);
          setIsMoving(true);
          break;
        case 'a':
          setPlayerPos(prev => [Math.max(-7, prev[0] - moveSpeed), prev[1], prev[2]]);
          setIsMoving(true);
          break;
        case 'd':
          setPlayerPos(prev => [Math.min(7, prev[0] + moveSpeed), prev[1], prev[2]]);
          setIsMoving(true);
          break;
        case ' ':
          // Power swing - hold for more power
          if (!isSwinging) {
            setRacketPower(Math.min(racketPower + 0.1, 1));
          }
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
        case 's':
        case 'a':
        case 'd':
          setIsMoving(false);
          break;
        case ' ':
          // Release swing with accumulated power
          if (!isSwinging) {
            performSwing(racketPower);
            setRacketPower(0);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlayer, isSwinging, racketPower]);

  const performSwing = (power: number = 0.5) => {
    if (isSwinging || !racketRef.current) return;

    setIsSwinging(true);

    // Realistic swing animation with power variation
    const swingIntensity = 0.5 + power * 0.8;
    const swingSpeed = 200 + power * 200;

    // Backswing
    racketRef.current.rotation.z = Math.PI / 4;
    racketRef.current.rotation.x = -Math.PI / 6;

    // Body rotation for power
    if (bodyRef.current) {
      bodyRef.current.rotation.y = facingDirection * -0.2 * swingIntensity;
    }

    setTimeout(() => {
      if (racketRef.current) {
        // Forward swing
        racketRef.current.rotation.z = -Math.PI / 2 * swingIntensity;
        racketRef.current.rotation.x = Math.PI / 4;

        // Arm extension
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = -Math.PI / 3 * swingIntensity;
        }
      }
    }, 100);

    setTimeout(() => {
      // Follow through
      if (racketRef.current && bodyRef.current && rightArmRef.current) {
        racketRef.current.rotation.z = -Math.PI / 6;
        racketRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
        bodyRef.current.rotation.y = 0;
      }
    }, swingSpeed);

    setTimeout(() => {
      // Return to ready position
      if (racketRef.current) {
        racketRef.current.rotation.z = 0;
        racketRef.current.rotation.x = 0;
        setIsSwinging(false);
      }
    }, swingSpeed + 200);
  };

  return (
    <group ref={groupRef} position={playerPos}>
      {/* Athletic body */}
      <Box ref={bodyRef} args={[0.32, 1.0, 0.22]} position={[0, 0.1, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      {/* Head */}
      <Sphere args={[0.13]} position={[0, 0.7, 0]}>
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.05} />
      </Sphere>

      {/* Enhanced Arms with shoulders */}
      <Sphere args={[0.08]} position={[-0.25, 0.45, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={leftArmRef} args={[0.14, 0.55, 0.14]} position={[-0.25, 0.05, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      <Sphere args={[0.08]} position={[0.25, 0.45, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={rightArmRef} args={[0.14, 0.55, 0.14]} position={[0.25, 0.05, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      {/* Enhanced Legs with hips */}
      <Sphere args={[0.08]} position={[-0.14, -0.5, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={leftLegRef} args={[0.14, 0.75, 0.14]} position={[-0.14, -0.85, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      <Sphere args={[0.08]} position={[0.14, -0.5, 0]}>
        <meshPhongMaterial color={color} />
      </Sphere>
      <Box ref={rightLegRef} args={[0.14, 0.75, 0.14]} position={[0.14, -0.85, 0]}>
        <meshPhongMaterial color={color} />
      </Box>

      {/* Athletic shoes */}
      <Box args={[0.18, 0.08, 0.26]} position={[-0.14, -1.26, 0.04]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Box>
      <Box args={[0.18, 0.08, 0.26]} position={[0.14, -1.26, 0.04]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Box>
      
      {/* Enhanced Professional Racket */}
      <group ref={racketRef} position={[0.28, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
        {/* Grip */}
        <Box args={[0.025, 0.25, 0.025]} position={[0, -0.12, 0]}>
          <meshPhongMaterial color="#1A1A1A" />
        </Box>
        {/* Handle */}
        <Box args={[0.032, 0.45, 0.032]} position={[0, 0.1, 0]}>
          <meshPhongMaterial color="#2D1B69" />
        </Box>
        {/* Racket head frame */}
        <mesh position={[0, 0.48, 0]}>
          <ringGeometry args={[0.14, 0.16, 20]} />
          <meshPhongMaterial color="#FF6B35" />
        </mesh>
        {/* Racket head - realistic oval */}
        <mesh position={[0, 0.48, 0]}>
          <ringGeometry args={[0.08, 0.14, 16]} />
          <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
        </mesh>
        {/* Enhanced string pattern */}
        <mesh position={[0, 0.48, 0.005]}>
          <ringGeometry args={[0.09, 0.135, 16]} />
          <meshBasicMaterial color="#E0E0E0" wireframe />
        </mesh>
        {/* Cross strings */}
        <mesh position={[0, 0.48, -0.005]} rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[0.09, 0.135, 16]} />
          <meshBasicMaterial color="#E0E0E0" wireframe />
        </mesh>

        {/* Power indicator when charging */}
        {racketPower > 0 && (
          <Sphere args={[0.02 + racketPower * 0.05]} position={[0, 0.48, 0]}>
            <meshBasicMaterial color="#4ECDC4" transparent opacity={0.6} />
          </Sphere>
        )}
      </group>
      
      {/* Professional effects */}
      <Sphere args={[0.06]} position={[0, 0.75, 0.2]}>
        <meshBasicMaterial color="#4ECDC4" />
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
      
      {/* Professional Badminton Court */}
      {gameType === 'badminton' && (
        <>
          {/* Net */}
          <Box args={[0.08, 2.2, 8]} position={[0, 0.1, 0]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Box>
          <mesh position={[0, 1.1, 0]} rotation={[0, 0, 0]}>
            <planeGeometry args={[8, 2]} />
            <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.8} />
          </mesh>
          
          {/* Court lines */}
          <Plane args={[12, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, 3]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
          <Plane args={[12, 0.1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.85, -3]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
          <Plane args={[0.1, 6]} rotation={[-Math.PI / 2, 0, 0]} position={[6, -1.85, 0]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
          <Plane args={[0.1, 6]} rotation={[-Math.PI / 2, 0, 0]} position={[-6, -1.85, 0]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
          
          {/* Service lines */}
          <Plane args={[6, 0.05]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.84, 1.5]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
          <Plane args={[6, 0.05]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.84, -1.5]}>
            <meshBasicMaterial color="#FFFFFF" />
          </Plane>
        </>
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
      
      {/* Professional Gaming Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[12, 8, 6]} intensity={1.2} color="#4ECDC4" castShadow />
      <directionalLight position={[-8, 6, -4]} intensity={0.8} color="#A855F7" />
      <pointLight position={[0, 6, 0]} intensity={0.6} color="#FFFFFF" />
      <spotLight position={[0, 10, 0]} intensity={0.8} angle={Math.PI / 3} penumbra={0.5} color="#4ECDC4" />
    </>
  );
};

// Professional Gaming Camera Controller
const CameraController = ({ gameType }: { gameType: 'fighting' | 'badminton' | 'racing' }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Professional gaming perspective based on game type
    switch (gameType) {
      case 'fighting':
        camera.position.set(6, 2, 6); // Side angle like fighting games
        camera.lookAt(0, 0, 0);
        break;
      case 'badminton':
        camera.position.set(0, 4, 8); // Behind player view
        camera.lookAt(0, 0, 0);
        break;
      case 'racing':
        camera.position.set(0, 3, 10); // Racing game perspective
        camera.lookAt(0, 0, 0);
        break;
    }
  }, [camera, gameType]);

  return null;
};

const GameArena: React.FC<GameArenaProps> = ({ gameType, onGameChange, showAnalytics, onToggleAnalytics }) => {
  const [gameStarted, setGameStarted] = useState(false);

  const renderGameContent = () => {
    switch (gameType) {
      case 'fighting':
        return (
          <>
            <FighterCharacter position={[-3, 0, 0]} color="#00D4FF" isPlayer />
            <FighterCharacter position={[3, 0, 0]} color="#FF6B35" />
          </>
        );
      case 'badminton':
        return (
          <>
            <BadmintonPlayer position={[-4, 0, 0]} color="#4ECDC4" isPlayer />
            <BadmintonPlayer position={[4, 0, 0]} color="#A855F7" />
            {/* Realistic Shuttlecock with physics */}
            <Shuttlecock />
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
          camera={{ position: [6, 2, 6], fov: 80 }}
          shadows
          gl={{ antialias: true, alpha: false }}
        >
          <CameraController gameType={gameType} />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={20}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={false}
            enableDamping={true}
            dampingFactor={0.05}
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
        <div className="absolute bottom-4 left-4 hud-element p-4 rounded-lg">
          <div className="text-sm font-medium text-foreground/80">
            <div className="text-primary font-bold mb-2 font-gaming tracking-wider">CONTROLS</div>
            {gameType === 'fighting' && (
              <>
                <div>WASD: Move</div>
                <div>J: Punch | K: Kick</div>
                <div>L: Block | SPACE: Jump</div>
              </>
            )}
            {gameType === 'badminton' && (
              <>
                <div>WASD: Move</div>
                <div>SPACE: Swing (Hold for power)</div>
                <div>Position for accuracy</div>
              </>
            )}
            {gameType === 'racing' && (
              <>
                <div>WASD: Drive</div>
                <div>SPACE: Brake</div>
                <div>SHIFT: Boost</div>
              </>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className="absolute bottom-4 right-4 hud-element p-4 rounded-lg">
          <div className="text-sm font-medium">
            <div className="text-primary font-bold font-gaming tracking-wider">STATUS</div>
            <div className="text-gaming-teal font-medium">
              {gameType === 'fighting' && 'COMBAT READY'}
              {gameType === 'badminton' && 'COURT ACTIVE'}
              {gameType === 'racing' && 'ENGINES HOT'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameArena;
