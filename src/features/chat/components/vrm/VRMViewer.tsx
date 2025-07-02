"use client";

import type { Emotion } from "@/features/chat/model/types";
import {
  VRM,
  VRMExpressionPresetName,
  VRMHumanBoneName,
  VRMLoaderPlugin,
} from "@pixiv/three-vrm";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame, useLoader } from "@react-three/fiber";
import { memo, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type Props = {
  emotion: Emotion;
  analyser: AnalyserNode | null;
  isSpeaking: boolean;
  onHeadClick: (event: ThreeEvent<MouseEvent>) => void;
};

export const VRMViewer = memo(
  ({ emotion, analyser, isSpeaking, onHeadClick }: Props) => {
    const gltf = useLoader(GLTFLoader, "/avatar.vrm", (loader) => {
      loader.register((parser) => new VRMLoaderPlugin(parser));
    });

    const vrmRef = useRef<VRM | null>(null);

    // --- 初期設定 ---
    useEffect(() => {
      const vrm = gltf.userData.vrm as VRM;
      if (!vrm) return;

      vrmRef.current = vrm;

      // lookAtが存在する場合、手動更新モードに設定する
      if (vrm.lookAt) {
        vrm.lookAt.autoUpdate = false;
      }

      vrm.springBoneManager?.reset();
    }, [gltf]);

    // --- フレームごとのアニメーション制御 ---
    useFrame((state, delta) => {
      const vrm = vrmRef.current;
      if (!vrm?.expressionManager || !vrm.humanoid) return;

      const manager = vrm.expressionManager;
      const humanoid = vrm.humanoid;
      const clock = state.clock;

      // 口パク制御
      if (isSpeaking && analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0) / data.length;
        manager.setValue(
          VRMExpressionPresetName.Aa,
          Math.min(1.0, (volume / 100) ** 1.5)
        );
      } else {
        manager.setValue(VRMExpressionPresetName.Aa, 0);
      }

      // 瞬き制御 (簡易版)
      const blinkValue =
        Math.max(0, Math.sin(clock.elapsedTime * 2.0) - 0.8) * 5;
      manager.setValue(VRMExpressionPresetName.Blink, blinkValue);

      // 表情制御
      Object.values(VRMExpressionPresetName).forEach((preset) => {
        if (
          preset === VRMExpressionPresetName.Blink ||
          preset === VRMExpressionPresetName.Aa
        )
          return;
        const targetWeight = preset === emotion ? 1.0 : 0.0;
        const currentWeight = manager.getValue(preset) ?? 0.0;
        manager.setValue(
          preset,
          THREE.MathUtils.lerp(currentWeight, targetWeight, delta * 8.0)
        );
      });

      // 体の動き（呼吸と自然な揺れ）
      const head = humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
      const spine = humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine);
      if (head) {
        head.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.1;
      }
      if (spine) {
        spine.rotation.x = Math.sin(clock.elapsedTime * 0.6) * 0.02;
      }

      // --- VRMモデル全体の更新 ---
      // VRMのメインの更新処理
      vrm.update(delta);

      vrm.lookAt?.update(delta);
    });

    return (
      <group>
        <primitive object={gltf.scene} dispose={null} />
        <mesh
          position={[0, 1.35, 0.1]} // 頭の位置に合わせる
          onClick={onHeadClick}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    );
  }
);

VRMViewer.displayName = "VRMViewer";
