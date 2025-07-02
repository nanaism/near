import { auth } from "@/auth";
import { getChildrenByParentId } from "@/entities/child/services/repository";
import { ChildrenDashboard } from "@/features/parent-dashboard/components/ChildrenDashboard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialChildren = await getChildrenByParentId(session.user.id);

  return (
    // カードUIを導入して、情報のまとまりを分かりやすくする
    <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <div className="space-y-8">
        {/* ページヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              ようこそ、{session.user.name || "保護者"}さん
            </h1>
            <p className="text-slate-600 mt-2">
              お子さまの管理や、ログイン用QRコードの発行ができます。
            </p>
          </div>
        </div>

        {/* メインダッシュボード */}
        <ChildrenDashboard initialChildren={initialChildren} />
      </div>
    </div>
  );
}
