"use client";

import { APP_VERSION } from "@/features/chat/lib/constants";
import { motion } from "framer-motion";
import Link from "next/link";

type Props = {
  className?: string;
};

export function AppFooter({ className }: Props) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full text-center text-xs text-gray-500/80 ${className}`}
    >
      <div className="space-x-4">
        <Link href="/privacy" className="hover:underline">
          プライバシーポリシー
        </Link>
        <span>|</span>
        <Link href="/terms" className="hover:underline">
          利用規約
        </Link>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">v{APP_VERSION}</span>
      </div>
      <div className="mt-1">
        <a
          href="https://aiichiro.jp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          © 2025 Near Project
        </a>
      </div>
    </motion.footer>
  );
}
