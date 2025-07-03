import {
  extractTopics,
  getRiskScores,
} from "@/features/chat/services/gemini.service";
import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. セキュリティチェック
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. リクエストから情報を取得
  const { record: conversation } = await req.json();
  if (conversation.role !== "user") {
    return NextResponse.json({
      success: true,
      message: "Skipped analysis for AI message.",
    });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  try {
    // 3. Gemini APIを呼び出して、並行して分析を実行
    const [scores, topics] = await Promise.all([
      getRiskScores(conversation.content),
      extractTopics(conversation.content),
    ]);

    // 4. 分析結果をDBに保存
    await supabaseAdmin.from("mental_health_scores").insert({
      child_id: conversation.child_id,
      conversation_id: conversation.id,
      scores: scores,
    });

    // 5. 抽出したトピックをDBに保存または更新 (Upsert)
    if (topics && topics.length > 0) {
      const topicUpserts = topics.map((topic) => ({
        child_id: conversation.child_id,
        topic: topic,
        last_mentioned_at: new Date().toISOString(),
      }));
      // pg-promiseなどを使えば、より効率的なバルクUPSERT with incrementが可能
      // ここでは簡潔さのために、個別にUpsertを実行
      for (const t of topicUpserts) {
        await supabaseAdmin.rpc("increment_topic_mention", {
          p_child_id: t.child_id,
          p_topic: t.topic,
        });
      }
    }

    // 6. アラート判定と通知
    const alertThreshold = 0.8;
    if (
      scores.self_harm_risk_score > alertThreshold ||
      scores.urgency_score > alertThreshold
    ) {
      // 親のメールアドレスを取得
      const { data: childData } = await supabaseAdmin
        .from("children")
        .select("managed_by_user_id")
        .eq("id", conversation.child_id)
        .single();
      if (childData) {
        const { data: parentData } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("id", childData.managed_by_user_id)
          .single();
        if (parentData?.email) {
          // 通知サービスAPIを呼び出す（フェイルセーフのため、このリクエストの完了は待たない）
          fetch(new URL("/api/alert/notify", process.env.AUTH_URL), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`,
            },
            body: JSON.stringify({
              parent_email: parentData.email,
              child_id: conversation.child_id,
              detected_keyword: "深刻な会話内容", // より抽象的な表現に
              message_content: conversation.content, // 参考情報として渡す
            }),
          }).catch((e) => console.error("Failed to call notify API:", e));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analysis API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
