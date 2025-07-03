"use client";

import { DonutChart, Legend } from "@tremor/react";

interface Props {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export function EmotionChart({ data }: Props) {
  // Tremorが期待するデータ形式に変換
  const chartData = [
    { name: "ポジティブな会話", value: data.positive },
    { name: "ネガティブな会話", value: data.negative },
    { name: "その他の会話", value: data.neutral },
  ];

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-tremor-content dark:text-dark-tremor-content h-48 flex items-center justify-center">
        まだ感情のデータがありません
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-6">
      <DonutChart
        data={chartData}
        category="value"
        index="name"
        // 色の定義
        colors={["emerald", "rose", "slate"]}
        className="w-40"
      />
      <Legend
        categories={["ポジティブな会話", "ネガティブな会話", "その他の会話"]}
        colors={["emerald", "rose", "slate"]}
        className="max-w-xs"
      />
    </div>
  );
}
