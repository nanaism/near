"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Message } from "../../model/types";
import { MessageBubble } from "./MessageBubble";
import { ThinkingIndicator } from "./ThinkingIndicator";

type Props = {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void; // Will implement this later
};

export const ChatHistoryOverlay = ({
  messages,
  isLoading,
  isOpen,
  onClose,
  onReset,
}: Props) => {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [isOpen, messages]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85%] flex flex-col">
        <SheetHeader className="flex-row items-center justify-between pr-6">
          <SheetTitle>おはなしのきろく</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onReset}
            className="text-muted-foreground"
            disabled={isLoading}
          >
            <Trash size={20} />
          </Button>
        </SheetHeader>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4 pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <ThinkingIndicator />
              </div>
            )}
            <div ref={scrollEndRef} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
