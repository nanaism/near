/**
 * 子供の型定義
 * Supabaseの 'children' テーブルに対応
 */
export type Child = {
  id: string; // uuid
  nickname: string | null;
  created_at: string; // ISO 8601 date string
  managed_by_user_id: string | null; // uuid of the parent user
};
