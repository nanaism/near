// src/features/chat/components/vrm/VRMViewer.tsx

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

    // ★★★ あなたの初期コードのロジックを完全に復元 ★★★
    const vrmRef = useRef<VRM | null>(null);
    const interactionRef = useRef<THREE.Mesh>(null); // クリック判定用

    // --- 初期設定 ---
    useEffect(() => {
      const vrm = gltf.userData.vrm as VRM;
      if (!vrm) return;
      vrmRef.current = vrm;

      // 腕を自然に下ろす初期ポーズ
      const rightUpperArm = vrm.humanoid?.getNormalizedBoneNode(
        VRMHumanBoneName.RightUpperArm
      );
      const leftUpperArm = vrm.humanoid?.getNormalizedBoneNode(
        VRMHumanBoneName.LeftUpperArm
      );
      const restingArmRad = Math.PI * (-70 / 180);
      if (rightUpperArm) rightUpperArm.rotation.z = -restingArmRad;
      if (leftUpperArm) leftUpperArm.rotation.z = restingArmRad;

      vrm.springBoneManager?.reset();
    }, [gltf]);

    // --- フレームごとのアニメーション制御 ---
    useFrame((state, delta) => {
      const vrm = vrmRef.current;
      if (!vrm?.expressionManager || !vrm.humanoid) return;

      const clampedDelta = Math.min(delta, 1 / 20);
      const manager = vrm.expressionManager;
      const humanoid = vrm.humanoid;
      const clockTime = state.clock.elapsedTime;

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

      // 瞬き制御（簡易版で十分機能するため、シンプルに維持）
      const blinkValue = Math.max(0, Math.sin(clockTime * 2.0) - 0.8) * 5;
      manager.setValue(VRMExpressionPresetName.Blink, blinkValue);

      // 表情制御
      Object.values(VRMExpressionPresetName).forEach((preset) => {
        if (
          preset === VRMExpressionPresetName.Blink ||
          preset === VRMExpressionPresetName.Aa
        )
          return;
        let targetWeight = preset === emotion ? 1.0 : 0.0;
        // thinkingの表情を再現
        if (
          emotion === "thinking" &&
          preset === VRMExpressionPresetName.Neutral
        )
          targetWeight = 0.5;
        if (emotion === "thinking" && preset === VRMExpressionPresetName.Oh)
          targetWeight = 0.15;

        const currentWeight = manager.getValue(preset) ?? 0.0;
        manager.setValue(
          preset,
          THREE.MathUtils.lerp(currentWeight, targetWeight, clampedDelta * 8.0)
        );
      });

      // 体の動き（アニメーション）制御
      const head = humanoid.getNormalizedBoneNode(VRMHumanBoneName.Head);
      const neck = humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck);
      const spine = humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine);
      const lerpFactor = clampedDelta * 2.0;

      // emotionに応じたアニメーションの切り替え
      switch (emotion) {
        case "sad":
          if (head) {
            head.rotation.x = THREE.MathUtils.lerp(
              head.rotation.x,
              0.25,
              lerpFactor
            );
            head.rotation.y = THREE.MathUtils.lerp(
              head.rotation.y,
              0,
              lerpFactor
            );
          }
          if (gltf.scene)
            gltf.scene.position.y = THREE.MathUtils.lerp(
              gltf.scene.position.y,
              -0.12,
              lerpFactor
            );
          break;
        case "thinking":
          if (head) {
            head.rotation.x = THREE.MathUtils.lerp(
              head.rotation.x,
              0.15,
              lerpFactor
            );
            head.rotation.y = THREE.MathUtils.lerp(
              head.rotation.y,
              Math.sin(clockTime * 0.5) * 0.15,
              lerpFactor
            );
          }
          if (spine)
            spine.rotation.y = THREE.MathUtils.lerp(
              spine.rotation.y,
              Math.sin(clockTime * 0.3) * 0.05,
              lerpFactor
            );
          break;
        default: // normal, happyなど
          if (head) {
            head.rotation.x = THREE.MathUtils.lerp(
              head.rotation.x,
              Math.sin(clockTime * 0.55) * 0.05,
              lerpFactor
            );
          }
          if (neck) {
            neck.rotation.y = THREE.MathUtils.lerp(
              neck.rotation.y,
              Math.sin(clockTime * 0.6) * 0.2,
              lerpFactor
            );
          }
          if (spine) {
            spine.rotation.y = THREE.MathUtils.lerp(
              spine.rotation.y,
              Math.sin(clockTime * 0.4) * 0.1,
              lerpFactor
            );
          }
          if (gltf.scene)
            gltf.scene.position.y = THREE.MathUtils.lerp(
              gltf.scene.position.y,
              -0.1,
              lerpFactor
            );
          break;
      }

      // VRMモデル全体の更新
      vrm.update(clampedDelta);
    });

    // モデルのY軸オフセットを-0.1に設定
    return (
      <>
        <primitive object={gltf.scene} position={[0, -0.1, 0]} dispose={null} />
        <mesh
          ref={interactionRef}
          position={[0, 1.35, 0.1]} // 頭の位置に合わせる
          onClick={onHeadClick}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </>
    );
  }
);

VRMViewer.displayName = "VRMViewer";
