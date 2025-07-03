"use client";

import { getConversationsByChildId } from "@/entities/conversation/services/repository";
import { supabase } from "@/shared/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { goodbyeMessages, initialDemoMessages } from "../lib/constants";
import type { Emotion, Message } from "../model/types";
import { resetHistoryAction } from "../services/chat.actions";

// ブラウザのAudioContextの型定義（クロスブラウザ対応）
interface CustomWindow extends Window {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

// localStorageに思考モードを保存するためのキー
const THINK_MODE_KEY = "near-think-mode";

/**
 * 静的な初期メッセージをランダムに選択するヘルパー関数
 * @returns Messageオブジェクト
 */
const createInitialMessage = (): Message => {
  const msg =
    initialDemoMessages[Math.floor(Math.random() * initialDemoMessages.length)];
  return { id: 0, role: "ai", ...msg };
};

/**
 * 静的な別れのメッセージをランダムに選択するヘルパー関数
 * @returns Messageオブジェクト
 */
const createGoodbyeMessage = (): Message => {
  const msg =
    goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
  return { id: Date.now(), role: "ai", ...msg };
};

/**
 * AIチャット機能のすべての状態とロジックを管理するカスタムフック
 * @param session - NextAuthから提供される現在のユーザーセッション
 * @returns チャットUIを構築するために必要な状態と関数のオブジェクト
 */
export function useChat(session: Session) {
  // ----------------------------------------------------------------
  // State and Refs - 状態と参照の管理
  // ----------------------------------------------------------------

  const userId = session.user!.id!;
  const isDemo = session.user?.name === "デモユーザー";

  const [messages, setMessages] = useState<Message[]>([]); // 表示される会話履歴のリスト
  const [isLoading, setIsLoading] = useState(false); // AIが応答を生成中かを示すフラグ
  const [liveMessage, setLiveMessage] = useState<Message | null>(null); // AIが話している最中のメッセージ
  const [isSpeaking, setIsSpeaking] = useState(false); // 音声が再生中かを示すフラグ
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("neutral"); // VRMモデルの現在の感情
  const [thinkMode, setThinkMode] = useState<"fast" | "slow">("slow"); // AIの思考モード

  const audioContextRef = useRef<AudioContext | null>(null); // Web Audio APIのコンテキスト
  const analyserRef = useRef<AnalyserNode | null>(null); // 口パク用の音声分析ノード
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null); // 現在再生中の音声ソース
  const channelRef = useRef<RealtimeChannel | null>(null); // 購読チャネルを保持するためのRef

  // ----------------------------------------------------------------
  // Initialization Logic - 初期化処理
  // ----------------------------------------------------------------

  useEffect(() => {
    // 1. localStorageから前回の思考モードを読み込む
    try {
      const savedMode = localStorage.getItem(THINK_MODE_KEY);
      if (savedMode === "fast" || savedMode === "slow") setThinkMode(savedMode);
    } catch (e) {
      console.error("localStorage access failed:", e);
    }

    /**
     * 2. 会話履歴を初期化する非同期関数
     */
    const initializeMessages = async () => {
      // isDemoフラグをチェックし、DBへのアクセスを完全に分離する
      if (isDemo) {
        // 【デモモードの場合】
        // DBにアクセスせず、静的な初期メッセージを設定して処理を終了する。
        setMessages([createInitialMessage()]);
      } else {
        // 【通常ユーザーの場合】
        // サーバー上のリポジトリ関数を呼び出して、DBから会話履歴を取得する。
        try {
          const history = await getConversationsByChildId(userId, 50);
          if (history.length > 0) {
            // 履歴が存在すれば、フロントエンドで使えるMessage型に変換してセット
            setMessages(
              history.map((msg) => ({
                id: msg.id,
                role: msg.role,
                text: msg.content,
                emotion: msg.emotion as Emotion,
              }))
            );
          } else {
            // 履歴が存在しない新規ユーザーの場合、初期メッセージをセット
            setMessages([createInitialMessage()]);
          }
        } catch (error) {
          console.error("Failed to fetch history:", error);
          // DBアクセスに失敗した場合も、フォールバックとして初期メッセージを設定
          setMessages([createInitialMessage()]);
        }
      }
    };

    initializeMessages();

    // --- リアルタイム購読のセットアップ ---
    // デモモードの場合は、リアルタイム購読を行わない
    if (isDemo) return;

    // 1. 購読チャネルを定義。'conversations'テーブルの、'child_id'が現在のユーザーIDと一致する行を監視する。
    const channel = supabase
      .channel(`realtime-conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
          filter: `child_id=eq.${userId}`,
        },
        (payload) => {
          // 2. INSERTイベントが発生したら、新しいメッセージデータをペイロードから受け取る
          const newMessage = payload.new as {
            id: number;
            role: "user" | "ai";
            content: string;
            emotion: Emotion | null;
          };

          // 3. 自分の送信したメッセージは既にUIに反映されているので、AIからのメッセージのみを追加する
          if (newMessage.role === "ai") {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: newMessage.id,
                role: "ai",
                text: newMessage.content,
                emotion: newMessage.emotion ?? undefined,
              },
            ]);
          }
        }
      )
      .subscribe();

    // 購読チャネルをRefに保存
    channelRef.current = channel;

    // 4. クリーンアップ関数：コンポーネントがアンマウントされる際に、購読を解除する。
    // これを忘れると、メモリリークや意図しない動作の原因になる。
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isDemo, userId]);

  // ----------------------------------------------------------------
  // Core Functions - 主要な関数
  // ----------------------------------------------------------------

  /**
   * 音声データを再生する関数。
   * @param audioSrc - Base64の音声データ or publicな音声ファイルのパス
   * @param onEnd - 再生終了時に実行されるコールバック
   */
  const playAudio = useCallback((audioSrc: string, onEnd?: () => void) => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
    }
    const context = audioContextRef.current;
    if (!context || !audioSrc) {
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

  /**
   * ユーザーのアクション（クリックなど）をきっかけにWeb Audio APIを初期化する関数
   */
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

  /**
   * ユーザーからのメッセージをサーバーに送信し、AIの応答を処理する関数
   * @param input - ユーザーが入力したテキスト
   */
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
        text: "ごめんなさい、少し調子が悪いみたい……。あとでもう一回試してね！",
        emotion: "sad",
      };
      setMessages((prev) => [...prev, errorMsg]);
      setLiveMessage(errorMsg);
      setCurrentEmotion("sad");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 会話履歴をリセットする関数
   */
  const handleReset = async () => {
    if (isDemo) {
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
        setMessages([createInitialMessage()]);
      } else {
        alert(result.message);
      }
      setIsLoading(false);
    }
  };

  /**
   * AIの思考モードを変更する関数
   * @param mode - 'fast' or 'slow'
   */
  const handleSetThinkMode = (mode: "fast" | "slow") => {
    setThinkMode(mode);
    try {
      localStorage.setItem(THINK_MODE_KEY, mode);
    } catch (e) {
      console.error("localStorage access failed:", e);
    }
  };

  /**
   * ログアウト処理。セッションを破棄し、ログインページにリダイレクトする。
   * Auth.jsのsignOutは、セッションクッキーを削除し、指定されたページにリダイレクトしてくれる。
   */
  const handleSignOut = async () => {
    // isDemoフラグはここで直接使わないが、ロジックとしてsignOutを呼び出す
    await signOut({ callbackUrl: "/login" });
    // 注意: ローカルストレージに何か保存している場合、ここでクリアする必要があるが、
    // 現在の設計では、セッション情報はHttpOnlyクッキーに保存されているため、
    // signOutだけで十分であり、クライアント側での追加のクリアは原則不要。
  };

  // ----------------------------------------------------------------
  // Returned values - UIコンポーネントに渡すための返り値
  // ----------------------------------------------------------------

  return {
    // 状態
    messages,
    isLoading,
    isSpeaking,
    liveMessage,
    currentEmotion,
    thinkMode,
    analyserNode: analyserRef.current, // VRMの口パク用

    // 関数
    initializeAudio,
    sendMessage,
    handleSetThinkMode,
    playAudio,
    setCurrentEmotion,
    setLiveMessage,
    createGoodbyeMessage,
    handleReset,
    handleSignOut,
  };
}
