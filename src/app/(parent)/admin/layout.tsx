import { SignOutButton } from "@/shared/components/auth/AuthButtons";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-sans font-bold text-gray-800">
            Near 保護者管理画面
          </h1>
          <SignOutButton />
        </nav>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8">{children}</main>
      <footer className="py-4 text-center text-sm text-gray-500 border-t">
        © 2025 Near Project
      </footer>
    </div>
  );
}
