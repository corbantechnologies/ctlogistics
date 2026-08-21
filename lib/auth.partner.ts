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
  baseURL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/partner` : "http://localhost:3000/api/auth/partner",
  session: {
    cookieName: "__partner_session",
    expiresIn: 60 * 60 * 24 * 7, // 7-day sessions for partners (mobile-friendly)
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      console.log("[PARTNER AUTH] Triggered sendResetPassword for:", data.user.email);
      try {
        const { sendEmail } = await import("@/lib/email");
        const { PasswordResetEmail } = await import("@/emails/PasswordReset");
        const React = await import("react");
        
        console.log("[PARTNER AUTH] Calling sendEmail utility...");
        await sendEmail({
          to: data.user.email,
          subject: "Reset your CT Drive Partner Password",
          react: React.createElement(PasswordResetEmail, {
            userType: "Partner",
            resetLink: data.url,
          }),
        });
        console.log("[PARTNER AUTH] Email successfully handed off to Resend.");
      } catch (err) {
        console.error("[PARTNER AUTH] FATAL ERROR in sendResetPassword:", err);
        throw err;
      }
    },
    // Partners are invited by admin — no public self-registration
    disableSignUp: true,
  },
});

export type PartnerSession = typeof partnerAuth.$Infer.Session;
export type PartnerUser = typeof partnerAuth.$Infer.Session.user;
