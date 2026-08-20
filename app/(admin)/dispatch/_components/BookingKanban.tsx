"use client";

import { useState } from "react";
import { AssignmentDrawer } from "./AssignmentDrawer";

const COLUMNS = [
  { status: "PENDING",     label: "Pending",      cls: "badge-pending" },
  { status: "CONFIRMED",   label: "Confirmed",    cls: "badge-confirmed" },
  { status: "DISPATCHED",  label: "Dispatched",   cls: "badge-dispatched" },
  { status: "IN_PROGRESS", label: "In Progress",  cls: "badge-in-progress" },
  { status: "COMPLETED",   label: "Completed",    cls: "badge-completed" },
];

const TYPE_ICONS: Record<string, string> = {
  CAR_RENTAL: "🚗", INTER_COUNTY_TRANSFER: "🛣️", ZONAL_TRANSFER: "📍",
  SAFARI_TOUR: "🦁", EVENT_CHARTER: "🎪",
};

interface Props { bookings: any[]; partners: any[]; }

export function BookingKanban({ bookings, partners }: Props) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colBookings = bookings.filter((b) => b.status === col.status);
          return (
            <div key={col.status} className="flex-shrink-0 w-72 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className={`badge ${col.cls} text-xs`}>{col.label}</span>
                <span className="text-xs text-white/30">{colBookings.length}</span>
              </div>
              <div className="space-y-3">
                {colBookings.map((booking) => {
                  const leg = booking.tripLegs?.[0];
                  const margin = booking.totalSellAmount && booking.totalBuyAmount
                    ? (((parseFloat(booking.totalSellAmount) - parseFloat(booking.totalBuyAmount)) / parseFloat(booking.totalSellAmount)) * 100).toFixed(0)
                    : null;
                  return (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="glass-card w-full p-4 text-left space-y-3 hover:border-amber-400/30 transition-all duration-150"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-base">{TYPE_ICONS[booking.bookingType] ?? "📋"}</span>
                        {margin && (
                          <span className={`text-xs font-bold ${parseFloat(margin) >= 25 ? "text-green-400" : parseFloat(margin) >= 15 ? "text-amber-400" : "text-red-400"}`}>
                            {margin}% margin
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{booking.clientName}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {booking.bookingType.replace(/_/g, " ")}
                        </p>
                      </div>
                      {leg && (
                        <p className="text-xs text-white/50 truncate">
                          {leg.originLocation} → {leg.destinationLocation}
                        </p>
                      )}
                      <div className="flex items-center justify-between border-t border-white/8 pt-2">
                        <span className="text-xs text-white/40">
                          {leg ? new Date(leg.scheduledTime).toLocaleDateString("en-KE", { day:"numeric", month:"short" }) : "—"}
                        </span>
                        <span className="text-sm font-bold text-amber-400">
                          KES {parseFloat(booking.totalSellAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {colBookings.length === 0 && (
                  <div className="glass-card p-4 text-center text-xs text-white/20">No bookings</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedBooking && (
        <AssignmentDrawer
          booking={selectedBooking}
          partners={partners}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </>
  );
}