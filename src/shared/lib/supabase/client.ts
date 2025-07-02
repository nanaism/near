import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ブラウザとサーバーの両方で使えるクライアント（RLSが有効）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイドでのみ使用する管理者権限クライアントを生成する関数
// これにより、サービスキーがクライアントサイドに漏れるのを防ぎます。
export const createSupabaseAdminClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables."
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};
