"use server";

import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";
import type { Child } from "../model/types";

const supabaseAdmin = createSupabaseAdminClient();

/**
 * 保護者IDに基づいて、管理している子供のリストを取得します。
 * @param parentId - 保護者のユーザーID (uuid)
 * @returns 子供のリスト
 */
export async function getChildrenByParentId(
  parentId: string
): Promise<Child[]> {
  const { data, error } = await supabaseAdmin
    .from("children")
    .select("*")
    .eq("managed_by_user_id", parentId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch children:", error);
    throw new Error("Failed to fetch children from the database.");
  }
  return data;
}

/**
 * 新しい子供をデータベースに追加します。
 * @param nickname - 子供のニックネーム
 * @param parentId - 管理する保護者のユーザーID
 * @returns 作成された子供の情報
 */
export async function createChild(
  nickname: string,
  parentId: string
): Promise<Child> {
  const { data, error } = await supabaseAdmin
    .from("children")
    .insert({
      nickname: nickname.trim(),
      managed_by_user_id: parentId,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create child:", error);
    throw new Error("Failed to create child in the database.");
  }
  return data;
}
