"use client";

interface Topic {
  text: string;
  value: number;
}

interface Props {
  topics: Topic[];
}

// 依存関係ゼロのトピッククラウド（タグクラウド）コンポーネント
export function TopicCloud({ topics }: Props) {
  if (topics.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 h-[250px] flex items-center justify-center">
        まだお話しのトピックがありません
      </div>
    );
  }

  // valueの最大値と最小値を見つけて、フォントサイズを正規化する
  const counts = topics.map(t => t.value);
  const minSize = 14; // 最小フォントサイズ
  const maxSize = 36; // 最大フォントサイズ
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  const getFontSize = (value: number) => {
    if (maxCount === minCount) return minSize;
    const normalized = (value - minCount) / (maxCount - minCount);
    return minSize + (normalized * (maxSize - minSize));
  };
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-4">
      {topics.map((topic) => (
        <span
          key={topic.text}
          className="font-display text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          style={{ fontSize: `${getFontSize(topic.value)}px` }}
        >
          {topic.text}
        </span>
      ))}
    </div>
  );
}