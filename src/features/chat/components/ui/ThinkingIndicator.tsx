"use client";

import { motion } from "framer-motion";

export const ThinkingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/30 text-white px-4 py-2 rounded-full backdrop-blur-sm shadow-lg pointer-events-none"
    >
      <p className="text-sm font-semibold">考え中...</p>
    </motion.div>
  );
};
