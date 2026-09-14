import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const authMiddleware = auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth; // NextAuth v5 automatically attaches session to req.auth

  // Allow static files, public assets, and NextAuth API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check if it's a protected route (starts with /admin or /partner)
  const isProtectedRoute =
    (pathname.startsWith("/admin") || pathname.startsWith("/partner")) &&
    !pathname.startsWith("/admin/setup");

  // If no session and trying to access guarded routes, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(
      new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, req.url)
    );
  }

  if (session) {
    const role = session.user?.role;

    // Guard /admin routes
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/setup")) {
      if (role === "PARTNER") {
        return NextResponse.redirect(new URL("/partner", req.url));
      }
    }

    // Guard /partner routes
    if (pathname.startsWith("/partner")) {
      if (role === "ADMIN" || role === "DISPATCHER") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // If user accesses /auth/login while already logged in, redirect them to their portal
    if (pathname.startsWith("/auth/login")) {
      if (role === "PARTNER") return NextResponse.redirect(new URL("/partner", req.url));
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export default authMiddleware;
export const proxy = authMiddleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};