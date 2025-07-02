"use client";

import {
  DemoSignInButton,
  GoogleSignInButton,
} from "@/shared/components/auth/AuthButtons";
import { QrCodeScanner } from "@/shared/components/common/QrCodeScanner";
import { AppFooter } from "@/shared/components/layout/AppFooter"; // ★追加
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const childId = searchParams.get("child_id");
    if (childId) {
      signIn("qr-login", { childId, callbackUrl: "/" });
    }
  }, [searchParams]);

  if (searchParams.has("child_id")) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold">ログインしています...</h1>
        <p className="text-muted-foreground mt-2">
          画面をそのままでお待ちください。
        </p>
      </div>
    );
  }

  return (
    // ★flex-growでメインコンテンツを押し上げる
    <div className="flex-grow w-full flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-center">ログイン</h1>
          <p className="text-muted-foreground text-center mt-2">
            どちらかの方法でログインしてください。
          </p>
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              QRコードをお持ちの方はこちら
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              もらったQRコードを四角いワクにうつしてね。
            </p>
          </div>
          <div className="w-full max-w-[250px] mx-auto">
            <QrCodeScanner
              onScanSuccess={(decodedText) => router.push(decodedText)}
              onScanFailure={(err) => {
                console.log(err);
                setError(
                  "QRコードの読み取りに失敗しました。もう一度お試しください。"
                );
              }}
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
        </div>

        <div className="p-6 border rounded-lg space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">保護者の方・デモ利用の方</h2>
          </div>
          <GoogleSignInButton />
          <DemoSignInButton />
        </div>
        {/* このボタンはもはや不要かもしれないが、念のため残す */}
        {/* <Button variant="ghost" onClick={() => router.push("/")} className="w-full mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> トップページにもどる
            </Button> */}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    // flexとmin-h-screenでフッターを最下部に固定するレイアウト
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
      <Suspense fallback={<div>読み込み中...</div>}>
        <LoginPageContent />
      </Suspense>
      <AppFooter className="py-4 flex-shrink-0" />
    </div>
  );
}
