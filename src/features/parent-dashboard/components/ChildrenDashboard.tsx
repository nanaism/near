"use client";

import type { Child } from "@/entities/child/model/types";
import type { DashboardData } from "@/entities/dashboard/services/repository";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { supabase } from "@/shared/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { AlertTriangle, BarChart, Info, Smile } from "lucide-react";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addChildAction } from "../services/children.actions";
import { EmotionChart } from "./charts/EmotionChart";
import { QrCodeModal } from "./QrCodeModal";

// 型定義
type ChildWithDashboardData = Child & { dashboardData: DashboardData };

// 送信ボタン
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "追加中..." : "追加"}
    </Button>
  );
}

// メインコンポーネント
export function ChildrenDashboard({
  initialChildren,
}: {
  initialChildren: ChildWithDashboardData[];
}) {
  const [children, setChildren] =
    useState<ChildWithDashboardData[]>(initialChildren);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const formRef = useRef<HTMLFormElement>(null);

  const [formState, formAction] = useActionState(addChildAction, {
    success: false,
    message: "",
  });

  // フォーム送信成功時の処理
  useEffect(() => {
    if (formState.success && formState.data) {
      formRef.current?.reset();
      const newChild: ChildWithDashboardData = {
        ...(formState.data as Child),
        dashboardData: {
          activity: { count: 0, changeText: "" },
          emotionalSpectrum: { positive: 0, negative: 0, neutral: 0 },
          alert: null,
        },
      };
      setChildren((prev) => [...prev, newChild]);
    }
  }, [formState]);

  // リアルタイム更新の購読
  useEffect(() => {
    if (status !== "authenticated" || !userId) return;
    const channel: RealtimeChannel = supabase
      .channel(`realtime-children-dashboard:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "children",
          filter: `managed_by_user_id=eq.${userId}`,
        },
        (payload) => {
          setChildren((prev) =>
            prev.filter((child) => child.id !== payload.old.id)
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, userId]);

  return (
    <>
      {/* お子さまを追加するフォーム */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">お子さまを追加</h3>
        <form
          ref={formRef}
          action={formAction}
          className="flex items-center gap-4"
        >
          <Input
            type="text"
            name="nickname"
            placeholder="子供のニックネーム"
            className="flex-1"
            required
          />
          <SubmitButton />
        </form>
        {formState.message && (
          <p
            className={`${
              formState.success ? "text-green-600" : "text-red-500"
            } mt-2 text-sm`}
          >
            {formState.message}
          </p>
        )}
      </div>

      {/* タブ形式のダッシュボード */}
      {children.length > 0 ? (
        <Tabs defaultValue={children[0].id} className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {children.map((child) => (
              <TabsTrigger
                key={child.id}
                value={child.id}
                className="flex items-center gap-2"
              >
                <span>{child.nickname}</span>
                {child.dashboardData.alert && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {children.map((child) => (
            <TabsContent
              key={child.id}
              value={child.id}
              className="mt-6 space-y-6"
            >
              {/* --- メンタルヘルス・アラート --- */}
              {child.dashboardData.alert ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{child.dashboardData.alert.title}</AlertTitle>
                  <AlertDescription>
                    {child.dashboardData.alert.description}
                    {child.dashboardData.alert.link && (
                      <a
                        href={child.dashboardData.alert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 font-bold text-red-700 hover:underline"
                      >
                        {child.dashboardData.alert.linkText}
                      </a>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">
                    お子様を見守っています
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    ニアは、お子様の心の健康を常に見守っています。特に懸念される点が見つかった場合は、この場所でお知らせします。
                  </AlertDescription>
                </Alert>
              )}

              {/* --- コミュニケーション・バイタル --- */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* 会話の頻度カード */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart className="w-5 h-5 text-blue-500" />
                      会話の頻度
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">
                      {Math.round(child.dashboardData.activity.count)}
                      <span className="text-base font-normal text-gray-500">
                        {" "}
                        回
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      この1週間でお話ししました。
                    </p>
                    <p className="text-sm text-blue-600 font-medium mt-3 pt-3 border-t">
                      {child.dashboardData.activity.changeText}
                    </p>
                  </CardContent>
                </Card>

                {/* 感情の多様性カード */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Smile className="w-5 h-5 text-green-500" />
                      感情の表現
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmotionChart
                      data={child.dashboardData.emotionalSpectrum}
                    />
                    <p className="text-sm text-green-600 font-medium mt-3 pt-3 border-t">
                      今週は、いろいろな気持ちをニアに話してくれているようです。
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* QRコード表示ボタン */}
              <div className="text-center pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedChild(child)}
                >
                  {child.nickname}さんのQRコードを表示
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded-lg mt-8">
          <p className="text-gray-500">まだ子供が登録されていません。</p>
        </div>
      )}

      {/* QRコード表示モーダル */}
      {selectedChild && (
        <QrCodeModal
          childId={selectedChild.id}
          childNickname={selectedChild.nickname!}
          onClose={() => setSelectedChild(null)}
        />
      )}
    </>
  );
}
