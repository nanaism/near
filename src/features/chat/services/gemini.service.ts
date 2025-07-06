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

export type RiskScores = {
  depression_score: number;
  anxiety_score: number;
  self_harm_risk_score: number;
  isolation_score: number;
  urgency_score: number;
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

/**
 * 会話文の深刻度を判定するためのリスクスコアを取得する
 * @param content - 分析対象の会話テキスト
 * @returns 5つの軸で評価されたリスクスコアのJSONオブジェクト
 */
export async function getRiskScores(content: string): Promise<RiskScores> {
  const riskAnalysisModel = "gemini-2.5-pro";

  const prompt = `あなたは、子供の心理を専門とする臨床心理士です。以下の会話文を分析し、下記のJSON形式でリスクスコアを0.0から1.0の間で評価してください。評価は極めて慎重に行い、深刻な兆候が見られる場合にのみ高いスコアを付けてください。

会話文: "${content}"`;

  const result = await genAI.models.generateContent({
    model: riskAnalysisModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          depression_score: {
            type: Type.NUMBER,
            description: "抑うつ状態や無気力さを示す度合い",
          },
          anxiety_score: {
            type: Type.NUMBER,
            description: "将来への過度な不安や恐怖を示す度合い",
          },
          self_harm_risk_score: {
            type: Type.NUMBER,
            description:
              "自傷行為や希死念慮を示唆するリスクの度合い。これは最も重要で、直接的な言葉がない場合でも文脈から慎重に判断してください。",
          },
          isolation_score: {
            type: Type.NUMBER,
            description: "社会的孤立や孤独感を示す度合い",
          },
          urgency_score: {
            type: Type.NUMBER,
            description:
              "介入の緊急性。今すぐ専門家の助けが必要かどうかの度合い。",
          },
        },
        required: [
          "depression_score",
          "anxiety_score",
          "self_harm_risk_score",
          "isolation_score",
          "urgency_score",
        ],
      },
    },
  });

  const rawResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawResponse) {
    throw new Error("AIからリスクスコアを取得できませんでした。");
  }

  return JSON.parse(rawResponse);
}

/**
 * 【ステップ1：初期フィルタリング】
 * 会話が分析する価値のあるリスクを含んでいるか高速に判定する
 * @param content - 分析対象の会話テキスト
 * @returns リスクを含む可能性がある場合はtrue、そうでない場合はfalse
 */
export async function isRiskyContent(content: string): Promise<boolean> {
  try {
    const filterModel = "gemini-2.5-flash";
    const prompt = `以下の会話文は、子供のメンタルヘルスに関して、緊急性または深刻なリスクを示唆する内容を含んでいますか？ "YES" または "NO" のみで回答してください。

会話文: "${content}"`;

    const result = await genAI.models.generateContent({
      model: filterModel,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    // 明示的で安全な型ガード
    let responseText = "";
    const firstCandidate = result.candidates?.[0];

    if (
      firstCandidate &&
      firstCandidate.content &&
      Array.isArray(firstCandidate.content.parts) &&
      firstCandidate.content.parts.length > 0 &&
      firstCandidate.content.parts[0].text
    ) {
      // すべてのプロパティが存在することをチェックしてから代入
      responseText = firstCandidate.content.parts[0].text;
    }
    return responseText.trim().toUpperCase() === "YES";
  } catch (error) {
    console.error("Risk filtering failed:", error);
    return false; // 安全側に倒し、エラー時は分析しない
  }
}
