import type { Metadata, Viewport } from "next"; // ★ Viewportを追加
import { SessionProvider } from "next-auth/react";
import { Inter, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const zen_kaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-zen-kaku",
});

export const metadata: Metadata = {
  title: "Near - ニア",
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
        <body className={`${inter.variable} ${zen_kaku.variable} font-sans`}>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
