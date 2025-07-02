"use server";

import { auth } from "@/auth";
import { deleteConversationsByChildId } from "@/entities/conversation/services/repository";
import { revalidatePath } from "next/cache";

/**
 * 認証されたユーザーの会話履歴をすべて削除するServer Action
 */
export async function resetHistoryAction(): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || userId === "demo-user") {
    return {
      success: false,
      message: "リセット対象のユーザーではありません。",
    };
  }

  try {
    await deleteConversationsByChildId(userId);
    // メインページを再検証して、UIに変更を即時反映させる
    revalidatePath("/");
    return { success: true, message: "履歴をリセットしました。" };
  } catch (error) {
    console.error("resetHistoryAction failed:", error);
    return { success: false, message: "履歴のリセットに失敗しました。" };
  }
}
