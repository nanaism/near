/**
 * 子供に関する要約情報の型定義
 * Supabaseの 'child_summaries' テーブルに対応
 */
export type ChildSummary = {
  child_id: string; // uuid, Primary Key
  summary: string | null;
  last_updated: string; // ISO 8601 date string
};
