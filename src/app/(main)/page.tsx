import { auth } from "@/auth";
import { ChatClient } from "@/features/chat/components/ChatClient";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

export default async function TopPage() {
  const session = await auth();

  // layoutでチェック済みだが、念のためのガード節
  if (!session?.user?.id) {
    redirect("/login");
  }

  // デモ用のセッションオブジェクトを作成
  // `credentials`プロバイダーはユーザー情報が最小限なので、デモ用の情報を設定
  const demoSession: Session = {
    user: { id: "demo-user", name: "デモユーザー" },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day
  };

  // Auth.jsのCredentialsプロバイダーは、authorizeコールバックで返した内容が
  // そのままセッションのuserオブジェクトになる。
  // ここでは、`name`が"デモユーザー"かどうかでデモモードを判定する。
  const isDemo = session.user.name === "デモユーザー";

  return <ChatClient session={isDemo ? demoSession : session} />;
}
