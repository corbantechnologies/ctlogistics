"use server";

import { z } from "zod";
import { db } from "@/db";
import { users, partners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

const createAdminSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "DISPATCHER"]),
});

const createPartnerUserSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  partnerId: z.string().uuid("Select a valid partner"),
});

// ── Create admin or dispatcher account ───────────────────────────────────────
export async function createAdminUser(formData: FormData) {
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.role, "ADMIN"),
  });
  const isFirstSetup = !existingAdmin;

  if (!isFirstSetup) {
    const session = await auth();
    if (!session) return { error: "Unauthorized" };

    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });
    if (currentUser?.role !== "ADMIN") {
      return { error: "Only admins can create user accounts" };
    }
  }

  const parsed = createAdminSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;

  // Check for duplicate
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });
  if (existing) return { error: "An account with this email already exists" };

  const hashedPassword = await bcrypt.hash(data.password, 12);

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    role: data.role,
    hashedPassword,
    isActive: true,
  });

  revalidatePath("/admin/users");
  return { success: true, message: `${data.role === "ADMIN" ? "Admin" : "Dispatcher"} account created for ${data.email}` };
}

// ── Create partner portal login ───────────────────────────────────────────────
export async function createPartnerUser(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const parsed = createPartnerUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;

  // Verify partner exists and is approved
  const partner = await db.query.partners.findFirst({
    where: eq(partners.id, data.partnerId),
  });
  if (!partner) return { error: "Partner not found" };

  // Check for duplicate
  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });
  if (existing) return { error: "A partner login with this email already exists" };

  const hashedPassword = await bcrypt.hash(data.password, 12);

  await db.insert(users).values({
    partnerId: data.partnerId,
    role: "PARTNER",
    name: data.name,
    email: data.email,
    hashedPassword,
    isActive: true,
  });

  const { sendEmail } = await import("@/lib/email");
  const { PartnerWelcomeEmail } = await import("@/emails/PartnerWelcome");
  const React = await import("react");

  await sendEmail({
    to: data.email,
    subject: "Welcome to CT Drive Partner Network",
    react: React.createElement(PartnerWelcomeEmail, {
      partnerName: data.name,
      loginEmail: data.email,
      tempPassword: data.password,
      portalLink: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.ctdrive.co.ke"}/auth/login`,
    }),
  });

  revalidatePath("/admin/users");
  return { success: true, message: `Partner login created for ${data.email} (${partner.companyName})` };
}

// ── Deactivate / reactivate user ─────────────────────────────────────────────
export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  if (currentUser?.role !== "ADMIN") return { error: "Only admins can change user status" };
  if (userId === session.user.id) return { error: "You cannot deactivate your own account" };

  await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { success: true };
}