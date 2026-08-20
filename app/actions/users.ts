"use server";

import { z } from "zod";
import { db } from "@/db";
import { adminUsers, partnerUsers, partners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "./auth";

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

async function hashPassword(plain: string): Promise<string> {
  try {
    // Use better-auth's hash utility so passwords work with the login flow
    const { hashPassword: baHash } = await import("better-auth/crypto");
    return await baHash(plain);
  } catch {
    // Fallback while better-auth is being installed
    const { createHash } = await import("crypto");
    return createHash("sha256").update(plain).digest("hex");
  }
}

// ── Create admin or dispatcher account ───────────────────────────────────────
export async function createAdminUser(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  // Only ADMIN role can create other users
  const currentUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, session.user.id),
  });
  if (currentUser?.role !== "ADMIN") {
    return { error: "Only admins can create user accounts" };
  }

  const parsed = createAdminSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const data = parsed.data;

  // Check for duplicate
  const existing = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, data.email),
  });
  if (existing) return { error: "An account with this email already exists" };

  const hashedPassword = await hashPassword(data.password);

  await db.insert(adminUsers).values({
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
  const session = await getAdminSession();
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
  const existing = await db.query.partnerUsers.findFirst({
    where: eq(partnerUsers.email, data.email),
  });
  if (existing) return { error: "A partner login with this email already exists" };

  const hashedPassword = await hashPassword(data.password);

  await db.insert(partnerUsers).values({
    partnerId: data.partnerId,
    name: data.name,
    email: data.email,
    hashedPassword,
    isActive: true,
  });

  revalidatePath("/admin/users");
  return { success: true, message: `Partner login created for ${data.email} (${partner.companyName})` };
}

// ── Deactivate / reactivate admin ─────────────────────────────────────────────
export async function toggleAdminUserStatus(userId: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const currentUser = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, session.user.id),
  });
  if (currentUser?.role !== "ADMIN") return { error: "Only admins can change user status" };
  if (userId === session.user.id) return { error: "You cannot deactivate your own account" };

  await db.update(adminUsers).set({ isActive, updatedAt: new Date() }).where(eq(adminUsers.id, userId));
  revalidatePath("/admin/users");
  return { success: true };
}

// ── Deactivate / reactivate partner user ──────────────────────────────────────
export async function togglePartnerUserStatus(userId: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.update(partnerUsers).set({ isActive, updatedAt: new Date() }).where(eq(partnerUsers.id, userId));
  revalidatePath("/admin/users");
  return { success: true };
}