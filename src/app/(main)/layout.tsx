import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // セッションが存在しない場合、シンプルにログインページにリダイレクトする
  // これにより、このレイアウトを通過するすべてのページで認証が保証される
  if (!session?.user) {
    redirect("/login");
  }

  // 認証済みの場合は、子ページ（page.tsx）をそのまま表示
  return <>{children}</>;
}
