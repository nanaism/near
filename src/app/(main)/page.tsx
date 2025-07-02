import { auth } from "@/auth";
import { ChatClient } from "@/features/chat/components/ChatClient";
import { redirect } from "next/navigation";

export default async function TopPage() {
  const session = await auth();

  // (main)/layout.tsxによって認証は保証されていますが、念のため記載
  if (!session?.user?.id) {
    redirect("/login");
  }

  // auth()から返される本物のセッションオブジェクトには、デモユーザーの情報
  // (user.id, user.name) が正しく含まれています。
  // この本物のセッションをそのままクライアントに渡します。
  return <ChatClient session={session} />;
}
