import { auth } from "@/auth";
import { Button } from "@/shared/components/ui/button";
import { Sparkles } from "lucide-react";
import { handleDemoSignIn, handleGoogleSignIn, handleSignOut } from "./actions";

/**
 * Googleサインインボタン。
 * このコンポーネントはアクションをインポートするだけなので、Client/Serverどちらのコンポーネントからでも安全に使用できます。
 */
export function GoogleSignInButton() {
  return (
    // ★修正: インラインのアクションを、インポートした関数に置き換え
    <form action={handleGoogleSignIn}>
      <Button type="submit" className="w-full">
        Googleでログイン
      </Button>
    </form>
  );
}

/**
 * デモサインインボタン。
 */
export function DemoSignInButton() {
  return (
    <form action={handleDemoSignIn}>
      <Button variant="secondary" className="w-full" type="submit">
        <Sparkles className="w-4 h-4 mr-2" />
        デモを体験する
      </Button>
    </form>
  );
}

/**
 * サインアウトボタン。
 * このコンポーネントは`auth()`を呼び出すため、サーバーコンポーネントである必要があります。
 * (例: /admin/layout.tsx のようなサーバーコンポーネント内で使用)
 */
export async function SignOutButton() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 hidden sm:inline">
        {session.user.email}
      </span>
      <form action={handleSignOut}>
        <Button type="submit" variant="outline">
          ログアウト
        </Button>
      </form>
    </div>
  );
}
