"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation"; // ★ next/navigationからredirectをインポート

/**
 * Googleでサインインし、ダッシュボードにリダイレクトするServer Action
 */
export async function handleGoogleSignIn() {
  await signIn("google", { redirectTo: "/admin/dashboard" });
}

/**
 * サインアウトし、トップページにリダイレクトするServer Action
 */
export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

/**
 * デモ用のCredentialsでサインインするServer Action
 */
export async function handleDemoSignIn() {
  // 1. redirect: false オプションを追加
  // これにより、Auth.jsは認証処理とセッションクッキーの設定だけを行い、
  // 自動でのリダイレクトを「行わない」。
  await signIn("credentials", { redirect: false });

  // 2. 手動でリダイレクトを実行
  // signInの処理が完全に完了し、セッションが確立されたことが保証された後で、
  // Next.jsのredirect関数を使って、安全にトップページへ遷移させる。
  redirect("/");
}
