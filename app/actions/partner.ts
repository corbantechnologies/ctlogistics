"use server";

import { db } from "@/db";
import { assets, drivers, tripLegs, partners, bookings } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendPaymentRequest } from "@/lib/email";

async function getPartnerId(): Promise<string | null> {
  const session = await auth();
  if (!session) return null;
  // partnerId is stored on the user record in users
  const user = await db.query.users.findFirst({
    where: eq((await import("@/db/schema")).users.id, session.user.id),
  });
  return user?.partnerId ?? null;
}

export async function getMyFleet() {
  const partnerId = await getPartnerId();
  if (!partnerId) return [];
  return db.query.assets.findMany({ where: eq(assets.partnerId, partnerId) });
}

export async function getMyDrivers() {
  const partnerId = await getPartnerId();
  if (!partnerId) return [];
  return db.query.drivers.findMany({ where: eq(drivers.partnerId, partnerId) });
}

export async function getMyUpcomingLegs() {
  const partnerId = await getPartnerId();
  if (!partnerId) return [];
  // Get all legs assigned to this partner via assets
  const myAssets = await db.query.assets.findMany({
    where: eq(assets.partnerId, partnerId),
    columns: { id: true },
  });
  const assetIds = myAssets.map((a) => a.id);
  if (!assetIds.length) return [];

  return db.query.tripLegs.findMany({
    where: inArray(tripLegs.assignedAssetId, assetIds),
    with: { booking: true, assignedAsset: true, driver: true },
    orderBy: tripLegs.scheduledTime,
  });
}

export async function getMarketplaceJobs() {
  const partnerId = await getPartnerId();
  if (!partnerId) return [];

  // Fetch trip legs without an assigned asset (unassigned marketplace inquiries)
  const unassignedLegs = await db.query.tripLegs.findMany({
    where: eq(tripLegs.status, "SCHEDULED"),
    with: { booking: true },
    orderBy: tripLegs.scheduledTime,
  });

  // Filter legs where assignedAssetId is null or missing
  return unassignedLegs.filter((leg) => !leg.assignedAssetId);
}

export async function claimJobMarketplace(legId: string, assetId: string) {
  const partnerId = await getPartnerId();
  if (!partnerId) return { error: "Unauthorized" };

  // Verify partner owns the asset
  const targetAsset = await db.query.assets.findFirst({
    where: and(eq(assets.id, assetId), eq(assets.partnerId, partnerId)),
  });

  if (!targetAsset) {
    return { error: "Selected vehicle does not belong to your partner account." };
  }

  // Fetch the trip leg and associated booking
  const leg = await db.query.tripLegs.findFirst({
    where: eq(tripLegs.id, legId),
    with: { booking: true },
  });

  if (!leg) {
    return { error: "Trip leg not found." };
  }

  // Assign asset to trip leg & update asset availability
  await db.update(tripLegs).set({
    assignedAssetId: assetId,
  }).where(eq(tripLegs.id, legId));

  await db.update(assets).set({
    availabilityStatus: "ON_TRIP",
  }).where(eq(assets.id, assetId));

  // Trigger Payment Request Email to client with payment details
  if (leg.booking && leg.booking.clientEmail) {
    const totalSell = parseFloat(leg.booking.totalSellAmount || "0");
    const depositPct = leg.booking.depositPercentage || 30;
    const depositReq = (totalSell * depositPct) / 100;

    await sendPaymentRequest({
      to: leg.booking.clientEmail,
      clientName: leg.booking.clientName,
      bookingRef: `BK-${leg.booking.id.substring(0, 8).toUpperCase()}`,
      serviceType: leg.booking.bookingType || "Transport Service",
      vehicleCategory: targetAsset.makeModel,
      totalAmount: totalSell,
      depositRequired: depositReq,
      paymentUrl: `https://www.ctdrive.co.ke/track/${leg.booking.accessToken}`,
    }).catch(err => console.error("Error sending Payment Request email upon partner claim:", err));
  }

  revalidatePath("/partner/jobs");
  revalidatePath("/partner/dashboard");
  return { success: true };
}

export async function updateLegStatus(
  legId: string,
  status: "EN_ROUTE" | "ARRIVED" | "BOARDED_LOADED" | "COMPLETED"
) {
  const partnerId = await getPartnerId();
  if (!partnerId) return { error: "Unauthorized" };

  await db.update(tripLegs).set({
    status,
    ...(status === "EN_ROUTE" ? { actualStartTime: new Date() } : {}),
    ...(status === "COMPLETED" ? { actualEndTime: new Date() } : {}),
  }).where(eq(tripLegs.id, legId));

  revalidatePath("/partner/dashboard");
  return { success: true };
}

export async function updateAssetAvailability(
  assetId: string,
  availabilityStatus: string
) {
  const partnerId = await getPartnerId();
  if (!partnerId) return { error: "Unauthorized" };

  await db
    .update(assets)
    .set({ availabilityStatus })
    .where(and(eq(assets.id, assetId), eq(assets.partnerId, partnerId)));

  revalidatePath("/partner/fleet");
  revalidatePath("/partner/jobs");
  return { success: true };
}

export async function registerPartnerAsset(data: {
  plateNumber: string;
  makeModel: string;
  category: any;
  seatingCapacity: number;
  dailyRate?: number;
  hourlyRate?: number;
  features?: string;
  offeredServices?: string;
}) {
  const partnerId = await getPartnerId();
  if (!partnerId) return { error: "Unauthorized" };

  try {
    const newAsset = await db.insert(assets).values({
      partnerId,
      plateNumber: data.plateNumber.toUpperCase().trim(),
      makeModel: data.makeModel,
      category: data.category,
      seatingCapacity: data.seatingCapacity,
      dailyRate: data.dailyRate ? String(data.dailyRate) : null,
      hourlyRate: data.hourlyRate ? String(data.hourlyRate) : null,
      features: data.features || "4x4, AC, Standard Comfort",
      offeredServices: data.offeredServices || "Airport Transfer, Safari, Chauffeur",
      availabilityStatus: "AVAILABLE",
      isActive: true,
    }).returning();

    revalidatePath("/partner/fleet");
    revalidatePath("/partner/jobs");
    return { success: true, asset: newAsset[0] };
  } catch (error: any) {
    console.error("Error registering partner asset:", error);
    return { error: error.message || "Failed to register vehicle" };
  }
}