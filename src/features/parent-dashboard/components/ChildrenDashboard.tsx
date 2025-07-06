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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"; // ★★★ Tooltipをインポート ★★★
import { supabase } from "@/shared/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Info,
  MessageCircle,
  QrCode,
  Sparkles,
} from "lucide-react"; // ★★★ QrCodeをインポート ★★★
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addChildAction } from "../services/children.actions";
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
          weatherReport: {
            icon: "😌",
            text: "ニアとの対話を始めたばかりです。",
          },
          conversationStarter: null,
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
    <TooltipProvider>
      {/* 新しいお子さまを追加するフォーム */}
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
            placeholder="お子さまのニックネーム"
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
                className="relative !p-0"
              >
                <div className="flex items-center justify-between w-full h-full px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span>{child.nickname}</span>
                    {child.dashboardData.alert && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-black/10"
                        onClick={(e) => {
                          e.stopPropagation(); // タブの切り替えを防ぐ
                          setSelectedChild(child);
                        }}
                      >
                        <QrCode className="w-4 h-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{child.nickname}さんのQRコードを表示</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {children.map((child) => (
            <TabsContent
              key={child.id}
              value={child.id}
              className="mt-6 space-y-6"
            >
              {/* メンタルヘルス・アラート */}
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
                    お子さまを見守っています
                  </AlertTitle>
                  <AlertDescription className="text-blue-700">
                    ニアは、お子さまの心の健康を常に見守っています。特に懸念される点が見つかった場合は、この場所でお知らせします。
                  </AlertDescription>
                </Alert>
              )}

              {/* コミュニケーション・ウェザー */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="w-5 h-5 text-indigo-500" />
                    今週のコミュニケーションの様子
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4 text-base">
                  <div className="text-5xl">
                    {child.dashboardData.weatherReport.icon}
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {child.dashboardData.weatherReport.text}
                  </p>
                </CardContent>
              </Card>

              {/* 対話のきっかけ */}
              {child.dashboardData.conversationStarter && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      対話のきっかけ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="text-green-900"
                      dangerouslySetInnerHTML={{
                        __html: child.dashboardData.conversationStarter.text,
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded-lg mt-8">
          <p className="text-gray-500">まだお子さまが登録されていません。</p>
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
    </TooltipProvider>
  );
}
