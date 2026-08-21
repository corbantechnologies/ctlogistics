"use server";

import { db } from "@/db";
import { assets, drivers, tripLegs, partners } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

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

  const { inArray } = await import("drizzle-orm");
  return db.query.tripLegs.findMany({
    where: inArray(tripLegs.assignedAssetId, assetIds),
    with: { booking: true, assignedAsset: true, driver: true },
    orderBy: tripLegs.scheduledTime,
  });
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