import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  AlertTriangle,
  Bot,
  FileText,
  Handshake,
  ShieldCheck,
  UserSquare,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold">プライバシーポリシー</h1>
          <p className="text-muted-foreground mt-2">
            あなたの大切な情報をどう扱うかのお約束です。
          </p>
        </header>

        {/* --- 子供向けセクション --- */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <ShieldCheck className="w-8 h-8 text-green-500" />
              <span className="text-2xl">【こどもむけ】おやくそく</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-relaxed text-gray-800">
            <p>
              ニアとのおはなしは、あなたとニアだけの
              <strong className="text-green-700">ひみつ</strong>です。
            </p>
            <p>
              あなたの許可なく、他の人に話したり、見せたりすることは絶対にありません。
            </p>
            <p>
              もし、あなたがすごく困っていたり、こころやからだが大変なことになっているとニアが感じたときは、あなたを守るために、信頼できる大人（おうちの人など）に
              <strong className="text-orange-600">
                「たすけて！」のサインだけ
              </strong>
              をそっと送ることがあります。でも、そのときも「何を話したか」のひみつは絶対に守るから安心してね。
            </p>
          </CardContent>
        </Card>

        {/* --- 保護者向けセクション --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-800">
              <UserSquare className="w-8 h-8 text-blue-500" />
              <span className="text-2xl">
                【保護者の方へ】プライバシーポリシー
              </span>
            </CardTitle>
            <CardDescription>最終更新日: 2025年7月3日</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <p>
              Near
              Project（以下「当方」といいます）は、提供するアプリケーション「Near」（以下「本サービス」といいます）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
            </p>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText size={20} />
                第1条（取得する情報及び利用目的）
              </h3>
              <p>
                本サービスにおいて取得するユーザー情報は、その取得方法に応じて以下のとおりです。
              </p>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>
                  <strong>保護者様からご提供いただく情報</strong>
                  <br />
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>
                      氏名、メールアドレス、プロフィール画像等のGoogleアカウント情報
                    </li>
                    <li>
                      <strong>利用目的:</strong>{" "}
                      本サービスのユーザー認証、アカウント管理、及び円滑なサービス提供のため。
                    </li>
                  </ul>
                </li>
                <li>
                  <strong>
                    お子様が本サービスを利用するにあたり取得する情報
                  </strong>
                  <br />
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>お子様のニックネーム</li>
                    <li>AIとの会話履歴（テキストデータ、感情データ）</li>
                    <li>
                      AIが会話履歴を元に生成した、お子様に関する情報の要約
                    </li>
                    <li>
                      <strong>利用目的:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>
                          会話AIがお子様との対話を記憶し、よりパーソナライズされた体験を提供するため。
                        </li>
                        <li>
                          お子様の精神状態の分析を行い、保護者向けダッシュボードに統計情報（会話の具体的な内容を含まない）を提供するため。
                        </li>
                        <li>
                          お子様に深刻な精神的苦痛や危険が認められるとAIが判断した場合、保護者様へ注意喚起の通知を行うため。
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Handshake size={20} />
                第2条（第三者提供）
              </h3>
              <p>
                当方は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>法令に基づく場合。</li>
                <li>
                  人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき。
                </li>
                <li>
                  サービスの提供に必要な範囲内において、以下の提携先に個人情報を提供する場合：
                  <br />
                  - Google LLC (ユーザー認証、AI API利用のため)
                  <br />- Supabase, Inc. (データベース、インフラ提供のため)
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Bot size={20} />
                第3条（お子様の会話内容の取扱い）
              </h3>
              <p>
                お子様とAIとの具体的な会話内容は、最大限のプライバシー保護対象とします。当方は、保護者様に対して、お子様の具体的な会話履歴を直接的に開示することはありません。保護者様へ提供される情報は、あくまでAIによる分析結果の概要及び統計情報に限定されます。
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertTriangle size={20} />
                第4条（お問い合わせ窓口）
              </h3>
              <p>
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
              </p>
              <p>
                氏名: 大賀 愛一郎
                <br />
                メールアドレス: datealife2525@gmail.com
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
