import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { EventGroupBuilder } from "./_components/EventGroupBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Group Events | CT Drive Admin" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const eventBookings = await db.query.bookings.findMany({
    where: or(eq(bookings.bookingType, "EVENT_CHARTER"), eq(bookings.bookingType, "SAFARI_TOUR")),
    with: { tripLegs: { with: { assignedAsset: true, driver: true } } },
    orderBy: bookings.createdAt,
  });

  // Group by eventGroupId
  const groups: Record<string, any[]> = {};
  const ungrouped: any[] = [];
  for (const b of eventBookings) {
    if (b.eventGroupId) {
      groups[b.eventGroupId] = [...(groups[b.eventGroupId] ?? []), b];
    } else {
      ungrouped.push(b);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Group Events & Charters</h1>
        <p className="text-white/40 text-sm mt-1">{eventBookings.length} event bookings · {Object.keys(groups).length} groups</p>
      </div>
      <EventGroupBuilder groups={groups} ungrouped={ungrouped} />
    </div>
  );
}