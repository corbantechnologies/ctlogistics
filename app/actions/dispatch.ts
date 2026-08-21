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

  const [booking] = await db
    .update(bookings)
    .set({ status: "DISPATCHED", updatedAt: new Date() })
    .where(eq(bookings.id, data.bookingId))
    .returning();

  // Fetch driver and asset to send the email
  const driver = await db.query.drivers.findFirst({ where: (d, { eq }) => eq(d.id, data.driverId) });
  const asset = await db.query.assets.findFirst({ where: (a, { eq }) => eq(a.id, data.assetId) });

  if (booking.clientEmail && driver && asset) {
    const bookingRef = booking.id.split('-')[0].toUpperCase();
    
    // We need the email import and React - but they aren't imported here.
    // I should add the imports at the top of the file!
    const { sendEmail } = await import("@/lib/email");
    const { DriverAssignedEmail } = await import("@/emails/DriverAssigned");
    const React = await import("react");

    await sendEmail({
      to: booking.clientEmail,
      subject: `Driver Assigned: ${bookingRef}`,
      react: React.createElement(DriverAssignedEmail, {
        clientName: booking.clientName,
        bookingRef,
        driverName: driver.fullName,
        driverPhone: driver.phone,
        vehicleModel: `${asset.make} ${asset.model}`,
        vehiclePlate: asset.plateNumber,
        trackingLink: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.ctdrive.co.ke"}/track/${booking.accessToken}`,
      }),
    });
  }

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
  const [booking] = await db.update(bookings).set({
    ...(isDeposit ? { isDepositPaid: true } : { isFullPaymentReceived: true }),
    updatedAt: new Date(),
  }).where(eq(bookings.id, formData.get("bookingId") as string))
  .returning();

  if (booking.clientEmail) {
    const bookingRef = booking.id.split('-')[0].toUpperCase();
    const { sendEmail } = await import("@/lib/email");
    const { BookingReceiptEmail } = await import("@/emails/BookingReceipt");
    const React = await import("react");

    await sendEmail({
      to: booking.clientEmail,
      subject: `Payment Receipt: ${bookingRef}`,
      react: React.createElement(BookingReceiptEmail, {
        clientName: booking.clientName,
        bookingRef,
        amountPaid: parseFloat(formData.get("amount") as string),
        paymentMethod: formData.get("channel") as string,
        receiptUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.ctdrive.co.ke"}/track/${booking.accessToken}/receipt`,
      }),
    });
  }

  revalidatePath("/admin/dispatch");
  return { success: true };
}