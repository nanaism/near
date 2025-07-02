"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Rabbit, Turtle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  thinkMode: "fast" | "slow";
  setThinkMode: (mode: "fast" | "slow") => void;
};

export const SettingsDialog = ({
  isOpen,
  onClose,
  thinkMode,
  setThinkMode,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>考え方を変える</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            ニアの考える速さを選べるよ。速いとお返事がすぐ来るけど、ちょっとだけ考えが浅くなるかも？
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setThinkMode("fast");
                onClose();
              }}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                thinkMode === "fast"
                  ? "border-pink-500 bg-pink-50"
                  : "border-transparent bg-slate-100"
              }`}
            >
              <Rabbit className="w-6 h-6 text-pink-500" />
              <div>
                <h3 className="font-bold text-left">うさぎモード</h3>
                <p className="text-sm text-left text-muted-foreground">
                  はやく考える
                </p>
              </div>
            </button>
            <button
              onClick={() => {
                setThinkMode("slow");
                onClose();
              }}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                thinkMode === "slow"
                  ? "border-violet-500 bg-violet-50"
                  : "border-transparent bg-slate-100"
              }`}
            >
              <Turtle className="w-6 h-6 text-violet-500" />
              <div>
                <h3 className="font-bold text-left">かめモード</h3>
                <p className="text-sm text-left text-muted-foreground">
                  じっくり考える
                </p>
              </div>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
