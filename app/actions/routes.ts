"use server";

import { db } from "@/db";
import { routes, routeRateCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "./auth";
import { z } from "zod";

export async function createRouteWithRateCards(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const routeId = await db.transaction(async (tx) => {
      // 1. Create the Route
      const [newRoute] = await tx.insert(routes).values({
        name: formData.get("name") as string,
        originZone: formData.get("originZone") as string,
        destinationZone: formData.get("destinationZone") as string,
        estimatedDurationMins: parseInt(formData.get("estimatedDurationMins") as string),
        standardDistanceKm: parseInt(formData.get("standardDistanceKm") as string),
        tollsIncluded: formData.get("tollsIncluded") === "true",
        deadheadIncluded: formData.get("deadheadIncluded") === "true",
        isActive: true,
      }).returning({ id: routes.id });

      // 2. Parse Rate Cards from formData
      const categories = [
        "SALOON", "COMPACT_SUV", "PRADO_LUXURY", "SAFARI_CRUISER_4X4",
        "TOUR_VAN", "MINIBUS_14_SEATER", "COASTER_33_SEATER", "COACH_50_SEATER"
      ];

      const rateCardsToInsert = categories.map((cat) => {
        const defaultBuyRate = parseInt(formData.get(`buy_${cat}`) as string) || 0;
        const retailSellRate = parseInt(formData.get(`sell_${cat}`) as string) || 0;
        return {
          routeId: newRoute.id,
          vehicleCategory: cat as any,
          defaultBuyRate,
          retailSellRate,
        };
      }).filter(rc => rc.defaultBuyRate > 0 && rc.retailSellRate > 0);

      if (rateCardsToInsert.length > 0) {
        await tx.insert(routeRateCards).values(rateCardsToInsert);
      }

      return newRoute.id;
    });

    revalidatePath("/admin/routes");
    return { success: true, id: routeId };
  } catch (error) {
    console.error("Failed to create route:", error);
    return { error: "Failed to create corridor and rate cards" };
  }
}

export async function toggleRouteStatus(routeId: string, isActive: boolean) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  await db.update(routes).set({ isActive }).where(eq(routes.id, routeId));
  revalidatePath("/admin/routes");
  return { success: true };
}

export async function deleteRoute(routeId: string) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  // Soft delete logic: We assume setting isActive to false acts as a soft-delete/suspension. 
  // We don't drop rows to keep booking history intact.
  await db.update(routes).set({ isActive: false }).where(eq(routes.id, routeId));
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