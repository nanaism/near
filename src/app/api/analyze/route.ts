import {
  getRiskScores,
  isRiskyContent,
} from "@/features/chat/services/gemini.service";
import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1. セキュリティチェック (変更なし)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. リクエストから情報を取得 (変更なし)
  const { record: conversation } = await req.json();
  if (!conversation || conversation.role !== "user") {
    return NextResponse.json({
      success: true,
      message: "Skipped analysis for non-user message.",
    });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  try {
    // --- 新しい分析ロジック ---

    // ステップ1: 初期フィルタリング
    const isPotentiallyRisky = await isRiskyContent(conversation.content);

    if (!isPotentiallyRisky) {
      console.log(
        `[Analyze] Skipped analysis for conversation ID: ${conversation.id}. Content was not deemed risky.`
      );
      return NextResponse.json({
        success: true,
        message: "Skipped: Content not risky.",
      });
    }

    console.log(
      `[Analyze] Content deemed risky. Proceeding with full analysis for conversation ID: ${conversation.id}.`
    );

    // ステップ2: 詳細なリスクスコアリング
    const scores = await getRiskScores(conversation.content);

    // ステップ3: アラート判定
    const ALERT_THRESHOLD = 0.8;
    const isAlertTriggered =
      scores.self_harm_risk_score >= ALERT_THRESHOLD ||
      scores.urgency_score >= ALERT_THRESHOLD;

    // ステップ4: 分析結果をDBに保存
    const { error: insertError } = await supabaseAdmin
      .from("mental_health_scores")
      .insert({
        child_id: conversation.child_id,
        conversation_id: conversation.id,
        scores: scores,
        is_alert_triggered: isAlertTriggered, // 判定結果も保存
      });

    if (insertError) {
      console.error("Failed to insert mental health scores:", insertError);
      // ここではエラーをスローせず、通知処理は試みる
    }

    // ステップ5: アラート通知 (必要な場合のみ)
    if (isAlertTriggered) {
      console.warn(
        `[ALERT] High risk detected for child ID: ${conversation.child_id}. Triggering notification.`
      );

      // 親のメールアドレスを取得
      const { data: childData } = await supabaseAdmin
        .from("children")
        .select("managed_by_user_id")
        .eq("id", conversation.child_id)
        .single();

      if (childData?.managed_by_user_id) {
        const { data: parentData } = await supabaseAdmin
          .from("users")
          .select("email")
          .eq("id", childData.managed_by_user_id)
          .single();

        if (parentData?.email) {
          // 外部通知サービスAPIを呼び出す（このリクエストの完了は待たない）
          // 将来的にResendなどを呼び出すためのフック
          fetch(new URL("/api/alert/notify", process.env.AUTH_URL), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`,
            },
            body: JSON.stringify({
              parent_email: parentData.email,
              child_id: conversation.child_id,
              scores, // 参考情報としてスコアを渡す
            }),
          }).catch((e) => console.error("Failed to call notify API:", e));
        }
      }
    }

    return NextResponse.json({ success: true, scores });
  } catch (error) {
    console.error("Analysis API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
