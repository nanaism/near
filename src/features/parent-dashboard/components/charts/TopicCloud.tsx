"use client";

import WordCloud from "react-d3-cloud";

interface Word {
  text: string;
  value: number;
}

interface Props {
  topics: Word[];
}

/**
 *  ワードクラウドの各単語のフォントサイズを決定するコールバック関数。
 * 引数`word`に、私たちが定義した厳格な`Word`型を指定する。
 * @param word - ライブラリが提供する単語オブジェクト
 * @returns フォントサイズ（ピクセル）
 */
const fontSize = (word: Word): number => Math.log2(word.value) * 15 + 16;

export function TopicCloud({ topics }: Props) {
  if (topics.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 h-[300px] flex items-center justify-center">
        まだお話しのトピックがありません
      </div>
    );
  }

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <WordCloud
        data={topics}
        width={500}
        height={300}
        font="var(--font-kiwi-maru)"
        fontSize={fontSize}
        rotate={0}
        padding={5}
        fill={(index: number) =>
          ["#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"][index % 4]
        }
      />
    </div>
  );
}
