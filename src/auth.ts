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
        // 関数が呼び出されたタイミングでクライアントを作成
        const supabaseAdmin = createSupabaseAdminClient();
        if (typeof credentials.childId !== "string") return null;

        const { data: child, error } = await supabaseAdmin
          .from("children")
          .select("id, nickname")
          .eq("id", credentials.childId)
          .single();

        if (error || !child) return null;
        return { id: child.id, name: child.nickname };
      },
    }),
    // デモログイン用のCredentialsプロバイダーを追加
    Credentials({
      id: "credentials",
      name: "Demo Login",
      credentials: {},
      async authorize(credentials) {
        // デモ用の固定ユーザー情報を返す
        return { id: `demo-${uuidv4()}`, name: "デモユーザー" };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) {
        return true;
      }
      try {
        // 関数が呼び出されたタイミングでクライアントを作成
        const supabaseAdmin = createSupabaseAdminClient();
        const { data: existingUser } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single();

        if (existingUser) {
          user.id = existingUser.id;
        } else {
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
        return true;
      } catch (error) {
        console.error("SignIn Callback Error:", error);
        return false;
      }
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
