# Near (ニア)

<br>

> きみの、いちばん近くに。

<br>

[![Next.js](https://img.shields.io/badge/Next.js-15.x-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-14213d?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Pro-8E77EE?style=for-the-badge&logo=googlebard&logoColor=white)](https://gemini.google.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3fc87a?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-611f72?style=for-the-badge&logo=authdotjs&logoColor=white)](https://authjs.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Near (ニア)** は、子どもたちが感情豊かな3Dキャラクターと自由に対話できる、スマートフォン向けのAIチャットアプリケーションです。嬉しかったこと、悩みごと、誰にも言えない本音まで。ニアは最高の友達として、いつでも子どもの心に寄り添います。

このプロジェクトは単なるチャットアプリではありません。子どものプライバシーを最大限に尊重しながら、保護者には「監視」ではない、新しい「見守り」の形を提供することをミッションとしています。

---

## 🚀 デモサイト (Live Demo)

**ニアとの対話は、アカウント登録不要で今すぐ体験できます！**
<br/>
(スマートフォンでの閲覧を強く推奨します)

### [https://near.new](https://near.new)

---

## 🖼️ スクリーンショット (Screenshot)

![image](https://github.com/user-attachments/assets/b85d3c38-91be-4211-b89b-ee25a5e176a1)


---

## 💎 設計思想 - 「監視」ではなく「見守り」

このアプリの根幹をなすのは、**「子供のプライバシーを守りつつ、保護者に安心を届ける」** という、繊細で、しかし最も重要な価値観です。

具体的な会話内容を見せるのは論外です。単なる「ネガティブ発言の回数」のような直接的な指標ですら、かえって保護者の不安を煽り、子供を詮索するきっかけになりかねません。

ニアが目指すのは、**保護者に「何かあったのかな？」と対話のきっかけを与え、詮索ではなく、親子のコミュニケーションを促すこと**です。そのため、保護者向けダッシュボードでは、あえて具体的な情報を徹底的に排除し、子供の「状態の変化」を示唆する、客観的で解釈の余地のあるデータのみを提示します。

| 見せるもの | 見せないもの |
| :--- | :--- |
| ✅ **コミュニケーション・バイタル**（会話頻度の変化、感情表現の豊かさ） | ❌ **具体的な会話内容やトピック** |
| ✅ **本当に深刻なリスクが検知された場合のアラート** | ❌ **一時的なネガティブ感情の警告** |
| ✅ **公的な相談窓口への案内** | ❌ **プライバシーを侵害する詳細データ** |

---

## ✨ 主な機能 (Features)

*   **💬 リアルタイムAIチャット**
    *   **Gemini 1.5 Flash/Pro** を活用し、ユーザーのメッセージに対して状況に応じた自然で共感的な応答を生成します。

*   **💃 表現力豊かな3Dインタラクション**
    *   `@pixiv/three-vrm` を活用し、会話の内容や感情に合わせて表情、まばたき、呼吸、体の動きをリアルタイムに制御。
    *   Gemini APIから返される感情(`happy`, `sad`など)に基づき、多彩なアニメーションで生命感を演出します。
    *   音声データからリップシンク（口パク）を生成し、まるで本当に話しているかのような体験を提供します。
    *   キャラクターの頭をタップすると、嬉しそうな反応を返すなど、直接的なインタラクションが可能です。

*   **🛡️ 保護者向け見守りダッシュボード**
    *   **コミュニケーション・バイタル**: 「先週と比べて会話が増えた」といった会話頻度の変化や、「いろいろな気持ちを表現できている」といった感情の多様性を、プライバシーに配慮した形で可視化します。
    *   **メンタルヘルス・アラート**: 通常時は何も表示せず、バックエンドの高度な分析によって明確な閾値を超えた場合にのみ、専門家への相談を促す「大切なお知らせ」を表示します。

*   **🔐 役割に基づいた認証システム**
    *   **保護者**: `Auth.js (NextAuth.js v5)` と `Google Provider` を使用した、安全なOAuth認証。
    *   **子ども**: 保護者が発行したQRコードを読み込むだけでログインが完了する、簡単でセキュアな認証フロー。

*   **🧠 高度な非同期メンタルヘルス分析**
    *   会話が保存されると、`Supabase Trigger`が非同期タスクキューにリクエストを追加。
    *   `pg_cron`が定期的に`Supabase Edge Function`を呼び出し、キューを処理。
    *   **マルチステップLLM判定システム**:
        1.  **初期フィルタリング**: `Gemini 1.5 Flash`で明らかに無害な会話を高速かつ安価に除外。
        2.  **リスクスコアリング**: フィルタリングを通過した会話のみを`Gemini 1.5 Pro`で多角的に分析し、深刻なリスクを検知します。

---

## 🛠️ 技術スタック (Tech Stack)

| カテゴリ | 技術・サービス |
| :--- | :--- |
| **Frontend** | [Next.js (App Router)](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/) |
| **3D / VRM** | [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei), [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) |
| **Backend & AI** | [Google Gemini API (1.5 Pro/Flash)](https://ai.google.dev/), [Vercel Serverless Functions](https://vercel.com/docs/functions) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL, Realtime, Storage, Auth) |
| **Serverless (Async)**| [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno), [Supabase pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) |
| **Authentication** | [Auth.js (NextAuth.js v5)](https://authjs.dev/), Google Provider, Credentials Provider |
| **Infrastructure** | [Vercel](https://vercel.com/) |

---

## 🏗️ アーキテクチャ (Architecture)

このアプリケーションは、会話の保存と、その会話の重い分析処理を**非同期**で行うことで、ユーザー体験を損なうことなく、堅牢でスケーラブルなシステムを実現しています。

```mermaid
graph TD
    subgraph Frontend (Next.js on Vercel)
        A[User] -- 1. Chat --> B(Chat UI);
        B -- 2. POST /api/chat --> C[Chat API];
    end

    subgraph Backend (Supabase)
        D[DB: conversations] -- 4. Trigger --> E[DB: analysis_queue];
        F[pg_cron] -- 5. Every 1 min --> G[Edge Function: process-queue];
    end
    
    subgraph Analysis API (Next.js on Vercel)
        H[/api/analyze] -- 8. Risk Scoring --> I[Gemini 1.5 Pro];
    end

    C -- 3. INSERT --> D;
    G -- 6. Fetch Task --> E;
    G -- 7. POST /api/analyze --> H;
    I -- 9. Return Scores --> H;
    H -- 10. INSERT --> J[DB: mental_health_scores];

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#3fc87a,stroke:#333,stroke-width:2px
    style E fill:#3fc87a,stroke:#333,stroke-width:2px
    style J fill:#3fc87a,stroke:#333,stroke-width:2px
```

1.  **会話**: ユーザーがフロントエンドでメッセージを送信します。
2.  **API呼び出し**: Next.jsのChat API (`/api/chat`) が呼び出されます。
3.  **会話保存**: APIはSupabaseの`conversations`テーブルに会話データを即座に保存します。**ユーザーへの応答はこの時点で完了します。**
4.  **トリガー発火**: 会話の保存をトリガーに、分析リクエストが`analysis_queue`テーブルにタスクとして追加されます。
5.  **定期実行**: `pg_cron`が1分ごとにEdge Functionを呼び出します。
6.  **タスク取得**: Edge Functionは`analysis_queue`から未処理のタスクを取得します。
7.  **分析API呼び出し**: Edge FunctionはNext.jsの分析API (`/api/analyze`)を呼び出します。
8.  **リスク分析**: 分析APIがGemini 1.5 Proを使って会話のリスクスコアを計算します。
9.  **スコア返却**: GeminiがJSON形式でスコアを返します。
10. **結果保存**: 分析結果が`mental_health_scores`テーブルに保存されます。

---

## 🚀 ローカル環境での実行 (Getting Started)

### 前提条件
*   [Node.js](https://nodejs.org/) (v18.17 or later)
*   [Docker](https://www.docker.com/products/docker-desktop/) (実行されていること)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. リポジトリのクローン
```bash
git clone https://github.com/[YOUR_USERNAME]/near.git
cd near
```

### 2. パッケージのインストール
```bash
npm install
```

### 3. Supabase プロジェクトのセットアップ
1. Supabaseにログインし、新しいプロジェクトを作成します。
2. プロジェクトのルートで、ローカル環境とSupabaseプロジェクトをリンクします。
   ```bash
   supabase login
   supabase link --project-ref [YOUR_SUPABASE_PROJECT_ID]
   ```
3. Supabaseのマイグレーションを適用して、データベーススキーマをセットアップします。
   ```bash
   supabase db push
   ```
   (注: このリポジトリにマイグレーションファイルが含まれている場合のコマンドです。ない場合はスキーマを手動で適用する必要があります。)

### 4. 環境変数の設定
`.env.local.example` をコピーして `.env.local` を作成し、ご自身のSupabaseプロジェクトのURL、キー、およびGoogle Cloud、Auth.jsの認証情報を入力してください。

```bash
cp .env.local.example .env.local
```

### 5. ローカルサーバーの起動
```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

---

## 展望 (Future Work)

- [ ] **通知システムの拡充**: アラートをメールだけでなくLINEなどでも通知
- [ ] **キャラクターの多様化**: ユーザーが対話するキャラクターを選択・カスタマイズできる機能
- [ ] **ダッシュボードの進化**: 会話頻度の推移をグラフで表示するなど、よりリッチな可視化
- [ ] **音声入力への対応**: テキストだけでなく、音声での入力機能

---

## ©️ ライセンス (License)

This project is licensed under the MIT License.
