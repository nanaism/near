"use server";

import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";
import type { Conversation, NewConversation } from "../model/types";

const supabaseAdmin = createSupabaseAdminClient();

/**
 * 指定された子供IDの会話履歴を取得します。
 * @param childId - 子供のID
 * @param limit - 取得する件数
 * @returns 会話履歴のリスト
 */
export async function getConversationsByChildId(
  childId: string,
  limit: number = 10
): Promise<Conversation[]> {
  // 変更点: PickをやめてConversation[]を返す
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("*") // 変更点: role, contentだけでなく全て取得
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch conversations:", error);
    throw new Error("Failed to fetch conversations.");
  }
  // 履歴は古い順で使うことが多いので、ここで反転させておく
  return data.reverse();
}

/**
 * 新しい会話をデータベースに追加します。
 * @param conversation - 新しい会話データ
 */
export async function addConversation(
  conversation: NewConversation
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("conversations")
    .insert(conversation);

  if (error) {
    console.error("Failed to add conversation:", error);
  }
}

/**
 * 指定された子供IDの会話数をカウントします。
 * @param childId - 子供のID
 * @returns 会話数
 */
export async function countConversationsByChildId(
  childId: string
): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .eq("child_id", childId);

  if (error) {
    console.error("Failed to count conversations:", error);
    return 0;
  }
  return count ?? 0;
}

/**
 * 指定された子供IDの会話履歴をすべて削除します。
 * @param childId - 子供のID
 */
export async function deleteConversationsByChildId(
  childId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("conversations")
    .delete()
    .eq("child_id", childId);

  if (error) {
    console.error("Failed to delete conversations:", error);
    throw new Error("Failed to delete conversations.");
  }
}
