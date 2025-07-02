import { auth } from "@/auth";
import { SignOutButton } from "@/shared/components/auth/AuthButtons"; // ★ SignOutButtonを修正して使います
import { UserCircle2 } from "lucide-react";
import Link from "next/link";
import React, { Suspense } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
      {/* --- ダークネイビーのヘッダー --- */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          {/* ロゴ */}
          <Link
            href="/admin/dashboard"
            className="text-2xl font-bold text-white"
          >
            Near
            <span className="text-xs ml-2 text-slate-400 font-medium">
              for Parents
            </span>
          </Link>

          {/* ユーザーメニュー (Suspenseで囲むとビルド時の静的/動的の切り分けに役立つ) */}
          <Suspense>
            <UserNav />
          </Suspense>
        </nav>
      </header>

      {/* --- メインコンテンツ --- */}
      <main className="flex-1 w-full container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* --- フッター --- */}
      <footer className="py-4 text-center text-sm text-slate-500 border-t border-slate-200">
        © 2025 Near Project
      </footer>
    </div>
  );
}

// --- ユーザーナビゲーションコンポーネント ---
// ヘッダー内でセッション情報を扱う部分を分離
async function UserNav() {
  const session = await auth();

  if (!session?.user) {
    // セッションがない場合はログインボタンなどを表示（今回は非表示）
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-slate-700"
        >
          <UserCircle2 className="h-7 w-7 text-slate-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* SignOutButtonをDropdownMenuItemとして使う */}
        <DropdownMenuItem asChild>
          {/* このSignOutButtonは、後述の修正が必要です */}
          <SignOutButton variant="ghost" className="w-full cursor-pointer" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
