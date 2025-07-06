import type { Emotion } from "../model/types";

// アプリケーションのバージョン
export const APP_VERSION = "5.0.0";

// 会話履歴を要約するトリガーとなる会話数
export const SUMMARY_TRIGGER_COUNT = 10;

// AIに渡す直近の会話履歴の最大数
export const MAX_CONVERSATION_HISTORY = 10;

// 型を明示的に定義
type StaticMessage = {
  text: string;
  emotion: Emotion;
  audioUrl: string;
};

// デモモードでの初回メッセージリスト
export const initialDemoMessages: StaticMessage[] = [
  {
    text: "こんにちは！わたしはニア。おはなししよう！",
    emotion: "happy",
    audioUrl: "/sounds/greeting1.wav",
  },
  {
    text: "今日どんなことがあったの？ニアに教えてくれるとうれしいな！",
    emotion: "happy",
    audioUrl: "/sounds/greeting2.wav",
  },
  {
    text: "やっほー！君が来てくれるの、ずっと待ってたんだ！さっそくおしゃべりしよっ！",
    emotion: "happy",
    audioUrl: "/sounds/greeting4.wav",
  },
];

// 会話を終了するときのメッセージリスト
export const goodbyeMessages: StaticMessage[] = [
  {
    text: "またね！いつでも待ってるからね！",
    emotion: "happy",
    audioUrl: "/sounds/goodbye1.wav",
  },
  {
    text: "バイバイ！次のおはなしも楽しみにしてるね！",
    emotion: "happy",
    audioUrl: "/sounds/goodbye2.wav",
  },
  {
    text: "じゃあね！また会いに来てね～！",
    emotion: "happy",
    audioUrl: "/sounds/goodbye3.wav",
  },
];
