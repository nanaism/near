import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ログイン状態に加え、役割が'parent'であることを確認
  if (!session?.user || session.user.role !== "parent") {
    // 保護者でなければ、汎用ログインページにリダイレクト
    redirect("/login");
  }

  return <>{children}</>;
}
