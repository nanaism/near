import { auth } from "@/auth";

export default auth((req) => {
  // 保護者向け管理画面へのアクセス制御
  if (!req.auth?.user && req.nextUrl.pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(loginUrl);
  }
  return;
});

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
};
