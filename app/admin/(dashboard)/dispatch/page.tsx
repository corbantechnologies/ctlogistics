import { db } from "@/db";
import { bookings, tripLegs, assets, drivers, partners } from "@/db/schema";
import { desc } from "drizzle-orm";
import { BookingKanban } from "./_components/BookingKanban";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Watchtower | CT Drive Admin" };
export const dynamic = "force-dynamic";

export default async function DispatchPage() {
  const allBookings = await db.query.bookings.findMany({
    orderBy: desc(bookings.createdAt),
    with: {
      tripLegs: {
        with: { assignedAsset: true, driver: true },
        orderBy: tripLegs.legSequence,
      },
      payments: true,
    },
  });

  const approvedPartners = await db.query.partners.findMany({
    where: (p, { eq }) => eq(p.complianceStatus, "APPROVED"),
    with: { assets: true, drivers: true },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispatch Watchtower</h1>
          <p className="text-white/40 text-sm mt-1">{allBookings.length} total bookings</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span className="h-2 w-2 rounded bg-green-400 animate-pulse" />
          Live
        </div>
      </div>
      <BookingKanban bookings={allBookings as any} partners={approvedPartners as any} />
    </div>
  );
}