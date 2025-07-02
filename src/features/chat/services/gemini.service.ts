import { FinishReason, GoogleGenAI, Type } from "@google/genai";
import WavEncoder from "wav-encoder";

// --- 型定義 ---
export type ChatResponse = {
  emotion: string;
  responseText: string;
};

export type HistoryMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

// --- 初期化 ---
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

/**
 * テキスト応答を生成します。
 * @param contents - AIに渡す会話のコンテキスト
 * @param mode - 'fast' または 'slow'
 * @returns AIからの応答テキストと感情
 */
export async function generateTextResponse(
  contents: HistoryMessage[],
  mode: "fast" | "slow"
): Promise<ChatResponse> {
  const textModel =
    mode === "fast"
      ? "gemini-2.5-flash-lite-preview-06-17"
      : "gemini-2.5-flash";

  const chatResult = await genAI.models.generateContent({
    model: textModel,
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotion: { type: Type.STRING },
          responseText: { type: Type.STRING },
        },
        required: ["emotion", "responseText"],
      },
    },
  });

  let aiResponse: { emotion: string; responseText: string };

  if (chatResult.candidates?.[0]?.finishReason === FinishReason.SAFETY) {
    aiResponse = {
      emotion: "sad",
      responseText:
        "そっか、そんな気持ちなんだね。話してくれてありがとう。どんなことでも、あなたの味方だからね。",
    };
  } else {
    const rawResponse = chatResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawResponse)
      throw new Error("AIから有効な応答を取得できませんでした。");
    aiResponse = JSON.parse(rawResponse);
  }

  const { emotion, responseText } = aiResponse;
  if (!responseText || !emotion) {
    throw new Error("AIからの応答形式が正しくありません。");
  }

  return aiResponse;
}

/**
 * テキストから音声データを生成します。
 * @param text - 音声に変換するテキスト
 * @param mode - 'fast' または 'slow'
 * @returns未加工のPCM音声データ (Base64)
 */
export async function generateRawAudioData(
  text: string,
  mode: "fast" | "slow"
): Promise<string> {
  const ttsModel =
    mode === "fast"
      ? "gemini-2.5-flash-preview-tts"
      : "gemini-2.5-pro-preview-tts";

  const ttsResponse = await genAI.models.generateContent({
    model: ttsModel,
    contents: [{ parts: [{ text: text }] }],
    // configの内容もroute.tsに準拠
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
      },
    },
  });

  const audioBase64 =
    ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64)
    throw new Error("Gemini APIから有効な音声データが返されませんでした。");
  return audioBase64;
}

/**
 * PCM音声データをWAV形式にエンコードします。
 * (ご提供のroute.tsのロジックに完全準拠)
 * @param pcmBase64 - PCM音声データのBase64文字列
 * @returns WAV形式の音声データ (Base64)
 */
export async function encodePcmToWav(pcmBase64: string): Promise<string> {
  const sampleRate = 24000;
  const pcmData = Buffer.from(pcmBase64, "base64");
  const pcm_i16 = new Int16Array(
    pcmData.buffer,
    pcmData.byteOffset,
    pcmData.length / Int16Array.BYTES_PER_ELEMENT
  );
  const pcm_f32 = new Float32Array(pcm_i16.length);
  for (let i = 0; i < pcm_i16.length; i++) {
    pcm_f32[i] = pcm_i16[i] / 32768.0;
  }
  const wavData = await WavEncoder.encode({
    sampleRate: sampleRate,
    channelData: [pcm_f32],
  });
  return Buffer.from(wavData).toString("base64");
}

/**
 * 会話履歴から要約を生成します。
 * @param prompt - 要約生成用のプロンプト
 * @returns 生成された要約テキスト
 */
export async function generateSummary(prompt: string): Promise<string> {
  const summaryModel = "gemini-2.5-pro";
  const result = await genAI.models.generateContent({
    model: summaryModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  // 明示的で安全な型ガード
  let summary = "";
  const firstCandidate = result.candidates?.[0];

  if (
    firstCandidate &&
    firstCandidate.content &&
    Array.isArray(firstCandidate.content.parts) &&
    firstCandidate.content.parts.length > 0 &&
    firstCandidate.content.parts[0].text
  ) {
    // すべてのプロパティが存在することをチェックしてから代入
    summary = firstCandidate.content.parts[0].text;
  }
  return summary;
}
