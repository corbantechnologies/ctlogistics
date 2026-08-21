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
  baseURL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/admin` : "http://localhost:3000/api/auth/admin",
  session: {
    cookieName: "__admin_session",
    expiresIn: 60 * 60 * 8, // 8-hour working day sessions
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      console.log("[ADMIN AUTH] Triggered sendResetPassword for:", data.user.email);
      try {
        const { sendEmail } = await import("@/lib/email");
        const { PasswordResetEmail } = await import("@/emails/PasswordReset");
        const React = await import("react");
        
        console.log("[ADMIN AUTH] Calling sendEmail utility...");
        await sendEmail({
          to: data.user.email,
          subject: "Reset your CT Drive Admin Password",
          react: React.createElement(PasswordResetEmail, {
            userType: "Admin",
            resetLink: data.url,
          }),
        });
        console.log("[ADMIN AUTH] Email successfully handed off to Resend.");
      } catch (err) {
        console.error("[ADMIN AUTH] FATAL ERROR in sendResetPassword:", err);
        throw err;
      }
    },
    // Disable public sign-up — admins are created manually via seed or admin panel
    disableSignUp: true,
  },
});

export type AdminSession = typeof adminAuth.$Infer.Session;
export type AdminUser = typeof adminAuth.$Infer.Session.user;
