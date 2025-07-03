"use client";

// データとして渡されるオブジェクトの型定義
interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

// ドーナツチャートを描画する、依存関係ゼロのコンポーネント
const SimpleDonutChart = ({ data }: { data: ChartDataItem[] }) => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  if (total === 0) {
    return (
      <div className="text-center text-gray-400 h-32 flex items-center justify-center">
        データがありません
      </div>
    );
  }

  // 背景の円
  const backgroundCircle = <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e5e7eb" strokeWidth="20" />;

  let accumulatedPercentage = 0;

  return (
    <div className="flex items-center justify-center space-x-6">
      <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
        {backgroundCircle}
        {data.map((item, index) => {
          if(item.value === 0) return null;
          const percentage = item.value / total;
          const strokeDasharray = `${percentage * 314} 314`; // 2 * PI * 50
          const strokeDashoffset = -accumulatedPercentage * 314;
          accumulatedPercentage += percentage;
          
          return (
            <circle
              key={index}
              cx="60"
              cy="60"
              r="50"
              fill="transparent"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, index) => (
          item.value > 0 && (
            <div key={index} className="flex items-center text-sm">
              <span style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-2"></span>
              <span className="text-gray-600">{item.name}</span>
              <span className="ml-auto font-medium">{item.value}件</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};


export function EmotionChart({ data }: Props) {
  const chartData: ChartDataItem[] = [
    { name: 'ポジティブ', value: data.positive, color: '#34D399' },
    { name: 'ネガティブ', value: data.negative, color: '#F87171' },
    { name: 'その他', value: data.neutral, color: '#A9A9A9' },
  ];
  return <SimpleDonutChart data={chartData} />;
}