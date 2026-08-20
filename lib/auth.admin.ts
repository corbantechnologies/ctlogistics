import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { adminUsers, adminSessions } from "@/db/schema";

/**
 * Admin & Dispatcher authentication instance.
 * Uses __admin_session cookie — completely isolated from partner auth.
 * Access this via `adminAuth` in admin route handlers and server actions.
 */
export const adminAuth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: adminUsers,
      session: adminSessions,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET_ADMIN!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  session: {
    cookieName: "__admin_session",
    expiresIn: 60 * 60 * 8, // 8-hour working day sessions
  },
  emailAndPassword: {
    enabled: true,
    // Disable public sign-up — admins are created manually via seed or admin panel
    disableSignUp: true,
  },
});

export type AdminSession = typeof adminAuth.$Infer.Session;
export type AdminUser = typeof adminAuth.$Infer.Session.user;
