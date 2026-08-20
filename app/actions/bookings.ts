"use server";

import { z } from "zod";
import { db } from "@/db";
import { bookings, tripLegs } from "@/db/schema";
import { generateAccessToken, generateHandoverToken } from "@/lib/tokens";
import {
  calculateCorridorQuote,
  calculateDynamicQuote,
  calculateRentalQuote,
  type VehicleCategory,
} from "@/lib/pricing";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ─── Shared validation schemas ────────────────────────────────────────────────

const clientDetailsSchema = z.object({
  clientName: z.string().min(2, "Full name required"),
  clientPhone: z
    .string()
    .regex(/^(?:\+254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number"),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientIdNumber: z.string().optional(),
});

const rentalSchema = z
  .object({
    bookingType: z.literal("CAR_RENTAL"),
    vehicleCategory: z.string() as z.ZodType<VehicleCategory>,
    rentalStart: z.string().datetime(),
    rentalEnd: z.string().datetime(),
    deliverToLocation: z.boolean().default(false),
    deliveryAddress: z.string().optional(),
    collectionAddress: z.string().optional(),
    deliveryDistanceKm: z.coerce.number().min(0).default(0),
  })
  .merge(clientDetailsSchema);

const transferSchema = z
  .object({
    bookingType: z.enum(["INTER_COUNTY_TRANSFER", "ZONAL_TRANSFER"]),
    vehicleCategory: z.string() as z.ZodType<VehicleCategory>,
    routeId: z.string().uuid().optional(),
    originLocation: z.string().min(2),
    destinationLocation: z.string().min(2),
    scheduledTime: z.string().datetime(),
    distanceKm: z.coerce.number().optional(),
    returnMultiplier: z.coerce.number().optional().default(1.5),
  })
  .merge(clientDetailsSchema);

const safariSchema = z
  .object({
    bookingType: z.enum(["SAFARI_TOUR", "EVENT_CHARTER"]),
    vehicleCategory: z.string() as z.ZodType<VehicleCategory>,
    routeId: z.string().uuid().optional(),
    originLocation: z.string().min(2),
    destinationLocation: z.string().min(2),
    scheduledTime: z.string().datetime(),
    paxCount: z.coerce.number().min(1),
    specialRequirements: z.string().optional(),
  })
  .merge(clientDetailsSchema);

// ─── Action: Create Rental Booking ────────────────────────────────────────────

export async function createRentalBooking(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = rentalSchema.safeParse({
    ...raw,
    deliverToLocation: raw.deliverToLocation === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const start = new Date(data.rentalStart);
  const end = new Date(data.rentalEnd);
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  const quote = calculateRentalQuote(
    days,
    data.vehicleCategory,
    data.deliverToLocation ? data.deliveryDistanceKm : 0
  );

  const accessToken = generateAccessToken();
  const handoverToken = generateHandoverToken();

  const [booking] = await db
    .insert(bookings)
    .values({
      bookingType: "CAR_RENTAL",
      status: "PENDING",
      accessToken,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail || null,
      clientIdNumber: data.clientIdNumber || null,
      totalSellAmount: quote.sellRate.toString(),
      totalBuyAmount: quote.buyRate.toString(),
      securityDeposit: (quote.sellRate * 0.3).toFixed(2),
      rentalStart: start,
      rentalEnd: end,
      deliveryAddress: data.deliveryAddress || null,
      collectionAddress: data.collectionAddress || null,
      deliveryFee: data.deliverToLocation
        ? (500 + data.deliveryDistanceKm * 80).toString()
        : "0",
    })
    .returning();

  // Create delivery leg with a handover token for the runner
  await db.insert(tripLegs).values({
    bookingId: booking.id,
    legSequence: 1,
    originLocation: "Depot / Partner Location",
    destinationLocation: data.deliveryAddress || "Client Location",
    scheduledTime: start,
    status: "SCHEDULED",
    partnerPayout: quote.buyRate.toString(),
    handoverToken,
  });

  redirect(`/track/${accessToken}`);
}

// ─── Action: Create Transfer Booking ──────────────────────────────────────────

export async function createTransferBooking(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = transferSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  let quote;

  if (data.routeId) {
    quote = await calculateCorridorQuote(data.routeId, data.vehicleCategory);
  }

  if (!quote) {
    if (!data.distanceKm) {
      return { error: { distanceKm: ["Distance required for off-route pricing"] } };
    }
    quote = calculateDynamicQuote(
      data.distanceKm,
      data.vehicleCategory,
      data.returnMultiplier as 1 | 1.5 | 2
    );
  }

  const accessToken = generateAccessToken();
  const handoverToken = generateHandoverToken();

  const [booking] = await db
    .insert(bookings)
    .values({
      bookingType: data.bookingType,
      status: "PENDING",
      accessToken,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail || null,
      clientIdNumber: data.clientIdNumber || null,
      totalSellAmount: quote.sellRate.toString(),
      totalBuyAmount: quote.buyRate.toString(),
    })
    .returning();

  await db.insert(tripLegs).values({
    bookingId: booking.id,
    legSequence: 1,
    originLocation: data.originLocation,
    destinationLocation: data.destinationLocation,
    scheduledTime: new Date(data.scheduledTime),
    status: "SCHEDULED",
    partnerPayout: quote.buyRate.toString(),
    handoverToken,
  });

  redirect(`/track/${accessToken}`);
}

// ─── Action: Create Safari / Event Booking ────────────────────────────────────

export async function createSafariBooking(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = safariSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  let quote;

  if (data.routeId) {
    quote = await calculateCorridorQuote(data.routeId, data.vehicleCategory);
  }
  if (!quote) {
    // Safari fallback — admin will finalize pricing during dispatch
    quote = { sellRate: 0, buyRate: 0, margin: 0, marginPct: 0, breakdown: ["Pending admin quote"] };
  }

  const accessToken = generateAccessToken();
  const handoverToken = generateHandoverToken();
  const eventGroupId = data.bookingType === "EVENT_CHARTER"
    ? `EVT-${Date.now()}`
    : null;

  const [booking] = await db
    .insert(bookings)
    .values({
      bookingType: data.bookingType,
      status: "PENDING",
      accessToken,
      eventGroupId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail || null,
      totalSellAmount: quote.sellRate.toString(),
      totalBuyAmount: quote.buyRate.toString(),
      paxCount: data.paxCount,
      specialRequirements: data.specialRequirements || null,
    })
    .returning();

  await db.insert(tripLegs).values({
    bookingId: booking.id,
    legSequence: 1,
    originLocation: data.originLocation,
    destinationLocation: data.destinationLocation,
    scheduledTime: new Date(data.scheduledTime),
    status: "SCHEDULED",
    partnerPayout: quote.buyRate.toString(),
    handoverToken,
  });

  redirect(`/track/${accessToken}`);
}

// ─── Action: Get Quote (used by the wizard's quote preview step) ───────────────

export async function getQuotePreview(formData: FormData) {
  const type = formData.get("type") as string;
  const category = formData.get("vehicleCategory") as VehicleCategory;

  if (type === "CAR_RENTAL") {
    const days = parseInt(formData.get("days") as string, 10) || 1;
    const deliveryKm = parseInt(formData.get("deliveryDistanceKm") as string, 10) || 0;
    return calculateRentalQuote(days, category, deliveryKm);
  }

  const routeId = formData.get("routeId") as string | null;
  if (routeId) {
    const quote = await calculateCorridorQuote(routeId, category);
    if (quote) return quote;
  }

  const distanceKm = parseInt(formData.get("distanceKm") as string, 10) || 100;
  const multiplier = parseFloat(formData.get("returnMultiplier") as string) || 1.5;
  return calculateDynamicQuote(distanceKm, category, multiplier as 1 | 1.5 | 2);
}
