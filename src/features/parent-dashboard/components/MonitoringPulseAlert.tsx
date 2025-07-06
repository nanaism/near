"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Info } from "lucide-react";

export function MonitoringPulseAlert() {
  return (
    // overflow-hiddenで波がカードからはみ出さないようにする
    <Alert className="relative overflow-hidden bg-blue-50 border-blue-200">
      {/* --- パルスアニメーションのコンテナ --- */}
      <div className="absolute left-7 top-6 h-12 w-12">
        {/* 3つのdivを重ねて、それぞれに遅延（delay）を設定することで連続的な波紋を表現 */}
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

      {/* --- テキストコンテンツ (波の上に表示) --- */}
      {/* z-10とposition:relativeで、コンテンツを波(z-0)の上に配置する */}
      <div className="relative z-10 flex items-start gap-4">
        {/* アイコンもコンテンツの一部として配置 */}
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="flex-1">
          <AlertTitle className="mb-1 text-blue-800">
            お子様を見守っています
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            ニアは、お子様の心の健康を常に見守っています。特に懸念される点が見つかった場合は、この場所でお知らせします。
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
