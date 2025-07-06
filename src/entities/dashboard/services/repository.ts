"use server";

import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";

// 日付のヘルパー関数
const getISODateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

/**
 * ダッシュボードに必要なすべてのデータを取得・整形する関数
 * @param childId - データを取得する子供のID
 * @returns 整形済みのダッシュボードデータ
 */
export async function getDashboardData(childId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const sevenDaysAgo = getISODateDaysAgo(7);
  const fourteenDaysAgo = getISODateDaysAgo(14);

  // 1. 会話データを過去14日分取得（今週と先週を比較するため）
  const { data: activityData, error: activityError } = await supabaseAdmin
    .from("conversations")
    .select("created_at, emotion")
    .eq("child_id", childId)
    .gte("created_at", fourteenDaysAgo);

  // 2. 最新のアラート状況を取得
  // (要件定義に基づき、アラートは特別なテーブルで管理されている想定)
  const { data: latestAlert, error: alertError } = await supabaseAdmin
    .from("mental_health_scores") // このテーブルは既に存在
    .select("scores, analyzed_at")
    .eq("child_id", childId)
    .eq("is_alert_triggered", true) // is_alert_triggeredがtrueのものだけ取得
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .single();

  if (activityError || (alertError && alertError.code !== "PGRST116")) {
    console.error({ activityError, alertError });
    throw new Error("Failed to fetch dashboard data.");
  }

  // --- ここからデータをUIで使いやすい形に整形 ---

  // 3. 会話頻度を計算
  const thisWeekConversations =
    activityData?.filter((a) => a.created_at >= sevenDaysAgo).length || 0;
  const lastWeekConversations =
    activityData?.filter((a) => a.created_at < sevenDaysAgo).length || 0;
  const conversationCount = thisWeekConversations / 2; // userとaiのペアで1回とカウント

  let frequencyChangeText = "最近ニアとのお話を始めたばかりです。";
  if (lastWeekConversations > 0) {
    const changeRatio = thisWeekConversations / lastWeekConversations;
    if (changeRatio > 1.2) {
      frequencyChangeText = "先週と比べて、ニアと話す回数が少し増えました。";
    } else if (changeRatio < 0.8) {
      frequencyChangeText =
        "先週と比べて、ニアと話す回数は少し落ち着いています。";
    } else {
      frequencyChangeText =
        "先週と同じくらいのペースで、ニアとお話ししています。";
    }
  }

  // 4. 感情の多様性を計算 (今週のデータのみ対象)
  const positiveEmotions = ["happy", "joy"]; // 必要に応じて拡張
  const negativeEmotions = ["sad", "angry", "sorrow"];
  const emotionalSpectrum = { positive: 0, negative: 0, neutral: 0 };
  activityData?.forEach((item) => {
    if (item.created_at >= sevenDaysAgo && item.emotion) {
      if (positiveEmotions.includes(item.emotion)) emotionalSpectrum.positive++;
      else if (negativeEmotions.includes(item.emotion))
        emotionalSpectrum.negative++;
      else emotionalSpectrum.neutral++;
    }
  });

  // 5. メンタルヘルス・アラートの整形
  const alert = latestAlert
    ? {
        title: "大切なお知らせ",
        description:
          "最近、お子様が少し心に大きな負担を抱えているサインが見られます。これは必ずしも深刻な状況を示すものではありませんが、専門家への相談もご検討ください。",
        link: "https://kokoro.ncnp.go.jp/", // こころの情報サイト
        linkText: "公的な相談窓口を見る",
      }
    : null;

  return {
    activity: {
      count: conversationCount, // 今週の会話回数
      changeText: frequencyChangeText,
    },
    emotionalSpectrum,
    alert,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
