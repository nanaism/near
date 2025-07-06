"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Info } from "lucide-react";

export function MonitoringPulseAlert() {
  return (
    <Alert className="relative overflow-hidden bg-blue-50 border-blue-200">
      {/* --- パルスアニメーション --- */}
      <div className="absolute left-7 top-6 h-12 w-12">
        <div
          className="absolute h-full w-full animate-[radar-pulse_2.5s_ease-out_infinite] rounded-full bg-blue-200"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute h-full w-full animate-[radar-pulse_2.5s_ease-out_infinite] rounded-full bg-blue-200"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute h-full w-full animate-[radar-pulse_2.5s_ease-out_infinite] rounded-full bg-blue-200"
          style={{ animationDelay: "1.0s" }}
        />
      </div>

      {/* 
        - grid: CSS Gridを有効化
        - grid-cols-[auto_1fr]: 2列のグリッドを定義。
          - auto: 1列目はコンテンツ（アイコン）の幅に自動で合わせる
          - 1fr: 2列目は残りのスペースをすべて使う（1 fraction）
        - gap-x-4: 列間のスペースを確保
      */}
      <div className="relative z-10 grid grid-cols-[auto_1fr] items-start gap-x-4">
        {/* --- 1列目: アイコン --- */}
        {/* mt-1でタイトルのテキストと高さを微調整 */}
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600 mt-1" />

        {/* --- 2列目: テキストブロック --- */}
        <div>
          <AlertTitle className="mb-1 text-blue-800">
            お子さまを見守っています
          </AlertTitle>
          <AlertDescription className="text-blue-700 leading-relaxed">
            ニアは、お子さまの心の健康を常に見守っています。特に懸念される点が見つかった場合は、この場所でお知らせします。
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
