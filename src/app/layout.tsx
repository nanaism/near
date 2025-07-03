import type { Metadata, Viewport } from "next"; 
import { SessionProvider } from "next-auth/react";
import { Inter, Kiwi_Maru, M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";

// Inter は可読性の高い本文用フォント
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Kiwi Maru を新しいディスプレイフォントとして導入
const kiwi_maru = Kiwi_Maru({
  subsets: ["latin"],
  weight: ["400", "500"], // 必要なウェイトを指定
  variable: "--font-kiwi-maru",
});

const cuteFont = M_PLUS_Rounded_1c({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-display-cute",
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
        <body
          className={`${inter.variable} ${kiwi_maru.variable} ${cuteFont.variable} font-sans`}
        >
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
