import { createSupabaseAdminClient } from "@/shared/lib/supabase/client";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { v4 as uuidv4 } from "uuid";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "qr-login",
      name: "QR Login",
      credentials: { childId: { type: "text" } },
      async authorize(credentials) {
        const supabaseAdmin = createSupabaseAdminClient();
        if (typeof credentials.childId !== "string") return null;

        const { data: child } = await supabaseAdmin
          .from("children")
          .select("id, nickname")
          .eq("id", credentials.childId)
          .single();

        if (!child) return null;
        return { id: child.id, name: child.nickname };
      },
    }),
    Credentials({
      id: "credentials",
      name: "Demo Login",
      credentials: {},
      async authorize(credentials) {
        return { id: `demo-${uuidv4()}`, name: "デモユーザー" };
      },
    }),
  ],
  callbacks: {
    /**
     * signInコールバック
     * 認証フローの途中で追加処理を行うためのコールバック。
     * ここでのロジックの不整合が、リダイレクトループの根本原因でした。
     */
    async signIn({ user, account }) {
      // プロバイダーが 'google' の場合のみ、特別なDB処理を実行する
      if (account?.provider === "google") {
        // Googleアカウントにemailがなければ認証を拒否する
        if (!user.email) {
          console.error("Google account does not have an email.");
          return false;
        }

        try {
          const supabaseAdmin = createSupabaseAdminClient();
          const { data: existingUser } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("email", user.email)
            .single();

          if (existingUser) {
            // 既存ユーザーの場合、セッションに含めるuserオブジェクトのIDをDBのUUIDで上書きする
            user.id = existingUser.id;
          } else {
            // 新規ユーザーの場合、新しいUUIDを生成してDBに登録し、そのIDをuserオブジェクトに設定する
            const newUserId = uuidv4();
            const { error } = await supabaseAdmin.from("users").insert({
              id: newUserId,
              email: user.email,
              name: user.name,
              avatar_url: user.image,
            });
            if (error) throw error;
            user.id = newUserId;
          }
        } catch (error) {
          console.error("SignIn Callback DB Error:", error);
          return false; // DBエラーが発生した場合は認証を拒否する
        }
      }

      // 'google'プロバイダーで上記処理が成功した場合、
      // または、'credentials'や'qr-login'など他のプロバイダーの場合は、
      // そのまま認証プロセスを続行する。
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
