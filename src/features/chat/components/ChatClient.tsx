"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { AnimatePresence } from "framer-motion";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

/**
 * AIチャット機能のすべてを統括するクライアントコンポーネント。
 * useChatフックからロジックを受け取り、各UIコンポーネントに状態と関数を渡す「司令塔」の役割を担う。
 */
export function ChatClient({ session }: Props) {
  // ----------------------------------------------------------------
  // State and Refs - このコンポーネントで管理するUIの状態
  // ----------------------------------------------------------------

  const [isUnlocked, setIsUnlocked] = useState(false); // 会話が開始されているか（ロック解除済みか）
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // 会話履歴オーバーレイが開いているか
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // 設定ダイアログが開いているか
  const [effects, setEffects] = useState<
    Array<{ id: number; position: THREE.Vector3 }>
  >([]); // タップエフェクトのリスト

  // ★★★ 競合状態（Race Condition）を防ぐための最重要State ★★★
  // 会話終了処理が進行中であることを示すフラグ。trueの間は他の操作をブロックする。
  const [isEndingCall, setIsEndingCall] = useState(false);

  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null); // VRMのインタラクション用タイマー
  const router = useRouter(); // ページ遷移用のフック

  // ----------------------------------------------------------------
  // Hooks - useChatフックからロジックをまとめて取得
  // ----------------------------------------------------------------

  const {
    messages,
    isLoading,
    isSpeaking,
    liveMessage,
    currentEmotion,
    thinkMode,
    analyserNode,
    initializeAudio,
    sendMessage, // useChatフックから元のsendMessageを受け取る
    handleSetThinkMode,
    playAudio,
    createGoodbyeMessage,
    setCurrentEmotion,
    setLiveMessage,
    handleReset,
  } = useChat(session);

  // ----------------------------------------------------------------
  // Event Handlers - UIコンポーネントに渡すためのイベントハンドラ
  // ----------------------------------------------------------------

  /**
   * メッセージ送信ボタンが押された時の処理。
   * isEndingCallフラグをチェックして、割り込みを防ぐ。
   */
  const handleSendMessage = (input: string) => {
    if (isLoading || isEndingCall) return;
    sendMessage(input);
  };

  /**
   * 最初の「はじめる」ボタンが押された時の処理
   */
  const handleUnlock = () => {
    setIsEndingCall(false); // 開始時に終了状態をリセット
    initializeAudio().then(() => {
      setIsUnlocked(true);
      const firstMessage = messages[0];
      if (firstMessage?.role === "ai" && firstMessage.audioUrl) {
        if (firstMessage.emotion) setCurrentEmotion(firstMessage.emotion);
        setLiveMessage(firstMessage);
        playAudio(firstMessage.audioUrl, () => {
          setTimeout(() => {
            setLiveMessage(null);
            setCurrentEmotion("neutral");
          }, 1000);
        });
      }
    });
  };

  /**
   * 「会話を終了する」ボタンが押された時の処理
   */
  const handleEndCall = () => {
    // すでに終了処理中、またはAIが思考中の場合は、二重実行を防ぐ
    if (isLoading || isEndingCall) return;

    // 会話終了モードに移行し、他の操作からの割り込みを完全にブロックする
    setIsEndingCall(true);

    const goodbyeMessage = createGoodbyeMessage();
    if (goodbyeMessage.emotion) {
      setCurrentEmotion(goodbyeMessage.emotion);
    }
    setLiveMessage(goodbyeMessage);

    // 音声再生が完了した後に実行される、安全な画面遷移処理
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
      setTimeout(onPlaybackEnd, 1000); // 音声がない場合も遷移を保証
    }
  };

  /**
   * VRMモデルがクリックされた時の処理
   */
  const handleHeadClick = (event: ThreeEvent<MouseEvent>) => {
    // 音声再生中や会話終了処理中は、エフェクトを発生させない
    if (isSpeaking || isEndingCall) return;

    setEffects((prev) => [
      ...prev,
      { id: Date.now(), position: event.point.clone() },
    ]);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    const originalEmotion = currentEmotion;
    setCurrentEmotion("happy");
    interactionTimerRef.current = setTimeout(() => {
      setCurrentEmotion(
        originalEmotion === "happy" ? "neutral" : originalEmotion
      );
    }, 2500);
  };

  /**
   * タップエフェクトのアニメーションが完了した時に呼ばれる処理
   */
  const handleEffectComplete = (id: number) => {
    setEffects((prev) => prev.filter((effect) => effect.id !== id));
  };

  // ----------------------------------------------------------------
  // Render - 実際のUIを描画
  // ----------------------------------------------------------------

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
            onSendMessage={handleSendMessage}
            isLoading={isLoading || isEndingCall} // 思考中と終了処理中の両方でUIを無効化
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
