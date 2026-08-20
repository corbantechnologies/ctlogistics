"use server";

import { db } from "@/db";
import { partners, assets, drivers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "./auth";

export async function createPartner(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  await db.insert(partners).values({
    companyName: formData.get("companyName") as string,
    contactName: formData.get("contactName") as string,
    phone: formData.get("phone") as string,
    email: (formData.get("email") as string) || null,
    notes: (formData.get("notes") as string) || null,
    complianceStatus: "PENDING",
    isActive: true,
  });
  revalidatePath("/admin/fleet");
  return { success: true };
}

export async function updatePartnerCompliance(partnerId: string, status: "PENDING" | "APPROVED" | "SUSPENDED") {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  await db.update(partners).set({ complianceStatus: status }).where(eq(partners.id, partnerId));
  revalidatePath("/admin/fleet");
  return { success: true };
}

export async function addAsset(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  await db.insert(assets).values({
    partnerId: formData.get("partnerId") as string,
    plateNumber: (formData.get("plateNumber") as string).toUpperCase(),
    makeModel: formData.get("makeModel") as string,
    year: parseInt(formData.get("year") as string) || undefined,
    color: (formData.get("color") as string) || null,
    category: formData.get("category") as any,
    seatingCapacity: parseInt(formData.get("seatingCapacity") as string),
    isSelfDriveEligible: formData.get("isSelfDriveEligible") === "true",
    hasGpsTracker: formData.get("hasGpsTracker") === "true",
    isActive: true,
  });
  revalidatePath("/admin/fleet");
  return { success: true };
}