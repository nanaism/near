"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  id: number;
  position: THREE.Vector3;
  onComplete: (id: number) => void;
};

export const TapEffect = ({ id, position, onComplete }: Props) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const life = useRef(0);

  const particles = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      velocity: new THREE.Vector3(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5
      )
        .normalize()
        .multiplyScalar(Math.random() * 0.5 + 0.2),
      color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.8, 0.9, 0.7), // Pink/Yellow tones
    }));
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    life.current += delta;

    const dummy = new THREE.Object3D();
    particles.forEach((p, i) => {
      p.velocity.y -= 9.8 * delta * 0.1;
      p.velocity.multiplyScalar(0.98);
      dummy.position.copy(p.velocity).multiplyScalar(life.current);

      const scale = Math.max(0, 1 - life.current * 2);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;

    if (life.current > 0.5) {
      onComplete(id);
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, 15]}
      position={position}
    >
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};
