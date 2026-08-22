"use client";

import { useState, useTransition } from "react";
import { createRouteWithRateCards } from "@/app/actions/routes";
import { VEHICLE_CATEGORY_LABELS } from "@/app/(public)/_components/types";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as Array<keyof typeof VEHICLE_CATEGORY_LABELS>;

export function AddCorridorForm({ onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Checkboxes are omitted if unchecked, so we manually set them based on presence
    formData.set("tollsIncluded", formData.get("tollsIncluded") === "on" ? "true" : "false");
    formData.set("deadheadIncluded", formData.get("deadheadIncluded") === "on" ? "true" : "false");

    startTransition(async () => {
      const result = await createRouteWithRateCards(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    });
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">Create New Corridor</h2>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white transition-colors text-sm">
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">1. Route Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-white/60 mb-1.5">Corridor Name</label>
              <input type="text" name="name" required placeholder="e.g. Nairobi → Nakuru" className="input-field w-full" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Origin Zone</label>
              <input type="text" name="originZone" required placeholder="e.g. Nairobi CBD" className="input-field w-full" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Destination Zone</label>
              <input type="text" name="destinationZone" required placeholder="e.g. Nakuru Town" className="input-field w-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Distance (km)</label>
                <input type="number" name="standardDistanceKm" required min="1" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Duration (mins)</label>
                <input type="number" name="estimatedDurationMins" required min="1" className="input-field w-full" />
              </div>
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" name="tollsIncluded" className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/50" />
              Tolls Included
            </label>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input type="checkbox" name="deadheadIncluded" defaultChecked className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/50" />
              Deadhead Return Included
            </label>
          </div>
        </div>

        {/* Rate Cards */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">2. Initial Rate Cards (KES)</h3>
          <p className="text-xs text-white/40">Leave empty or 0 if a vehicle category is not supported on this route.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <div key={cat} className="bg-white/5 border border-white/10 p-4 rounded flex flex-col gap-3">
                <span className="text-sm font-medium text-white">{VEHICLE_CATEGORY_LABELS[cat]}</span>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Partner Buy Rate</label>
                    <input type="number" name={`buy_${cat}`} min="0" placeholder="0" className="input-field w-full text-sm py-1.5 px-3" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">Client Sell Rate</label>
                    <input type="number" name={`sell_${cat}`} min="0" placeholder="0" className="input-field w-full text-sm py-1.5 px-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button type="submit" disabled={isPending} className="btn-primary py-2 px-6">
            {isPending ? "Creating..." : "Create Corridor"}
          </button>
        </div>
      </form>
    </div>
  );
}
