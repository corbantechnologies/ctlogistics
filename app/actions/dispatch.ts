"use server";

import { z } from "zod";
import { db } from "@/db";
import { bookings, tripLegs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "./auth";

const assignSchema = z.object({
  tripLegId: z.string().uuid(),
  bookingId: z.string().uuid(),
  assetId: z.string().uuid(),
  driverId: z.string().uuid(),
  partnerPayout: z.coerce.number().min(0),
});

export async function assignPartnerToBooking(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = assignSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Invalid data" };

  const data = parsed.data;

  await db
    .update(tripLegs)
    .set({
      assignedAssetId: data.assetId,
      driverId: data.driverId,
      partnerPayout: data.partnerPayout.toString(),
    })
    .where(eq(tripLegs.id, data.tripLegId));

  await db
    .update(bookings)
    .set({ status: "DISPATCHED", updatedAt: new Date() })
    .where(eq(bookings.id, data.bookingId));

  revalidatePath("/admin/dispatch");
  return { success: true };
}

export async function updateBookingStatus(bookingId: string, status: "CONFIRMED" | "CANCELLED" | "IN_PROGRESS" | "COMPLETED") {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, bookingId));
  revalidatePath("/admin/dispatch");
  return { success: true };
}

export async function recordPayment(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const { payments } = await import("@/db/schema");
  await db.insert(payments).values({
    bookingId: formData.get("bookingId") as string,
    amount: formData.get("amount") as string,
    channel: formData.get("channel") as any,
    status: "CONFIRMED",
    mpesaRef: (formData.get("mpesaRef") as string) || null,
    paidAt: new Date(),
    recordedBy: session.user.name,
    notes: (formData.get("notes") as string) || null,
  });

  const isDeposit = formData.get("isDeposit") === "true";
  await db.update(bookings).set({
    ...(isDeposit ? { isDepositPaid: true } : { isFullPaymentReceived: true }),
    updatedAt: new Date(),
  }).where(eq(bookings.id, formData.get("bookingId") as string));

  revalidatePath("/admin/dispatch");
  return { success: true };
}