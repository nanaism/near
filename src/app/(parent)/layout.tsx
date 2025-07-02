import { auth } from "@/auth";
import { redirect } from "next/navigation";

// このレイアウトは、保護者として認証されていることを確認します。
export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    // セッションがない場合は、汎用ログインページにリダイレクト
    redirect("/login");
  }

  return <>{children}</>;
}
