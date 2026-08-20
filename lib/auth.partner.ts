import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { partnerUsers, partnerSessions } from "@/db/schema";

/**
 * Fleet Partner authentication instance.
 * Uses __partner_session cookie — completely isolated from admin auth.
 * All data returned to partner-authenticated routes is scoped to session.user.partnerId.
 */
export const partnerAuth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: partnerUsers,
      session: partnerSessions,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET_PARTNER!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  session: {
    cookieName: "__partner_session",
    expiresIn: 60 * 60 * 24 * 7, // 7-day sessions for partners (mobile-friendly)
  },
  emailAndPassword: {
    enabled: true,
    // Partners are invited by admin — no public self-registration
    disableSignUp: true,
  },
});

export type PartnerSession = typeof partnerAuth.$Infer.Session;
export type PartnerUser = typeof partnerAuth.$Infer.Session.user;
