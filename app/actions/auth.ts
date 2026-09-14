"use server";

import { signIn, signOut, auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";
import { PasswordResetEmail } from "@/emails/PasswordReset";
import * as React from "react";

// ─── Shared Auth Actions ──────────────────────────────────────────────────────

export async function authenticate(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("next") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Look up user by email to determine role for post-login redirect
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.isActive) {
    return { error: "Invalid credentials" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
      return { error: "Invalid credentials" };
    }
    throw error;
  }

  // Determine final redirect URL based on role if next param wasn't specified
  let finalRedirect = redirectTo && redirectTo !== "/" ? redirectTo : null;
  if (!finalRedirect) {
    finalRedirect = user.role === "PARTNER" ? "/partner" : "/admin";
  }

  return { success: true, redirectTo: finalRedirect };
}

export async function logOut() {
  await signOut({ redirect: true, redirectTo: "/auth/login" });
}

export async function getSession() {
  return await auth();
}

// ─── Custom Password Reset Flow ───────────────────────────────────────────────

export async function requestPasswordReset(email: string, userType: "Admin" | "Partner") {
  if (!email) return { error: "Email is required" };

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    // Return success to prevent email enumeration
    return { success: true };
  }

  const token = uuidv4() + uuidv4(); // 64-char hex string
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

  // Save token to DB
  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/${userType.toLowerCase()}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: email,
      subject: `Reset your CT Drive ${userType} Password`,
      react: React.createElement(PasswordResetEmail, {
        userType,
        resetLink,
      }),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send reset email:", error);
    return { error: "Failed to send reset email. Please try again later." };
  }
}

export async function verifyAndResetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) return { error: "Token and new password are required" };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters" };

  const vt = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (!vt) return { error: "Invalid or expired token" };
  if (new Date() > vt.expires) {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
    return { error: "Token has expired" };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, vt.identifier),
  });

  if (!user) return { error: "User not found" };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.update(users)
    .set({ hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Delete the used token
  await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

  return { success: true };
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  
  if (!currentPassword || !newPassword) return { error: "Both passwords are required" };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters" };

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) return { error: "User not found" };

  const isValid = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isValid) return { error: "Incorrect current password" };

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.update(users)
    .set({ hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return { success: true };
}
