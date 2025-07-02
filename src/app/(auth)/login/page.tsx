"use client";

import {
  DemoSignInButton,
  GoogleSignInButton,
} from "@/shared/components/auth/AuthButtons";
import { QrCodeScanner } from "@/shared/components/common/QrCodeScanner";
import { AppFooter } from "@/shared/components/layout/AppFooter";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Camera, ShieldCheck, Sparkles, Star } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// --- メインコンテンツ ---
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("adult");

  useEffect(() => {
    const childId = searchParams.get("child_id");
    if (childId) signIn("qr-login", { childId, callbackUrl: "/" });
  }, [searchParams]);

  // QRログイン待機画面
  if (searchParams.has("child_id")) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center text-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <h1 className="text-3xl font-display font-bold">
            ニアのところにいくね...
          </h1>
          <p className="opacity-80 mt-3">ちょっとだけまっててね！</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    {
      id: "adult",
      label: "保護者・一般の方",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      id: "child",
      label: "お子さまはこちら",
      icon: <Camera className="w-5 h-5" />,
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.2, // 子要素を0.1秒ずつ遅延させる
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="w-full flex-grow flex flex-col justify-center items-center p-4 z-10">
      {/* --- ログインカード --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] shadow-2xl shadow-sky-200/60"
      >
        {/* --- ニアの存在を示唆する光のオーブ --- */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [-20, 20, -20],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-48 h-48 bg-pink-300 rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
            x: [30, -30, 30],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-sky-300 rounded-full blur-3xl -z-10"
        />

        <div className="p-6 sm:p-8">
          {/* 1番目に表示 */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="font-display text-5xl font-bold text-gray-800 tracking-tighter">
              Near
            </h1>
            <p className="text-gray-600 mt-2 font-medium text-lg">
              きみの、いちばん近くに。
            </p>
          </motion.div>

          {/* 2番目に表示 */}
          <motion.div
            variants={itemVariants}
            className="flex w-full p-1.5 space-x-1.5 bg-black/5 rounded-full"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full relative rounded-full px-3 py-3 text-sm sm:text-base font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                  activeTab === tab.id
                    ? "text-sky-700"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white shadow-lg rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </motion.div>

          {/* 3番目に表示 */}
          <motion.div className="mt-6" variants={itemVariants}>
            <AnimatePresence mode="wait">
              {activeTab === "adult" ? (
                <motion.div
                  key="adult"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <DemoSection />
                  <GoogleSignInSection />
                </motion.div>
              ) : (
                <motion.div
                  key="child"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <QrSection onSuccess={(url) => router.push(url)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// --- セクションコンポーネント ---

const DemoSection = () => (
  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-xl overflow-hidden group">
    <Sparkles className="absolute -top-2 -right-2 w-20 h-20 text-white/20 opacity-80 transition-transform duration-500 group-hover:scale-110" />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-6 h-6" />
        <h3 className="font-display text-xl font-bold">まずはお試し（デモ）</h3>
      </div>
      <p className="text-sm text-white/90 mb-4 font-medium">
        アカウント登録不要で、すぐにニアとの対話を体験できます。
      </p>
      <DemoSignInButton />
    </div>
  </div>
);

const GoogleSignInSection = () => (
  <div className="p-4 bg-black/5 rounded-2xl text-center">
    <h3 className="text-base font-bold text-gray-700 mb-3">
      保護者の方はこちら
    </h3>
    <GoogleSignInButton />
  </div>
);

const QrSection = ({
  onSuccess,
}: {
  onSuccess: (decodedText: string) => void;
}) => (
  <div className="text-center">
    <h2 className="text-xl font-display font-medium text-gray-700 mb-1">
      QRコードをさがしてね
    </h2>
    <p className="text-sm text-gray-500 mb-4">
      おうちの人にみせてもらった四角いマークを
      <br />
      カメラのまん中にうつしてね。
    </p>
    <div className="w-full max-w-[260px] mx-auto overflow-hidden rounded-2xl shadow-inner bg-sky-50 p-2 border border-sky-100">
      <QrCodeScanner
        onScanSuccess={onSuccess}
        onScanFailure={(err) => console.log(err)}
      />
    </div>
  </div>
);

// --- ページ全体 ---
export default function LoginPage() {
  return (
    <div className="w-full min-h-screen overflow-hidden relative flex flex-col font-sans">
      {/* --- 生きた背景 --- */}
      <div className="absolute inset-0 -z-10">
        <div className="animated-gradient w-full h-full"></div>
      </div>

      <Suspense
        fallback={
          <div className="w-full flex-grow flex items-center justify-center text-gray-500">
            読み込み中...
          </div>
        }
      >
        <LoginPageContent />
      </Suspense>

      <div className="flex-shrink-0 z-10">
        <AppFooter className="py-5" />
      </div>

      {/* CSS in JS for animation */}
      <style jsx global>{`
        .animated-gradient {
          background: linear-gradient(
            45deg,
            #d1fafe,
            #fff0f5,
            #e9d5ff,
            #fef3c7
          );
          background-size: 400% 400%;
          animation: gradient 20s ease infinite;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
