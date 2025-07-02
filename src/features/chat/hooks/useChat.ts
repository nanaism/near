"use client";

import { getConversationsByChildId } from "@/entities/conversation/services/repository";
import type { Session } from "next-auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { goodbyeMessages, initialDemoMessages } from "../lib/constants";
import type { Emotion, Message } from "../model/types";
import { resetHistoryAction } from "../services/chat.actions";

// --- 型定義 ---
interface CustomWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

const THINK_MODE_KEY = "near-think-mode";

// --- ヘルパー関数 ---
const createInitialMessage = (): Message => {
  const msg =
    initialDemoMessages[Math.floor(Math.random() * initialDemoMessages.length)];
  return { id: 0, role: "ai", ...msg };
};
const createGoodbyeMessage = (): Message => {
  const msg =
    goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
  return { id: Date.now(), role: "ai", ...msg };
};

// --- カスタムフック本体 ---
export function useChat(session: Session) {
  const userId = session.user!.id!;
  const isDemo = userId === "demo-user";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveMessage, setLiveMessage] = useState<Message | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral");
  const [thinkMode, setThinkMode] = useState<"fast" | "slow">("slow");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleReset = async () => {
    if (session.user?.id === "demo-user") {
      alert("デモモードではリセットできません。");
      return;
    }
    if (
      window.confirm(
        "本当に全ての会話履歴をリセットしますか？この操作は元に戻せません。"
      )
    ) {
      setIsLoading(true);
      const result = await resetHistoryAction();
      if (result.success) {
        // フロントエンドの状態も初期化
        setMessages([createInitialMessage()]);
      } else {
        alert(result.message);
      }
      setIsLoading(false);
    }
  };

  // --- 音声再生ロジック ---
  const playAudio = useCallback((audioSrc: string, onEnd?: () => void) => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
    }

    const context = audioContextRef.current;
    if (!context) {
      onEnd?.();
      return;
    }

    const sourceUrl = audioSrc.startsWith("/")
      ? audioSrc
      : `data:audio/wav;base64,${audioSrc}`;

    fetch(sourceUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => context.decodeAudioData(buffer))
      .then((audioBuffer) => {
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyserRef.current!);
        setIsSpeaking(true);
        source.start(0);
        audioSourceRef.current = source;
        source.onended = () => {
          setIsSpeaking(false);
          onEnd?.();
        };
      })
      .catch((e) => {
        console.error("Audio playback error:", e);
        setIsSpeaking(false);
        onEnd?.();
      });
  }, []);

  // --- 初期化処理 ---
  useEffect(() => {
    // 思考モードをlocalStorageから読み込み
    try {
      const savedMode = localStorage.getItem(THINK_MODE_KEY);
      if (savedMode === "fast" || savedMode === "slow") setThinkMode(savedMode);
    } catch (e) {
      console.error("localStorage access failed:", e);
    }

    // 会話履歴を取得
    const fetchHistory = async () => {
      if (isDemo) {
        setMessages([createInitialMessage()]);
        return;
      }
      try {
        const history = await getConversationsByChildId(userId, 50);
        if (history.length > 0) {
          setMessages(
            history.map((msg) => ({
              id: msg.id,
              role: msg.role,
              text: msg.content,
              emotion: msg.emotion as Emotion,
            }))
          );
        } else {
          setMessages([createInitialMessage()]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        setMessages([createInitialMessage()]);
      }
    };
    fetchHistory();
  }, [isDemo, userId]);

  // --- 主要な関数 ---
  const initializeAudio = async () => {
    if (audioContextRef.current) return;
    try {
      const w = window as CustomWindow;
      const AudioContext = w.AudioContext || w.webkitAudioContext;
      if (!AudioContext) {
        console.error("This browser does not support AudioContext.");
        return;
      }
      const context = new AudioContext();
      // resume AudioContext if it's in a suspended state
      if (context.state === "suspended") {
        await context.resume();
      }
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(context.destination);
      audioContextRef.current = context;
      analyserRef.current = analyser;
    } catch (e) {
      console.error("Failed to initialize AudioContext:", e);
    }
  };

  const sendMessage = async (input: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setCurrentEmotion("thinking");
    setLiveMessage(null);

    const userMessage: Message = { id: Date.now(), role: "user", text: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          childId: isDemo ? null : userId,
          history: isDemo
            ? currentMessages
                .slice(-10)
                .map((m) => ({ role: m.role, text: m.text }))
            : null,
          mode: thinkMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API error");

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: data.textResponse,
        emotion: data.emotion as Emotion,
        audioData: data.audioData,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setLiveMessage(aiMessage);
      setCurrentEmotion(aiMessage.emotion || "happy");

      if (data.audioData) {
        playAudio(data.audioData, () => {
          setTimeout(() => {
            setLiveMessage(null);
            setCurrentEmotion("neutral");
          }, 1000);
        });
      }
    } catch (error) {
      console.error("Message processing error:", error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: "ごめんなさい、少し調子が悪みたい…",
        emotion: "sad",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setLiveMessage(errorMsg);
      setCurrentEmotion("sad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetThinkMode = (mode: "fast" | "slow") => {
    setThinkMode(mode);
    try {
      localStorage.setItem(THINK_MODE_KEY, mode);
    } catch (e) {
      console.error("localStorage access failed:", e);
    }
  };

  return {
    messages,
    isLoading,
    isSpeaking,
    liveMessage,
    currentEmotion,
    thinkMode,
    analyserNode: analyserRef.current,
    initializeAudio,
    sendMessage,
    handleSetThinkMode,
    playAudio, // return for use in ChatClient
    setCurrentEmotion, // return for use in ChatClient
    setLiveMessage, // return for use in ChatClient
    createGoodbyeMessage, // return for use in ChatClient
    handleReset,
  };
}
