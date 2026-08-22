"use client";

import { useState, useTransition } from "react";
import { assignPartnerToBooking, updateBookingStatus, recordPayment } from "@/app/actions/dispatch";

interface Props { booking: any; partners: any[]; onClose: () => void; }

const TYPE_LABELS: Record<string, string> = {
  CAR_RENTAL: "Self-Drive Rental", INTER_COUNTY_TRANSFER: "Inter-County Transfer",
  ZONAL_TRANSFER: "Zonal Transfer", SAFARI_TOUR: "Safari Tour", EVENT_CHARTER: "Event Charter",
};

export function AssignmentDrawer({ booking, partners, onClose }: Props) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [payout, setPayout] = useState(booking.totalBuyAmount ?? "0");
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"assignment" | "payment">("assignment");

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId);
  const leg = booking.tripLegs?.[0];

  const sell = parseFloat(booking.totalSellAmount || 0);
  const buy = parseFloat(payout || booking.totalBuyAmount || 0);
  const margin = sell > 0 ? (((sell - buy) / sell) * 100).toFixed(1) : "0";
  const marginNum = parseFloat(margin);

  function handleAssign() {
    if (!leg || !selectedAssetId || !selectedDriverId) return;
    const fd = new FormData();
    fd.set("tripLegId", leg.id);
    fd.set("bookingId", booking.id);
    fd.set("assetId", selectedAssetId);
    fd.set("driverId", selectedDriverId);
    fd.set("partnerPayout", payout);
    startTransition(async () => {
      await assignPartnerToBooking(fd);
      onClose();
    });
  }

  function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("bookingId", booking.id);
    startTransition(async () => {
      await recordPayment(fd);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md flex flex-col bg-[#0d1120] border-l border-white/10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/8">
          <div>
            <p className="text-xs text-white/40">{TYPE_LABELS[booking.bookingType] ?? booking.bookingType}</p>
            <h2 className="text-xl font-bold text-white mt-1">{booking.clientName}</h2>
            <p className="text-sm text-white/50">{booking.clientPhone}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* Booking summary */}
        <div className="p-5 grid grid-cols-2 gap-4 border-b border-white/8">
          <div>
            <p className="section-label">Sell Price</p>
            <p className="text-lg font-bold text-white mt-1">KES {sell.toLocaleString()}</p>
          </div>
          <div>
            <p className="section-label">Margin</p>
            <p className={`text-lg font-bold mt-1 ${marginNum >= 25 ? "text-green-400" : marginNum >= 15 ? "text-amber-400" : "text-red-400"}`}>
              {margin}%
            </p>
          </div>
          {leg && (
            <>
              <div>
                <p className="section-label">Route</p>
                <p className="text-sm text-white mt-1 truncate">{leg.originLocation} → {leg.destinationLocation}</p>
              </div>
              <div>
                <p className="section-label">Departure</p>
                <p className="text-sm text-white mt-1">
                  {new Date(leg.scheduledTime).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8">
          {(["assignment", "payment"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${activeTab === tab ? "text-amber-400 border-b-2 border-amber-400" : "text-white/40 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "assignment" && (
          <div className="p-5 space-y-5 flex-1">
            {/* Partner picker */}
            <div>
              <p className="section-label mb-2">Select Partner</p>
              <div className="space-y-2">
                {partners.map((p) => (
                  <button key={p.id} onClick={() => { setSelectedPartnerId(p.id); setSelectedAssetId(""); setSelectedDriverId(""); }}
                    className={`w-full rounded border p-3 text-left transition-all ${selectedPartnerId === p.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                    <p className="text-sm font-semibold text-white">{p.companyName}</p>
                    <p className="text-xs text-white/40">{p.assets?.length ?? 0} vehicles · {p.drivers?.length ?? 0} drivers</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedPartner && (
              <>
                {/* Asset picker */}
                <div>
                  <p className="section-label mb-2">Select Vehicle</p>
                  <div className="space-y-2">
                    {selectedPartner.assets?.map((a: any) => (
                      <button key={a.id} onClick={() => setSelectedAssetId(a.id)}
                        className={`w-full rounded border p-3 text-left transition-all ${selectedAssetId === a.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5"}`}>
                        <p className="text-sm text-white font-mono">{a.plateNumber}</p>
                        <p className="text-xs text-white/40">{a.makeModel} · {a.color} · {a.category}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Driver picker */}
                <div>
                  <p className="section-label mb-2">Select Driver</p>
                  <div className="space-y-2">
                    {selectedPartner.drivers?.map((d: any) => (
                      <button key={d.id} onClick={() => setSelectedDriverId(d.id)}
                        className={`w-full rounded border p-3 text-left transition-all ${selectedDriverId === d.id ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5"}`}>
                        <p className="text-sm text-white font-semibold">{d.name}</p>
                        <p className="text-xs text-white/40">{d.phone}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout */}
                <label className="block">
                  <span className="section-label mb-2 block">Partner Payout (KES COGS)</span>
                  <input type="number" value={payout} onChange={(e) => setPayout(e.target.value)} className="input-field" />
                </label>
              </>
            )}

            <button
              onClick={handleAssign}
              disabled={!selectedAssetId || !selectedDriverId || isPending}
              className="btn-primary w-full mt-auto"
            >
              {isPending ? "Assigning…" : "Confirm Assignment & Dispatch →"}
            </button>
          </div>
        )}

        {activeTab === "payment" && (
          <form onSubmit={handlePayment} className="p-5 space-y-5 flex-1">
            <p className="text-sm text-white/50">
              Balance: KES {sell.toLocaleString()} · Deposit: KES {parseFloat(booking.securityDeposit || 0).toLocaleString()}
            </p>
            <div className="flex gap-2">
              <span className={`badge ${booking.isDepositPaid ? "badge-completed" : "badge-pending"}`}>{booking.isDepositPaid ? "✓ Deposit Paid" : "Deposit Pending"}</span>
              <span className={`badge ${booking.isFullPaymentReceived ? "badge-completed" : "badge-pending"}`}>{booking.isFullPaymentReceived ? "✓ Fully Paid" : "Balance Pending"}</span>
            </div>
            <label className="block">
              <span className="section-label mb-2 block">Amount (KES)</span>
              <input name="amount" type="number" required className="input-field" />
            </label>
            <label className="block">
              <span className="section-label mb-2 block">Channel</span>
              <select name="channel" className="input-field">
                <option value="MPESA">M-Pesa</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
              </select>
            </label>
            <label className="block">
              <span className="section-label mb-2 block">M-Pesa / Ref Code</span>
              <input name="mpesaRef" type="text" placeholder="e.g. RBE1X3A4KP" className="input-field" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isDeposit" value="true" className="h-4 w-4 rounded" />
              <span className="text-sm text-white/60">Mark as deposit payment</span>
            </label>
            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? "Recording…" : "Record Payment ✓"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}