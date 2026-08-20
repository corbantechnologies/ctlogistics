import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tripLegs, bookings, assets, drivers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const leg = await db.query.tripLegs.findFirst({
    where: eq(tripLegs.handoverToken, token),
    with: {
      booking: true,
      assignedAsset: true,
      driver: true,
    },
  });

  if (!leg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Determine handover type: if no delivery handover yet → DELIVERY, else COLLECTION
  const { handovers } = await import("@/db/schema");
  const { and } = await import("drizzle-orm");

  const existingDelivery = await db.query.handovers.findFirst({
    where: and(
      eq(handovers.tripLegId, leg.id),
      eq(handovers.handoverType, "DELIVERY")
    ),
  });

  return NextResponse.json({
    bookingId: leg.bookingId,
    tripLegId: leg.id,
    handoverType: existingDelivery ? "COLLECTION" : "DELIVERY",
    clientName: leg.booking?.clientName ?? "Client",
    vehiclePlate: leg.assignedAsset?.plateNumber ?? "TBD",
    makeModel: leg.assignedAsset?.makeModel ?? "TBD",
  });
}