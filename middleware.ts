import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "__admin_session";
const PARTNER_COOKIE = "__partner_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes — require __admin_session
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/admin/setup")) {
    const session = req.cookies.get(ADMIN_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Partner routes — require __partner_session
  if (pathname.startsWith("/partner") && !pathname.startsWith("/partner/login")) {
    const session = req.cookies.get(PARTNER_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL("/partner/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/partner/:path*"],
};