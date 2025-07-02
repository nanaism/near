/**
 * このファイルは、src/auth.tsで定義した認証ロジック（GETおよびPOSTハンドラ）を
 * Next.jsのルーティングシステムに公開するためのエントリーポイントです。
 *
 * [...nextauth]というフォルダ名は「キャッチオールルート」と呼ばれ、
 * /api/auth/signin, /api/auth/signout, /api/auth/sessionなど、
 * /api/auth/で始まるすべてのリクエストがこのファイルにルーティングされるようになります。
 */
export { GET, POST } from "@/auth";
