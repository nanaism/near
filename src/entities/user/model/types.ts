/**
 * 保護者ユーザーの型定義
 * Supabaseの 'users' テーブルに対応
 */
export type User = {
  id: string; // uuid
  name: string | null;
  email: string | null;
  emailVerified: string | null; // ISO 8601 date string
  image: string | null;
  avatar_url: string | null;
};
