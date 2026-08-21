import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "__admin_session";
const PARTNER_COOKIE = "__partner_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin routes — require __admin_session
  const publicAdminRoutes = ["/admin/login", "/admin/setup", "/admin/forgot-password", "/admin/reset-password"];
  if (pathname.startsWith("/admin") && !publicAdminRoutes.some(r => pathname.startsWith(r))) {
    const session = req.cookies.get(ADMIN_COOKIE);
    if (!session?.value) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Partner routes — require __partner_session
  const publicPartnerRoutes = ["/partner/login", "/partner/forgot-password", "/partner/reset-password"];
  if (pathname.startsWith("/partner") && !publicPartnerRoutes.some(r => pathname.startsWith(r))) {
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