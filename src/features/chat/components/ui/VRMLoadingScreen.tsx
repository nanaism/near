"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export function VRMLoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
    >
      <div className="relative">
        {/* 背景のアニメーション */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="flex flex-col items-center space-y-8 p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
          {/* メインローダー */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 rounded-full border-4 border-blue-200"
            >
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
            </motion.div>
            <Loader2 className="absolute inset-0 m-auto w-12 h-12 text-white animate-spin" />
          </div>

          {/* テキスト */}
          <div className="text-center space-y-2">
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              準備しています
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600"
            >
              もう少しお待ちください...
            </motion.p>
          </div>

          {/* スパークルアニメーション */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </motion.div>
  );
}