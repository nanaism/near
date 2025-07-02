"use client";

import { motion } from "framer-motion";
import type { Message } from "../../model/types";

export const MessageBubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-end gap-2 w-full ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-pink-400 to-violet-500 shadow-md" />
      )}
      <div
        className={`max-w-[85%] rounded-2xl p-3 text-base leading-relaxed break-words shadow ${
          isUser ? "bg-cyan-500 text-white" : "bg-white/95 text-gray-800"
        }`}
      >
        {msg.text}
      </div>
    </motion.div>
  );
};
