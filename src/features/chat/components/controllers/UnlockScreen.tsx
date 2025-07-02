import { AppFooter } from "@/shared/components/layout/AppFooter"; // ★追加
import { motion } from "framer-motion";
import { Phone, Sparkles } from "lucide-react";

export const UnlockScreen = ({ onUnlock }: { onUnlock: () => void }) => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="relative w-full h-full flex flex-col justify-center items-center z-50 p-4 text-center bg-gradient-to-br from-sky-100 to-violet-200"
  >
    <div className="flex-grow flex flex-col justify-center items-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-2xl mx-auto mb-6">
        <Sparkles className="w-12 h-12 text-white/90" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2 font-serif">
        ニアとおはなし
      </h1>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">
        うれしいこと、なやみごと、なんでも話してね。
      </p>
      <motion.button
        onClick={onUnlock}
        className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full px-8 py-4 text-lg font-semibold shadow-xl flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Phone className="w-6 h-6" /> はじめる
      </motion.button>
    </div>

    <AppFooter className="py-4" />
  </motion.div>
);
