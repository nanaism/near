import { auth } from "@/auth";
import { getChildrenByParentId } from "@/entities/child/services/repository";
import { ChildrenDashboard } from "@/features/parent-dashboard/components/ChildrenDashboard";
import { redirect } from "next/navigation";

// このページはサーバーコンポーネントです
export default async function DashboardPage() {
  const session = await auth();

  // middlewareでもチェックしているが、念のためここでも確認
  if (!session?.user?.id) {
    redirect("/login");
  }

  // サーバーサイドで、リポジトリ経由で子供のリストを事前に取得
  const initialChildren = await getChildrenByParentId(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">
          ようこそ、{session.user.name || "保護者"}さん
        </h2>
        <p className="text-gray-600 mt-1">
          管理する子供の追加や、ログイン用のQRコード発行ができます。
        </p>
      </div>

      {/* データの受け渡しとインタラクションはクライアントコンポーネントに任せる */}
      <ChildrenDashboard initialChildren={initialChildren} />
    </div>
  );
}
