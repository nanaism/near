"use client";

import type { Emotion } from "@/features/chat/model/types";
import { OrbitControls, Sparkles } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { Suspense, memo } from "react";
import * as THREE from "three";
import { ModelLoader } from "./ModelLoader";
import { TapEffect } from "./TapEffect";
import { ThinkingOrbs } from "./ThinkingOrbs";
import { VRMViewer } from "./VRMViewer";

type Props = {
  emotion: Emotion;
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  isLoading: boolean;
  onHeadClick: (event: ThreeEvent<MouseEvent>) => void;
  effects: Array<{ id: number; position: THREE.Vector3 }>;
  onEffectComplete: (id: number) => void;
};

export const VRMCanvas = memo(
  ({
    emotion,
    analyser,
    isSpeaking,
    isLoading,
    onHeadClick,
    effects,
    onEffectComplete,
  }: Props) => {
    return (
      <Canvas
        shadows
        camera={{ position: [0, 1.2, 1.8], fov: 25 }}
        gl={{ antialias: true }}
        dpr={[1, 2]} // デバイスのピクセル比に応じて解像度を調整
        style={{ touchAction: "none" }}
      >
        {/* ライティング */}
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[2, 3, 3]}
          intensity={2.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* 背景 */}
        <color attach="background" args={["#f0f5ff"]} />
        <fog attach="fog" args={["#f0f5ff", 2, 10]} />

        <Suspense fallback={<ModelLoader />}>
          <VRMViewer
            emotion={emotion}
            analyser={analyser}
            isSpeaking={isSpeaking}
            onHeadClick={onHeadClick}
          />

          {effects.map((effect) => (
            <TapEffect
              key={effect.id}
              {...effect}
              onComplete={onEffectComplete}
            />
          ))}

          {isLoading && <ThinkingOrbs />}
          {isLoading && (
            <Sparkles
              count={80}
              scale={2}
              size={15}
              speed={0.4}
              color="#fff"
              position={[0, 1, 0]}
            />
          )}
        </Suspense>

        <OrbitControls
          target={[0, 1.0, 0]}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    );
  }
);

VRMCanvas.displayName = "VRMCanvas";
