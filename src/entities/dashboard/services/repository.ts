"use server";

import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";

/**
 * ダッシュボードに必要なすべてのデータを取得・整形する関数
 * @param childId - データを取得する子供のID
 * @returns 整形済みのダッシュボードデータ
 */
export async function getDashboardData(childId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // 1. 会話の頻度（過去7日間）を取得
  const { data: activityData, error: activityError } = await supabaseAdmin
    .from("conversations")
    .select("created_at")
    .eq("child_id", childId)
    .gte("created_at", sevenDaysAgo);

  // 2. 感情の多様性（過去7日間）を取得
  const { data: emotionData, error: emotionError } = await supabaseAdmin
    .from("conversations")
    .select("emotion")
    .eq("child_id", childId)
    .in("role", ["ai"]) // AIの返答感情をベースにする
    .gte("created_at", sevenDaysAgo);

  // 3. 関心トピック（上位10件）を取得
  const { data: topicData, error: topicError } = await supabaseAdmin
    .from("child_topic_trends")
    .select("topic, mention_count")
    .eq("child_id", childId)
    .order("mention_count", { ascending: false })
    .limit(10);

  // 4. 最新のメンタルヘルススコアを取得 (アラート判定用)
  const { data: latestScore, error: scoreError } = await supabaseAdmin
    .from("mental_health_scores")
    .select("scores, is_alert_triggered")
    .eq("child_id", childId)
    .order("analyzed_at", { ascending: false })
    .limit(1)
    .single();

  if (
    activityError ||
    emotionError ||
    topicError ||
    (scoreError && scoreError.code !== "PGRST116")
  ) {
    console.error({ activityError, emotionError, topicError, scoreError });
    throw new Error("Failed to fetch dashboard data.");
  }

  // --- ここからデータをUIで使いやすい形に整形 ---

  // 感情のカテゴリ分け
  const positiveEmotions = ["happy", "joy"];
  const negativeEmotions = ["sad", "angry", "sorrow"];
  const emotionalSpectrum = { positive: 0, negative: 0, neutral: 0 };
  emotionData?.forEach((item) => {
    if (positiveEmotions.includes(item.emotion || ""))
      emotionalSpectrum.positive++;
    else if (negativeEmotions.includes(item.emotion || ""))
      emotionalSpectrum.negative++;
    else emotionalSpectrum.neutral++;
  });

  const alert = latestScore?.is_alert_triggered
    ? {
        title: "【重要】専門家への相談もご検討ください",
        description:
          "ニアとの対話の中で、お子様が心に大きな負担を抱えている可能性を示唆する、いくつかの強いサインが継続的に見られました。専門家への相談もご検討ください。",
      }
    : null;

  return {
    activity: {
      total: activityData?.length || 0,
    },
    emotionalSpectrum,
    topics:
      topicData?.map((t) => ({ text: t.topic, value: t.mention_count })) || [],
    alert: alert,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
