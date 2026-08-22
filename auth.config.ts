import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.NEXT_AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [], // Configured in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const u = user as Record<string, unknown>;
        token.role = u.role;
        token.partnerId = u.partnerId as string | null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.partnerId = token.partnerId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
