"use server";

import { signIn, signOut } from "@/auth";

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
  await signIn("credentials", { callbackUrl: "/" });
}
