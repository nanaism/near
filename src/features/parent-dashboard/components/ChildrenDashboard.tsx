// src/features/parent-dashboard/components/ChildrenDashboard.tsx

"use client";

import type { Child } from "@/entities/child/model/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // React 19のuseFormStateフックを使用
  const [formState, formAction] = useFormState(addChildAction, {
    success: false,
    message: "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formState.success && formState.data) {
      // フォームの送信が成功したら、入力欄をリセットし、stateを更新
      formRef.current?.reset();
      setChildren((prev) => [...prev, formState.data as Child]);
    }
  }, [formState]);

  return (
    <>
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
        {!formState.success && formState.message && (
          <p className="text-red-500 mt-2 text-sm">{formState.message}</p>
        )}
      </div>

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
