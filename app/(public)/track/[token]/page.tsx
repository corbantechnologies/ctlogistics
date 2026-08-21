import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import { bookings, tripLegs, assets, drivers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StatusPoller } from "./_components/StatusPoller";
import { DriverCard } from "./_components/DriverCard";
import { LegTimeline } from "./_components/LegTimeline";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.accessToken, token),
  });
  if (!booking) return { title: "Booking Not Found" };
  return {
    title: `Booking — ${booking.clientName} | CT Drive`,
    description: `Track your ${booking.bookingType.replace(/_/g, " ").toLowerCase()} booking.`,
  };
}

const BOOKING_TYPE_LABELS: Record<string, string> = {
  CAR_RENTAL: "Self-Drive Rental",
  INTER_COUNTY_TRANSFER: "Private Transfer",
  ZONAL_TRANSFER: "Zonal Transfer",
  SAFARI_TOUR: "Safari & Tour",
  EVENT_CHARTER: "Event Charter",
};

export default async function TrackPage({ params }: Props) {
  const { token } = await params;

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.accessToken, token),
  });

  if (!booking) notFound();

  // Fetch all trip legs with asset and driver info
  const legs = await db.query.tripLegs.findMany({
    where: eq(tripLegs.bookingId, booking.id),
    orderBy: tripLegs.legSequence,
    with: {
      assignedAsset: true,
      driver: true,
    },
  });

  const activeLeg = legs.find(
    (l) => l.status === "EN_ROUTE" || l.status === "ARRIVED" || l.status === "BOARDED_LOADED"
  ) ?? legs[0];

  const assignedAsset = activeLeg?.assignedAsset;
  const assignedDriver = activeLeg?.driver;

  return (
    <div className="min-h-dvh">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-80 w-80 bg-blue-900/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-400 flex items-center justify-center">
              <span className="text-black font-black text-xs">CT</span>
            </div>
            <span className="text-sm font-semibold text-white/70">CT Drive</span>
          </div>
          <span className="text-xs text-white/30">#{booking.id.slice(0, 8).toUpperCase()}</span>
        </div>

        {/* Booking summary */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-label">Booking Type</p>
              <p className="text-xl font-bold text-white mt-1">
                {BOOKING_TYPE_LABELS[booking.bookingType] ?? booking.bookingType}
              </p>
            </div>
            <span className="badge badge-confirmed text-xs">Confirmed</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/8 pt-4">
            <div>
              <p className="section-label">Client</p>
              <p className="text-white font-medium mt-1">{booking.clientName}</p>
              <p className="text-white/40 text-xs">{booking.clientPhone}</p>
            </div>
            <div>
              <p className="section-label">Total</p>
              <p className="text-white font-bold text-lg mt-1">
                KES {parseFloat(booking.totalSellAmount).toLocaleString()}
              </p>
              <p className={`text-xs mt-0.5 ${booking.isFullPaymentReceived ? "text-green-400" : "text-amber-400"}`}>
                {booking.isFullPaymentReceived ? "✓ Paid in full" : booking.isDepositPaid ? "Deposit paid" : "Payment pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Live status — client island */}
        <div className="glass-card p-5 space-y-3">
          <p className="section-label">Live Status</p>
          <StatusPoller token={token} initialStatus={booking.status} />
        </div>

        {/* Driver & vehicle card */}
        <DriverCard
          driverName={assignedDriver?.name ?? null}
          driverPhone={assignedDriver?.phone ?? null}
          plateNumber={assignedAsset?.plateNumber ?? null}
          makeModel={assignedAsset?.makeModel ?? null}
          color={assignedAsset?.color ?? null}
        />

        {/* Itinerary */}
        {legs.length > 0 && (
          <LegTimeline
            legs={legs.map((l) => ({
              id: l.id,
              legSequence: l.legSequence,
              originLocation: l.originLocation,
              destinationLocation: l.destinationLocation,
              scheduledTime: l.scheduledTime.toISOString(),
              status: l.status,
            }))}
          />
        )}

        {/* Footer */}
        <p className="text-center text-xs text-white/20 pb-4">
          Questions? Call CT Drive support · Bookmark this page to track your trip
        </p>
      </div>
    </div>
  );
}