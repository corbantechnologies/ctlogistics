"use server";

import { z } from "zod";
import { db } from "@/db";
import { handovers, tripLegs, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const handoverSchema = z.object({
  tripLegId: z.string().uuid(),
  bookingId: z.string().uuid(),
  handoverType: z.enum(["DELIVERY", "COLLECTION"]),
  runnerName: z.string().min(2),
  runnerPhone: z.string().min(9),
  odometerReading: z.coerce.number().min(0),
  fuelLevel: z.enum(["1/4", "1/2", "3/4", "FULL"]),
  photoUrlFront: z.string().url(),
  photoUrlRear: z.string().url(),
  photoUrlLeftSide: z.string().url(),
  photoUrlRightSide: z.string().url(),
  photoUrlInterior: z.string().url(),
  clientSignatureUrl: z.string().url(),
  damageNotes: z.string().optional(),
});

export async function submitHandover(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = handoverSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await db.insert(handovers).values({
    bookingId: data.bookingId,
    tripLegId: data.tripLegId,
    handoverType: data.handoverType,
    runnerName: data.runnerName,
    runnerPhone: data.runnerPhone,
    odometerReading: data.odometerReading,
    fuelLevel: data.fuelLevel,
    photoUrls: {
      front: data.photoUrlFront,
      rear: data.photoUrlRear,
      leftSide: data.photoUrlLeftSide,
      rightSide: data.photoUrlRightSide,
      interior: data.photoUrlInterior,
    },
    clientSignatureUrl: data.clientSignatureUrl,
    damageNotes: data.damageNotes || null,
  });

  // Advance leg status
  await db
    .update(tripLegs)
    .set({
      status: data.handoverType === "DELIVERY" ? "BOARDED_LOADED" : "COMPLETED",
      actualStartTime: data.handoverType === "DELIVERY" ? new Date() : undefined,
      actualEndTime: data.handoverType === "COLLECTION" ? new Date() : undefined,
    })
    .where(eq(tripLegs.id, data.tripLegId));

  // If collection handover, mark booking as IN_PROGRESS → COMPLETED
  if (data.handoverType === "COLLECTION") {
    await db
      .update(bookings)
      .set({ status: "COMPLETED", updatedAt: new Date() })
      .where(eq(bookings.id, data.bookingId));
  } else {
    await db
      .update(bookings)
      .set({ status: "IN_PROGRESS", updatedAt: new Date() })
      .where(eq(bookings.id, data.bookingId));
  }

  revalidatePath(`/track/${data.bookingId}`);
  return { success: true };
}