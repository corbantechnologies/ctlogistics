"use client";

import { useState } from "react";
import type { VehicleCategory } from "./types";
import { VEHICLE_CATEGORY_LABELS } from "./types";
import { VehiclePicker } from "./VehiclePicker";

interface Props {
  onNext: (data: RentalData) => void;
}

export type RentalData = {
  vehicleCategory: VehicleCategory;
  rentalStart: string;
  rentalEnd: string;
  deliverToLocation: boolean;
  deliveryAddress?: string;
  collectionAddress?: string;
  deliveryDistanceKm?: number;
  days: number;
};

export function RentalStep({ onNext }: Props) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const [category, setCategory] = useState<VehicleCategory>("SALOON");
  const [startDate, setStartDate] = useState(tomorrow.toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(dayAfter.toISOString().slice(0, 16));
  const [deliver, setDeliver] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    )
  );

  function handleNext() {
    onNext({
      vehicleCategory: category,
      rentalStart: new Date(startDate).toISOString(),
      rentalEnd: new Date(endDate).toISOString(),
      deliverToLocation: deliver,
      deliveryAddress: deliver ? deliveryAddress : undefined,
      collectionAddress: deliver ? collectionAddress : undefined,
      deliveryDistanceKm: deliver ? 15 : 0, // TODO: integrate Maps API for actual distance
      days,
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Self-Drive Rental</h2>

      <VehiclePicker value={category} onChange={setCategory} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
            Pick-up Date & Time
          </span>
          <input
            type="datetime-local"
            value={startDate}
            min={today.toISOString().slice(0, 16)}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
            Return Date & Time
          </span>
          <input
            type="datetime-local"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </label>
      </div>

      <p className="text-sm text-amber-400/80 font-medium">
        {days} day{days !== 1 ? "s" : ""} rental
      </p>

      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setDeliver(!deliver)}
          className={`relative h-6 w-11 rounded transition-colors duration-200 ${deliver ? "bg-amber-400" : "bg-white/20"
            }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded bg-white shadow transition-transform duration-200 ${deliver ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </div>
        <span className="text-sm text-white group-hover:text-amber-300 transition-colors">
          Deliver vehicle to my location
        </span>
      </label>

      {deliver && (
        <div className="space-y-3 rounded border border-amber-400/20 bg-amber-400/5 p-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
              Delivery Address
            </span>
            <input
              type="text"
              placeholder="Hotel name, area, or landmark"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="input-field"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
              Collection Address (if different)
            </span>
            <input
              type="text"
              placeholder="Leave blank if same as delivery"
              value={collectionAddress}
              onChange={(e) => setCollectionAddress(e.target.value)}
              className="input-field"
            />
          </label>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={deliver && !deliveryAddress}
        className="btn-primary w-full"
      >
        Get Quote →
      </button>
    </div>
  );
}
