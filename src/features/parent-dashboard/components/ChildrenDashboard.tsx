"use client";

import type { Child } from "@/entities/child/model/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { supabase } from "@/shared/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addChildAction } from "../services/children.actions";
import { QrCodeModal } from "./QrCodeModal";

// useFormStatusを利用するためのサブコンポーネント
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "追加中..." : "追加"}
    </Button>
  );
}

type Props = {
  initialChildren: Child[];
};

export function ChildrenDashboard({ initialChildren }: Props) {
  // ----------------------------------------------------------------
  // State and Hooks
  // ----------------------------------------------------------------

  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // ★ 1. useSessionフックで現在のセッション情報を取得
  const { data: session, status } = useSession();
  const userId = session?.user?.id; // ログインしている保護者のID

  const [formState, formAction] = useFormState(addChildAction, {
    success: false,
    message: "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  // ----------------------------------------------------------------
  // Side Effects
  // ----------------------------------------------------------------

  // フォーム送信成功時の処理 (変更なし)
  useEffect(() => {
    if (formState.success && formState.data) {
      formRef.current?.reset();
      // このデバイスでの即時反映（リアルタイム通知を待たない）
      setChildren((prev) => [...prev, formState.data as Child]);
    }
  }, [formState]);

  // ★★★ 2. リアルタイム更新のためのuseEffect ★★★
  useEffect(() => {
    // 認証済みで、かつユーザーIDが取得できた場合のみ購読を開始
    if (status !== "authenticated" || !userId) {
      return;
    }

    const channel: RealtimeChannel = supabase
      .channel(`realtime-children-dashboard:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE すべてを監視
          schema: "public",
          table: "children",
          filter: `managed_by_user_id=eq.${userId}`, // 自分の管理する子供の変更のみを監視
        },
        (payload) => {
          console.log("Realtime update received:", payload);

          // ★ 3. イベントタイプに応じたUIステートの更新ロジック
          switch (payload.eventType) {
            case "INSERT":
              // 他の端末で追加された子供をリストに加える
              setChildren((prev) => [...prev, payload.new as Child]);
              break;
            case "UPDATE":
              // 他の端末で更新された子供の情報をリストに反映する
              setChildren((prev) =>
                prev.map((child) =>
                  child.id === payload.new.id ? (payload.new as Child) : child
                )
              );
              break;
            case "DELETE":
              // 他の端末で削除された子供をリストから除く
              setChildren((prev) =>
                prev.filter((child) => child.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    // ★ 4. クリーンアップ関数：コンポーネントが不要になったら購読を解除
    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, userId]); // statusまたはuserIdが変更されたら再購読

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <>
      {/* --- 新しい子供を追加するフォーム --- */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">新しい子供を追加</h3>
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

      {/* --- 管理している子供の一覧 --- */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">管理している子供の一覧</h3>
        <div className="space-y-3">
          {children.length > 0 ? (
            children.map((child) => (
              <div
                key={child.id}
                className="p-4 bg-gray-50 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{child.nickname}</p>
                  <p className="text-sm text-gray-500">
                    登録日: {new Date(child.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedChild(child)}
                >
                  QRコード表示
                </Button>
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">
              まだ子供が登録されていません。
            </p>
          )}
        </div>
      </div>

      {/* --- QRコード表示モーダル --- */}
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
