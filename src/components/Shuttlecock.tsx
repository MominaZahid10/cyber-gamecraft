import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';

const Shuttlecock = () => {
  const shuttleRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>([0, 3, 0]);
  const [velocity, setVelocity] = useState<[number, number, number]>([0, 0, 0]);
  const [isInPlay, setIsInPlay] = useState(false);

  useFrame((state, delta) => {
    if (shuttleRef.current && isInPlay) {
      // Physics simulation
      const [x, y, z] = position;
      const [vx, vy, vz] = velocity;
      
      // Gravity and air resistance
      const gravity = -9.8 * delta;
      const airResistance = 0.98;
      
      // Update velocity
      const newVy = vy + gravity;
      const newVx = vx * airResistance;
      const newVz = vz * airResistance;
      
      // Update position
      const newX = x + newVx * delta;
      const newY = Math.max(0.1, y + newVy * delta); // Don't go below ground
      const newZ = z + newVz * delta;
      
      setPosition([newX, newY, newZ]);
      setVelocity([newVx, newVy, newVz]);
      
      // Reset if hits ground or goes too far
      if (newY <= 0.1 || Math.abs(newX) > 8 || Math.abs(newZ) > 8) {
        setTimeout(() => {
          setPosition([0, 3, 0]);
          setVelocity([0, 0, 0]);
          setIsInPlay(false);
        }, 1000);
      }
      
      // Rotation for realism
      shuttleRef.current.rotation.x += delta * 2;
    } else if (shuttleRef.current) {
      // Gentle floating when not in play
      shuttleRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // Launch shuttlecock on spacebar
  useEffect(() => {
    const handleLaunch = (event: KeyboardEvent) => {
      if (event.key === ' ' && !isInPlay) {
        setIsInPlay(true);
        setVelocity([
          (Math.random() - 0.5) * 8,
          Math.random() * 3 + 2,
          (Math.random() - 0.5) * 6
        ]);
      }
    };

    window.addEventListener('keydown', handleLaunch);
    return () => window.removeEventListener('keydown', handleLaunch);
  }, [isInPlay]);

  return (
    <group ref={shuttleRef} position={position}>
      {/* Shuttlecock head */}
      <Sphere args={[0.08]} position={[0, 0, 0]}>
        <meshPhongMaterial color="#F5F5F5" />
      </Sphere>
      
      {/* Feathers */}
      {Array.from({ length: 8 }, (_, i) => (
        <Cone
          key={i}
          args={[0.02, 0.3]}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 0.06,
            -0.15,
            Math.sin((i / 8) * Math.PI * 2) * 0.06
          ]}
          rotation={[Math.PI, 0, 0]}
        >
          <meshPhongMaterial color="#FFFFFF" transparent opacity={0.9} />
        </Cone>
      ))}
      
      {/* Trail effect when moving */}
      {isInPlay && (
        <Sphere args={[0.15]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#4ECDC4" transparent opacity={0.3} />
        </Sphere>
      )}
    </group>
  );
};

export default Shuttlecock;