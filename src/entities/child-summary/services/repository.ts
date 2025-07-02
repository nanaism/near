"use server";

import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";
import type { ChildSummary } from "../model/types";

const supabaseAdmin = createSupabaseAdminClient();

/**
 * 子供の要約情報を取得します。
 * @param childId - 子供のID
 * @returns 要約情報、または存在しない場合はnull
 */
export async function getChildSummary(
  childId: string
): Promise<ChildSummary | null> {
  const { data, error } = await supabaseAdmin
    .from("child_summaries")
    .select("*")
    .eq("child_id", childId)
    .single();

  if (error && error.code !== "PGRST116") {
    // 'PGRST116'は行が見つからないエラー
    console.error("Failed to fetch child summary:", error);
    throw new Error("Failed to fetch child summary.");
  }
  return data;
}

/**
 * 子供の要約情報を作成または更新します (upsert)。
 * @param childId - 子供のID
 * @param summary - 新しい要約内容
 */
export async function upsertChildSummary(
  childId: string,
  summary: string
): Promise<void> {
  const { error } = await supabaseAdmin.from("child_summaries").upsert(
    {
      child_id: childId,
      summary: summary,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "child_id" }
  );

  if (error) {
    console.error("Failed to upsert child summary:", error);
    // バックグラウンド処理なのでエラーはスローしない
  } else {
    console.log(`Summary updated for child: ${childId}`);
  }
}
