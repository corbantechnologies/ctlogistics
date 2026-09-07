"use client";

import { useState } from "react";
import { claimJobMarketplace } from "@/app/actions/partner";
import toast from "react-hot-toast";

interface ClaimJobCardProps {
  leg: any;
  availableVehicles: any[];
}

export function ClaimJobCard({ leg, availableVehicles }: ClaimJobCardProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(availableVehicles[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!selectedAssetId) {
      toast.error("Please select an available vehicle to allocate.");
      return;
    }

    setLoading(true);
    try {
      const res = await claimJobMarketplace(leg.id, selectedAssetId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Job claimed successfully! Client notified with payment request.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to claim job.");
    } finally {
      setLoading(false);
    }
  };

  const partnerPayout = parseFloat(leg.partnerPayout || "0");

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 hover:border-amber-500/30 transition-all bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-white/10">
            {leg.booking?.bookingType || "Transport"}
          </span>
          <h3 className="text-lg font-bold text-white mt-2">
            {leg.originLocation || "Pickup Point"} ➔ {leg.destinationLocation || "Destination"}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ref: BK-{leg.booking?.id?.substring(0, 8).toUpperCase() || "N/A"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Partner Payout</p>
          <p className="text-xl font-extrabold text-amber-400">
            KES {partnerPayout.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-white/5">
        <div>
          <span className="text-slate-500 block">Scheduled Date</span>
          <span className="font-semibold text-slate-200">
            {leg.scheduledTime
              ? new Date(leg.scheduledTime).toLocaleString("en-KE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Flexible"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Passengers (Pax)</span>
          <span className="font-semibold text-slate-200">
            {leg.booking?.paxCount || 1} Person(s)
          </span>
        </div>
      </div>

      {leg.booking?.specialRequirements && (
        <div className="text-xs text-slate-300 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
          <strong className="text-amber-400">Client Requirements: </strong>
          {leg.booking.specialRequirements}
        </div>
      )}

      <div className="space-y-2 pt-2">
        <label className="text-xs font-medium text-slate-300">
          Allocate Available Vehicle from Fleet:
        </label>
        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          disabled={availableVehicles.length === 0 || loading}
          className="w-full text-xs bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
        >
          {availableVehicles.length === 0 ? (
            <option value="">No available vehicles</option>
          ) : (
            availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.makeModel} ({v.plateNumber}) — {v.seatingCapacity} Seater
              </option>
            ))
          )}
        </select>
      </div>

      <button
        onClick={handleClaim}
        disabled={availableVehicles.length === 0 || loading}
        className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-400/10"
      >
        {loading ? "Allocating Vehicle..." : "Claim Job & Lock Availability"}
      </button>
    </div>
  );
}
