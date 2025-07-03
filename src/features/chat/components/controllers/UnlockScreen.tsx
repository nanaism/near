"use client";

import { AppFooter } from "@/shared/components/layout/AppFooter";
import { motion, Variants } from "framer-motion";
import { Phone } from "lucide-react";

// アニメーションのバリアント定義 (変更なし)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeIn",
      staggerChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const UnlockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  return (
    <div className="relative w-full h-full flex flex-col z-50 animated-unlock-gradient">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full flex-grow flex flex-col justify-center items-center p-6 text-center"
      >
        {/* 不要なmotion.divを削除し、variantsをbuttonに直接適用 */}
        <motion.button
          variants={itemVariants} // 親divからここに移動
          onClick={onUnlock}
          className="relative w-36 h-36 rounded-full text-white transition-all duration-300 bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/80"
          animate={{
            boxShadow: [
              "0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)",
              "0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.3)",
              "0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)",
            ],
          }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.4)",
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
          }}
        >
          <div className="w-full h-full rounded-full flex items-center justify-center shadow-[inset_0_3px_6px_rgba(255,255,255,0.4),_inset_0_-4px_5px_rgba(0,0,0,0.1)]">
            <Phone className="w-16 h-16 drop-shadow-lg" />
          </div>
        </motion.button>

        <motion.div variants={itemVariants} className="mt-12">
          <h1 className="font-display-cute text-4xl font-bold text-gray-800 tracking-tight">
            おはなしをはじめる
          </h1>
          {/* 文言の間の<br />は不要な場合が多いため削除し、マージンで調整 */}
          <p className="font-display-cute text-gray-500 mt-6 text-base leading-relaxed max-w-sm mx-auto">
            うれしいこと、たのしいこと、かなしいこと。
            <br />
            どんなことでもきかせてね。
          </p>
        </motion.div>
      </motion.div>

      <div className="flex-shrink-0 w-full px-6 pb-6">
        <AppFooter />
      </div>

      <style jsx global>{`
        .animated-unlock-gradient {
          background: linear-gradient(
            -45deg,
            #f5f3ff,
            #fff1f2,
            #f0fdfa,
            #ecfdf5
          );
          background-size: 400% 400%;
          animation: gradient 25s ease infinite;
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
};
