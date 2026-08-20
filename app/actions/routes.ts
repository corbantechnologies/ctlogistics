"use server";

import { db } from "@/db";
import { routes, routeRateCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "./auth";
import { z } from "zod";

export async function createRoute(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.insert(routes).values({
    name: formData.get("name") as string,
    originZone: formData.get("originZone") as string,
    destinationZone: formData.get("destinationZone") as string,
    estimatedDurationMins: parseInt(formData.get("estimatedDurationMins") as string),
    standardDistanceKm: parseInt(formData.get("standardDistanceKm") as string),
    tollsIncluded: formData.get("tollsIncluded") === "true",
    deadheadIncluded: formData.get("deadheadIncluded") === "true",
    isActive: true,
  });
  revalidatePath("/admin/routes");
  return { success: true };
}

export async function toggleRouteStatus(routeId: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  await db.update(routes).set({ isActive }).where(eq(routes.id, routeId));
  revalidatePath("/admin/routes");
  return { success: true };
}

export async function updateRateCard(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  await db.update(routeRateCards).set({
    retailSellRate: formData.get("retailSellRate") as string,
    defaultBuyRate: formData.get("defaultBuyRate") as string,
    updatedAt: new Date(),
  }).where(eq(routeRateCards.id, id));
  revalidatePath("/admin/routes");
  return { success: true };
}