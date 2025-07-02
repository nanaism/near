"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { History, Loader, PhoneOff, Send, Settings } from "lucide-react";
import { KeyboardEvent, useState } from "react";

type Props = {
  onSendMessage: (input: string) => void;
  onHistoryClick: () => void;
  onEndCallClick: () => void;
  onSettingsClick: () => void;
  isLoading: boolean;
};

export const ControlBarFooter = ({
  onSendMessage,
  onHistoryClick,
  onEndCallClick,
  onSettingsClick,
  isLoading,
}: Props) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !isLoading) {
      onSendMessage(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <footer className="p-3 bg-white/50 backdrop-blur-lg border-t flex-shrink-0 z-20">
      <div className="flex w-full items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onHistoryClick}
          disabled={isLoading}
          className="rounded-full text-gray-600"
          aria-label="履歴"
        >
          <History size={22} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          disabled={isLoading}
          className="rounded-full text-gray-600"
          aria-label="設定"
        >
          <Settings size={22} />
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ここに入力してね..."
          disabled={isLoading}
          className="flex-1 bg-white/80 rounded-full h-12 px-5 text-base"
        />

        <Button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-lg flex-shrink-0"
          aria-label="送信"
        >
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Loader className="h-6 w-6 animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Send className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        <Button
          type="button"
          onClick={onEndCallClick}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex-shrink-0"
          aria-label="おはなしをやめる"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </footer>
  );
};
