"use server";

import { adminAuth } from "@/lib/auth.admin";
import { partnerAuth } from "@/lib/auth.partner";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ─── Admin Auth Actions ───────────────────────────────────────────────────────

export async function adminSignIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    await adminAuth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch {
    return { error: "Invalid credentials" };
  }

  redirect("/admin/dispatch");
}

export async function adminSignOut() {
  await adminAuth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

export async function getAdminSession() {
  return adminAuth.api.getSession({ headers: await headers() });
}

// ─── Partner Auth Actions ─────────────────────────────────────────────────────

export async function partnerSignIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    await partnerAuth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch {
    return { error: "Invalid credentials" };
  }

  redirect("/partner/dashboard");
}

export async function partnerSignOut() {
  await partnerAuth.api.signOut({ headers: await headers() });
  redirect("/partner/login");
}

export async function getPartnerSession() {
  return partnerAuth.api.getSession({ headers: await headers() });
}
