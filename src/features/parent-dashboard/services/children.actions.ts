"use server";

import { auth } from "@/auth";
import { createChild } from "@/entities/child/services/repository";
import { revalidatePath } from "next/cache";

type FormState = {
  success: boolean;
  message: string;
  data?: { id: string; nickname: string | null; created_at: string };
};

export async function addChildAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "認証されていません。" };
  }
  const parentId = session.user.id;

  const nickname = formData.get("nickname") as string;
  if (!nickname || nickname.trim().length === 0) {
    return { success: false, message: "ニックネームは必須です。" };
  }

  try {
    const newChild = await createChild(nickname, parentId);

    // ダッシュボードページを再検証して、新しいデータを反映させる
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: `${newChild.nickname}さんを追加しました。`,
      data: newChild, // Client側でStateを即時更新するために返す
    };
  } catch (error) {
    console.error("addChildAction Error:", error);
    return {
      success: false,
      message: "データベースの処理中にエラーが発生しました。",
    };
  }
}
