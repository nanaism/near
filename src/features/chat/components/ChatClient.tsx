"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react"; // useRefをインポート
import * as THREE from "three";
import { useChat } from "../hooks/useChat";
import { ControlBarFooter } from "./controllers/ControlBarFooter";
import { SettingsDialog } from "./controllers/SettingsDialog";
import { UnlockScreen } from "./controllers/UnlockScreen";
import { ChatHistoryOverlay } from "./ui/ChatHistoryOverlay";
import { LiveMessageBubble } from "./ui/LiveMessageBubble";
import { ThinkingIndicator } from "./ui/ThinkingIndicator";
import { VRMCanvas } from "./vrm/VRMCanvas";

type Props = {
  session: Session;
};

export function ChatClient({ session }: Props) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [effects, setEffects] = useState<
    Array<{ id: number; position: THREE.Vector3 }>
  >([]);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const {
    messages,
    isLoading,
    isSpeaking,
    liveMessage,
    currentEmotion,
    thinkMode,
    analyserNode,
    initializeAudio,
    sendMessage,
    handleSetThinkMode,
    playAudio,
    createGoodbyeMessage,
    setCurrentEmotion,
    setLiveMessage,
    handleReset,
  } = useChat(session);

  /**
   * ユーザーが「はじめる」を押したときの処理
   */
  const handleUnlock = () => {
    initializeAudio().then(() => {
      setIsUnlocked(true);
      const firstMessage = messages[0];
      if (firstMessage?.role === "ai" && firstMessage.audioUrl) {
        // 1. 感情をセットする
        if (firstMessage.emotion) setCurrentEmotion(firstMessage.emotion);

        // 2. 画面に吹き出しを表示する
        setLiveMessage(firstMessage);

        // 3. 音声を再生し、再生終了後に吹き出しを消して感情をリセットする
        playAudio(firstMessage.audioUrl, () => {
          setTimeout(() => {
            setLiveMessage(null);
            setCurrentEmotion("neutral");
          }, 1000); // 1秒待ってから消す
        });
      }
    });
  };

  const handleEndCall = () => {
    if (isLoading) return;
    const goodbyeMessage = createGoodbyeMessage();

    if (goodbyeMessage.emotion) {
      setCurrentEmotion(goodbyeMessage.emotion);
    }
    setLiveMessage(goodbyeMessage);

    const onPlaybackEnd = () => {
      const isDemo = session.user?.name === "デモユーザー";
      if (isDemo) {
        router.push("/login");
      } else {
        setIsUnlocked(false);
      }
    };

    if (goodbyeMessage.audioUrl) {
      playAudio(goodbyeMessage.audioUrl, onPlaybackEnd);
    } else {
      setTimeout(onPlaybackEnd, 1000);
    }
  };

  const handleHeadClick = (event: ThreeEvent<MouseEvent>) => {
    setEffects((prev) => [
      ...prev,
      { id: Date.now(), position: event.point.clone() },
    ]);
    if (isSpeaking) return;
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    const originalEmotion = currentEmotion;
    setCurrentEmotion("happy");
    interactionTimerRef.current = setTimeout(() => {
      setCurrentEmotion(
        originalEmotion === "happy" ? "neutral" : originalEmotion
      );
    }, 2500);
  };

  const handleEffectComplete = (id: number) => {
    setEffects((prev) => prev.filter((effect) => effect.id !== id));
  };

  return (
    <main className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-slate-50 font-sans">
      <AnimatePresence>
        {!isUnlocked && <UnlockScreen onUnlock={handleUnlock} />}
      </AnimatePresence>
      {isUnlocked && (
        <div className="w-full h-full flex flex-col z-10">
          <div className="flex-1 w-full relative min-h-0">
            <VRMCanvas
              isLoading={isLoading}
              emotion={currentEmotion}
              analyser={analyserNode}
              isSpeaking={isSpeaking}
              onHeadClick={handleHeadClick}
              effects={effects}
              onEffectComplete={handleEffectComplete}
            />
            <AnimatePresence>
              {liveMessage && <LiveMessageBubble message={liveMessage} />}
              {isLoading && <ThinkingIndicator />}
            </AnimatePresence>
          </div>
          <ControlBarFooter
            onSendMessage={sendMessage}
            isLoading={isLoading}
            onHistoryClick={() => setIsHistoryOpen(true)}
            onEndCallClick={handleEndCall}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />
          <ChatHistoryOverlay
            messages={messages}
            isLoading={isLoading}
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            onReset={handleReset}
          />
          <SettingsDialog
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            thinkMode={thinkMode}
            setThinkMode={handleSetThinkMode}
          />
        </div>
      )}
    </main>
  );
}
