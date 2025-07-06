import {
  getChildSummary,
  upsertChildSummary,
} from "@/entities/child-summary/services/repository";
import {
  addConversation,
  countConversationsByChildId,
  getConversationsByChildId,
} from "@/entities/conversation/services/repository";
import {
  MAX_CONVERSATION_HISTORY,
  SUMMARY_TRIGGER_COUNT,
} from "@/features/chat/lib/constants";
import {
  createAiSystemPrompt,
  createSummaryPrompt,
} from "@/features/chat/lib/prompts";
import {
  encodePcmToWav,
  generateRawAudioData,
  generateSummary,
  generateTextResponse,
  HistoryMessage,
} from "@/features/chat/services/gemini.service";
import { NextRequest, NextResponse } from "next/server";

// リクエストボディの型を明確に定義
type ChatRequest = {
  message: string;
  mode: "fast" | "slow";
  childId: string | null;
  history: { role: "user" | "ai"; text: string }[] | null;
};

export async function POST(req: NextRequest) {
  try {
    const { message, mode, childId, history } =
      (await req.json()) as ChatRequest;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    let summary: string | null = null;
    let conversationHistory: HistoryMessage[] = [];

    // --- 1. コンテキストの準備 (DBまたはリクエストから) ---
    if (childId) {
      // 通常モード
      const [summaryResult, dbHistory, conversationCount] = await Promise.all([
        getChildSummary(childId),
        getConversationsByChildId(childId, MAX_CONVERSATION_HISTORY),
        countConversationsByChildId(childId),
      ]);
      summary = summaryResult?.summary ?? null;
      conversationHistory = dbHistory.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      if (
        conversationCount > 0 &&
        conversationCount % SUMMARY_TRIGGER_COUNT === 0
      ) {
        triggerSummarization(childId);
      }
    } else if (history) {
      // デモモード
      conversationHistory = history.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));
    }

    // --- 2. AIによる応答生成 ---
    const systemPrompt = createAiSystemPrompt(summary);
    // ユーザーからの新しいメッセージをシステムプロンプトと結合
    const fullMessage = systemPrompt + "\n\n" + message;
    const contents = [
      ...conversationHistory,
      { role: "user" as const, parts: [{ text: fullMessage }] },
    ];

    const { responseText, emotion } = await generateTextResponse(
      contents,
      mode
    );
    // --- 3. 音声生成とDB保存 (並列実行から直列実行へ変更) ---
    if (childId) {
      // 先にユーザーのメッセージをDBに保存し、完了を待つ
      await addConversation({
        child_id: childId,
        role: "user",
        content: message,
        emotion: null, // ユーザーメッセージに感情はない
      });

      // 次にAIの応答をDBに保存する
      const saveAiConversation = addConversation({
        child_id: childId,
        role: "ai",
        content: responseText,
        emotion: emotion,
      });

      // AIの音声生成とDB保存は並列でOK
      const [rawAudio] = await Promise.all([
        generateRawAudioData(responseText, mode),
        saveAiConversation, // AI会話の保存処理も待機
      ]);
      const wavAudio = await encodePcmToWav(rawAudio);

      return NextResponse.json({
        emotion: emotion,
        textResponse: responseText,
        audioData: wavAudio,
      });
    } else {
      // デモモードの場合 (DB保存なし)
      const rawAudio = await generateRawAudioData(responseText, mode);
      const wavAudio = await encodePcmToWav(rawAudio);

      return NextResponse.json({
        emotion: emotion,
        textResponse: responseText,
        audioData: wavAudio,
      });
    }
  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: { message: errorMessage } },
      { status: 500 }
    );
  }
}

async function triggerSummarization(childId: string): Promise<void> {
  console.log(`Summarization triggered for child: ${childId}`);
  try {
    const conversations = await getConversationsByChildId(childId, 50);
    if (conversations.length < SUMMARY_TRIGGER_COUNT) return;

    const conversationText = conversations
      .map((c) => `${c.role === "user" ? "子ども" : "ニア"}: ${c.content}`)
      .join("\n");

    const summaryPrompt = createSummaryPrompt(conversationText);
    const newSummary = await generateSummary(summaryPrompt);

    if (newSummary.trim().length > 0) {
      await upsertChildSummary(childId, newSummary);
    }
  } catch (error) {
    console.error(`[Summarize] Error for child ${childId}:`, error);
  }
}
