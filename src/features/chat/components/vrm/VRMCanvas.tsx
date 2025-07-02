// src/features/chat/components/vrm/VRMCanvas.tsx

"use client";

import type { Emotion } from "@/features/chat/model/types";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
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
        // ★★★ 最重要修正点: カメラを初期コードの値に戻す ★★★
        camera={{ position: [0, 1.5, 1.5], fov: 25 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        className="w-full h-full touch-none"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} castShadow />
        <color attach="background" args={["#f0f5ff"]} />
        <fog attach="fog" args={["#f0f5ff", 2.5, 10]} />

        {/* デバッグ用のグリッドは不要になったため削除 */}

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
          {isLoading && (
            <>
              <ThinkingOrbs />
              <Sparkles
                count={100}
                scale={1.5}
                size={20}
                speed={0.4}
                color="#fff"
              />
            </>
          )}
        </Suspense>

        <OrbitControls
          // ★★★ 最重要修正点: ターゲットを初期コードの値に戻す ★★★
          target={[0, 1.2, 0]}
          enableZoom={false}
          enablePan={false}
        />
      </Canvas>
    );
  }
);

VRMCanvas.displayName = "VRMCanvas";
