"use client";

const TYPE_ICONS: Record<string, string> = {
  SAFARI_TOUR: "🦁", EVENT_CHARTER: "🎪",
};

interface Props { groups: Record<string, any[]>; ungrouped: any[]; }

export function EventGroupBuilder({ groups, ungrouped }: Props) {
  return (
    <div className="space-y-8">
      {/* Groups */}
      {Object.entries(groups).map(([groupId, bookingList]) => {
        const totalSell = bookingList.reduce((s, b) => s + parseFloat(b.totalSellAmount || 0), 0);
        const totalPax = bookingList.reduce((s, b) => s + (b.paxCount ?? 0), 0);
        return (
          <div key={groupId} className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-dispatched text-xs">Group Event</span>
                  <span className="text-xs text-white/30 font-mono">{groupId}</span>
                </div>
                <p className="text-white font-bold mt-1">{bookingList[0]?.clientName}</p>
                <p className="text-white/40 text-xs">{totalPax} total passengers · {bookingList.length} vehicles</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Group Total</p>
                <p className="text-xl font-black text-amber-400">KES {totalSell.toLocaleString()}</p>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {bookingList.map((b) => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{TYPE_ICONS[b.bookingType] ?? "📋"}</span>
                    <div>
                      <p className="text-sm text-white">{b.tripLegs?.[0]?.originLocation ?? "—"} → {b.tripLegs?.[0]?.destinationLocation ?? "—"}</p>
                      <p className="text-xs text-white/40">
                        {b.paxCount ?? 0} pax · {b.tripLegs?.[0]?.assignedAsset?.plateNumber ?? "Unassigned"}
                        {b.tripLegs?.[0]?.driver ? ` · ${b.tripLegs[0].driver.name}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-white">KES {parseFloat(b.totalSellAmount || 0).toLocaleString()}</p>
                    <span className={`badge text-xs ${b.status === "COMPLETED" ? "badge-completed" : b.status === "DISPATCHED" ? "badge-dispatched" : "badge-pending"}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Ungrouped */}
      {ungrouped.length > 0 && (
        <div>
          <p className="section-label mb-4">Individual Safari / Event Bookings</p>
          <div className="space-y-3">
            {ungrouped.map((b) => (
              <div key={b.id} className="glass-card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{TYPE_ICONS[b.bookingType] ?? "📋"}</span>
                  <div>
                    <p className="font-semibold text-white">{b.clientName}</p>
                    <p className="text-xs text-white/40">
                      {b.paxCount ?? 1} pax · {b.specialRequirements ? b.specialRequirements.slice(0, 50) + "…" : "No special requirements"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-400">KES {parseFloat(b.totalSellAmount || 0).toLocaleString()}</p>
                  <span className={`badge text-xs ${b.status === "COMPLETED" ? "badge-completed" : "badge-pending"}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(groups).length === 0 && ungrouped.length === 0 && (
        <div className="glass-card p-10 text-center text-white/30">No event or safari bookings yet.</div>
      )}
    </div>
  );
}