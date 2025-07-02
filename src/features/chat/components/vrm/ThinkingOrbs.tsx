"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export const ThinkingOrbs = () => {
  const groupRef = useRef<THREE.Group>(null!);

  const orbs = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      ),
      offset: Math.random() * Math.PI * 2,
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.55, 0.8, 0.7), // Blue/Purple tones
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((orb, i) => {
      const { position, offset } = orbs[i];
      orb.position.y = position.y + Math.sin(clock.elapsedTime + offset) * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshToonMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};
