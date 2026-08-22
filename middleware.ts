import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/admin/setup",
  "/privacy",
  "/terms"
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static files and API routes (except maybe some guarded API routes in the future)
  if (
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/) ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check if it's a protected route (starts with /admin or /partner)
  const isProtectedRoute = (pathname.startsWith("/admin") || pathname.startsWith("/partner")) && !pathname.startsWith("/admin/setup");

  // Use Auth.js to get session
  const session = await auth();

  // If no session and trying to access guarded routes, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL(`/auth/login?next=${encodeURIComponent(pathname)}`, req.url));
  }

  if (session) {
    const role = session.user.role;

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

    // Optional: If user accesses /auth/login while logged in, redirect them
    if (pathname.startsWith("/auth/login")) {
      if (role === "PARTNER") return NextResponse.redirect(new URL("/partner", req.url));
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};