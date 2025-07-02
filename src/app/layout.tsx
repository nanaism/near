import type { Metadata, Viewport } from "next"; // ★ Viewportを追加
import { SessionProvider } from "next-auth/react";
import { Inter, Kiwi_Maru } from "next/font/google"; // ★ Zen_Kaku_Gothic_New を Kiwi_Maru に変更
import "./globals.css";

// Inter は可読性の高い本文用フォント
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Kiwi Maru を新しいディスプレイフォントとして導入
const kiwi_maru = Kiwi_Maru({
  subsets: ["latin"],
  weight: ["400", "500"], // 必要なウェイトを指定
  variable: "--font-kiwi-maru",
});
export const metadata: Metadata = {
  title: "Near ─ニア",
  description: "いつもそばに。子どものためのAIチャットアプリ",
};

// viewport設定を独立したオブジェクトとしてエクスポート
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="ja">
        <body className={`${inter.variable} ${kiwi_maru.variable} font-sans`}>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
