// src/app/terms/page.tsx

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  BookOpen,
  BrainCircuit,
  FileText,
  MicOff,
  ShieldAlert,
  UserSquare,
} from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold">利用規約</h1>
          <p className="text-muted-foreground mt-2">
            本サービスをご利用いただく上でのルールです。
          </p>
        </header>

        {/* --- 子供向けセクション --- */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-800">
              <BookOpen className="w-8 h-8 text-orange-500" />
              <span className="text-2xl">【こどもむけ】おやくそく</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-relaxed text-gray-800">
            <p>
              ニアは、あなたのお友達です。なかよく、楽しくお話ししてください。
            </p>
            <p>
              他の人をきずつけたり、いやな気持ちにさせたりする言葉は使わないでください。
            </p>
            <p>うそをついたり、わるいことに使ったりするのはやめてください。</p>
            <p>このおやくそくを守って、ニアとの時間を楽しんでね！</p>
          </CardContent>
        </Card>

        {/* --- 保護者向けセクション --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-800">
              <UserSquare className="w-8 h-8 text-blue-500" />
              <span className="text-2xl">【保護者の方へ】利用規約</span>
            </CardTitle>
            <CardDescription>施行日: 2025年7月3日</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <p>
              この利用規約（以下，「本規約」といいます。）は、Near
              Project（以下，「当方」といいます。）がこのウェブサイト上で提供するサービス「Near」（以下，「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆様（以下，「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
            </p>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText size={20} />
                第1条（適用）
              </h3>
              <p>
                本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されるものとします。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MicOff size={20} />
                第2条（禁止事項）
              </h3>
              <p>
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>
                  当方のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為
                </li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>
                  当方のサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為
                </li>
                <li>その他，当方が不適切と判断する行為</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BrainCircuit size={20} />
                第3条（知的財産権）
              </h3>
              <p>
                3Dモデルを除き、本サービスに含まれるコンテンツ（文章、ソフトウェア等）の著作権は、当方に帰属します。ユーザーがお子様との対話を通じて生成したコンテンツ（会話テキスト等）の著作権はユーザーに帰属しますが、ユーザーは当方に対し、本サービスの提供、維持、改善、及び分析に必要な範囲で、当該コンテンツを無償で非独占的に使用する権利を許諾するものとします。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShieldAlert size={20} />
                第4条（免責事項）
              </h3>
              <p>
                本サービスは、AIを用いてお子様の精神的安定を支援することを目的としていますが、医療行為またはそれに代替するものではありません。AIによる分析や応答の正確性、完全性、有用性を保証するものではありません。
              </p>
              <p>
                本サービスの利用に関連してユーザーに生じた一切の損害について、当方に故意または重過失がある場合を除き、責任を負わないものとします。
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" passHref>
            <Button variant="outline">トップにもどる</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
