"use client";

import { APP_VERSION } from "@/features/chat/lib/constants";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  className?: string; // 外部からのclassNameを引き継げるように維持
};

export function AppFooter({ className }: Props) {
  return (
    // framer-motionのコンポーネントとアニメーションはそのまま活用
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }} // 親画面のアニメーションに合わせて調整
      className={`w-full ${className}`}
    >
      <div className="flex items-center justify-center gap-4">
        {/* --- テキストリンクエリア --- */}
        <div className="text-left text-xs text-gray-500/90">
          <div className="space-x-4 font-medium">
            <Link
              href="/privacy"
              className="hover:text-gray-800 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-800 transition-colors"
            >
              利用規約
            </Link>
          </div>
          <div className="mt-1 text-gray-400">
            <a
              href="https://aiichiro.jp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-800 transition-colors"
            >
              © 2025 Near Project
            </a>
            {/* バージョン情報は開発時やデバッグ時に便利なので残し、控えめに表示 */}
            <span className="ml-2">v{APP_VERSION}</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
