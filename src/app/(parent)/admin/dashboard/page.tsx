import { auth } from "@/auth";
import { getChildrenByParentId } from "@/entities/child/services/repository";
import { getDashboardData } from "@/entities/dashboard/services/repository";
import { ChildrenDashboard } from "@/features/parent-dashboard/components/ChildrenDashboard";
import { redirect } from "next/navigation";

// このページはサーバーコンポーネントです
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. 保護者が管理する子供のリストを取得
  const children = await getChildrenByParentId(session.user.id);

  // 2. 各子供のダッシュボードデータを並行して取得
  const childrenWithDashboardData = await Promise.all(
    children.map(async (child) => {
      const dashboardData = await getDashboardData(child.id);
      return {
        ...child,
        dashboardData,
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold font-display">
          ようこそ、{session.user.name || "保護者"}さん
        </h2>
        <p className="text-gray-600 mt-1">
          お子様の様子を見守り、対話のきっかけを見つけましょう。
        </p>
      </div>

      {/* データの受け渡しとインタラクションはクライアントコンポーネントに任せる */}
      <ChildrenDashboard initialChildren={childrenWithDashboardData} />
    </div>
  );
}
