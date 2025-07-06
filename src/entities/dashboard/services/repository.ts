"use server";

import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";

type WeatherReport = {
  icon: "☀️" | "🌤️" | "😌" | "☁️";
  text: string;
};

type ConversationStarter = {
  text: string;
} | null;

// alertの型を独立させる
type AlertData = {
  title: string;
  description: string;
  link: string;
  linkText: string;
} | null;

// 新しいDashboardDataの型定義
export type DashboardData = {
  weatherReport: WeatherReport;
  conversationStarter: ConversationStarter;
  alert: AlertData;
};

// --- ヘルパー関数 ---
const getISODateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// --- メイン関数  ---
export async function getDashboardData(
  childId: string
): Promise<DashboardData> {
  const supabaseAdmin = createSupabaseAdminClient();
  const sevenDaysAgo = getISODateDaysAgo(7);
  const fourteenDaysAgo = getISODateDaysAgo(14);

  // 1. 過去14日分の会話データと、最新のトピック、アラート状況を並行して取得
  const [activityResult, topicResult, alertResult] = await Promise.all([
    supabaseAdmin
      .from("conversations")
      .select("created_at, emotion")
      .eq("child_id", childId)
      .gte("created_at", fourteenDaysAgo),
    supabaseAdmin
      .from("child_topic_trends")
      .select("topic")
      .eq("child_id", childId)
      .order("last_mentioned_at", { ascending: false })
      .limit(1)
      .single(),
    supabaseAdmin
      .from("mental_health_scores")
      .select("scores, analyzed_at")
      .eq("child_id", childId)
      .eq("is_alert_triggered", true)
      .order("analyzed_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const { data: activityData, error: activityError } = activityResult;
  if (activityError) throw new Error("Failed to fetch activity data.");

  // --- 2. 天気予報の指標を計算 ---
  const thisWeekConversations =
    activityData?.filter((a) => a.created_at >= sevenDaysAgo) || [];
  const lastWeekConversations =
    activityData?.filter((a) => a.created_at < sevenDaysAgo) || [];

  const activityRatio =
    lastWeekConversations.length > 0
      ? thisWeekConversations.length / lastWeekConversations.length
      : thisWeekConversations.length > 0
      ? 2
      : 1;
  let activityLevel: "high" | "normal" | "low" = "normal";
  if (activityRatio > 1.3) activityLevel = "high";
  if (activityRatio < 0.7) activityLevel = "low";

  const uniqueEmotions = new Set(
    thisWeekConversations.map((c) => c.emotion).filter(Boolean)
  );
  const emotionalVariety: "high" | "normal" | "low" =
    uniqueEmotions.size >= 3
      ? "high"
      : uniqueEmotions.size >= 2
      ? "normal"
      : "low";

  const activeDays = new Set(
    thisWeekConversations.map((c) => new Date(c.created_at).getDay())
  ).size;
  const consistency: "high" | "low" = activeDays >= 3 ? "high" : "low";

  // --- 3. 天気予報のテキストとアイコンを決定 ---
  let weatherReport: WeatherReport;
  if (activityLevel === "high" && emotionalVariety === "high") {
    weatherReport = {
      icon: "☀️",
      text: "今週は、ニアといろいろなことをたくさんお話しして、心も晴れやかな一週間だったようです。",
    };
  } else if (emotionalVariety === "high") {
    weatherReport = {
      icon: "🌤️",
      text: "嬉しい気持ちも、少し考え込むような気持ちも。様々な感情をニアに話してくれているようです。心を豊かに表現できていますね。",
    };
  } else if (activityLevel === "low" || consistency === "low") {
    weatherReport = {
      icon: "☁️",
      text: "今週は、少し口数が少なめだったようです。何かに集中しているのかもしれないし、少し一人の時間が必要なのかもしれませんね。",
    };
  } else {
    weatherReport = {
      icon: "😌",
      text: "今週は、いつもと同じくらいのペースで、穏やかにニアとの対話を楽しんでいるようです。",
    };
  }

  // --- 4. 対話のヒントを生成 ---
  let conversationStarter: ConversationStarter = null;
  const topic = topicResult.data?.topic;
  if (topic) {
    let genericTopic = "こと";
    if (
      ["ゲーム", "遊び", "アニメ", "マンガ", "動画"].some((t) =>
        topic.includes(t)
      )
    )
      genericTopic = "好きな遊び";
    else if (
      ["学校", "勉強", "宿題", "友達", "先生"].some((t) => topic.includes(t))
    )
      genericTopic = "学校のこと";
    else if (["夢", "将来", "大人"].some((t) => topic.includes(t)))
      genericTopic = "将来のこと";

    conversationStarter = {
      text: `対話のヒント：最近、**${genericTopic}**に関心があるようです。どんなことを考えているのか、聞いてみるのもいいかもしれませんね。`,
    };
  }

  // --- 5. メンタルヘルスアラートを整形 ---
  const alert: AlertData = alertResult.data
    ? {
        title: "大切なお知らせ",
        description:
          "最近、お子様が少し心に大きな負担を抱えているサインが見られます。これは必ずしも深刻な状況を示すものではありませんが、専門家への相談もご検討ください。",
        link: "https://kokoro.ncnp.go.jp/", // こころの情報サイト
        linkText: "公的な相談窓口を見る",
      }
    : null;

  return { weatherReport, conversationStarter, alert };
}
