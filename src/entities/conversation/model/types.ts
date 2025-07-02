/**
 * 会話履歴の型定義
 * Supabaseの 'conversations' テーブルに対応
 */
export type Conversation = {
  id: number; // bigint
  child_id: string; // uuid
  role: "user" | "ai";
  content: string;
  emotion: string | null;
  created_at: string; // ISO 8601 date string
};

/**
 * DBに追加する際の、idとcreated_atを除いた型
 */
export type NewConversation = Omit<Conversation, "id" | "created_at">;
