import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "parent" | "child";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "parent" | "child";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "parent" | "child";
  }
}
