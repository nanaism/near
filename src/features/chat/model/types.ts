import type { VRMExpressionPresetName } from "@pixiv/three-vrm";

/**
 * AIの感情表現と状態を示す型
 */
export type Emotion = VRMExpressionPresetName | "thinking";

/**
 * フロントエンドで扱うメッセージオブジェクトの型
 */
export type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  audioData?: string; // Base64 WAV data from API
  audioUrl?: string; // for pre-recorded sounds like greetings
  emotion?: Emotion;
};
