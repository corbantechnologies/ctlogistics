"use client";

import { useState } from "react";
import type { VehicleCategory, Route } from "./types";
import { VehiclePicker } from "./VehiclePicker";

interface Props {
  routes: Route[];
  onNext: (data: TransferData) => void;
}

export type TransferData = {
  vehicleCategory: VehicleCategory;
  routeId?: string;
  originLocation: string;
  destinationLocation: string;
  scheduledTime: string;
  distanceKm?: number;
  returnMultiplier: number;
  bookingType: "INTER_COUNTY_TRANSFER" | "ZONAL_TRANSFER";
};

export function TransferStep({ routes, onNext }: Props) {
  const [category, setCategory] = useState<VehicleCategory>("SALOON");
  const [routeId, setRouteId] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [distanceKm, setDistanceKm] = useState(100);

  const selectedRoute = routes.find((r) => r.id === routeId);

  function handleRouteSelect(id: string) {
    if (id === "custom") {
      setIsCustom(true);
      setRouteId("");
      setOrigin("");
      setDestination("");
    } else {
      setIsCustom(false);
      setRouteId(id);
      const r = routes.find((r) => r.id === id);
      if (r) {
        setOrigin(r.originZone);
        setDestination(r.destinationZone);
      }
    }
  }

  function handleNext() {
    onNext({
      vehicleCategory: category,
      routeId: routeId || undefined,
      originLocation: origin,
      destinationLocation: destination,
      scheduledTime: new Date(scheduledTime).toISOString(),
      distanceKm: isCustom ? distanceKm : selectedRoute?.standardDistanceKm,
      returnMultiplier: 1.5,
      bookingType: selectedRoute
        ? selectedRoute.standardDistanceKm > 100
          ? "INTER_COUNTY_TRANSFER"
          : "ZONAL_TRANSFER"
        : "INTER_COUNTY_TRANSFER",
    });
  }

  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 2);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Private Transfer</h2>

      <div>
        <span className="mb-2 block text-xs font-medium text-white/60 uppercase tracking-wide">
          Route
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {routes.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRouteSelect(r.id)}
              className={`rounded-xl border p-3 text-left transition-all duration-150 ${
                routeId === r.id
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-white">{r.name}</p>
              <p className="text-xs text-white/40 mt-0.5">
                ~{Math.round(r.estimatedDurationMins / 60)}h · {r.standardDistanceKm} km
              </p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleRouteSelect("custom")}
            className={`rounded-xl border p-3 text-left transition-all duration-150 ${
              isCustom
                ? "border-amber-400 bg-amber-400/10"
                : "border-dashed border-white/20 bg-white/3 hover:border-white/30"
            }`}
          >
            <p className="text-sm font-semibold text-white">Custom Route</p>
            <p className="text-xs text-white/40 mt-0.5">Enter your own origin & destination</p>
          </button>
        </div>
      </div>

      {isCustom && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">From</span>
            <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Mombasa CBD" className="input-field" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">To</span>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Nairobi Airport" className="input-field" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Estimated Distance (km)</span>
            <input type="number" value={distanceKm} min={5} onChange={(e) => setDistanceKm(Number(e.target.value))} className="input-field" />
          </label>
        </div>
      )}

      <VehiclePicker value={category} onChange={setCategory} filter={["SALOON","COMPACT_SUV","PRADO_LUXURY","TOUR_VAN","MINIBUS_14_SEATER","COASTER_33_SEATER","COACH_50_SEATER"]} />

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Departure Date & Time</span>
        <input type="datetime-local" value={scheduledTime} min={minDateTime.toISOString().slice(0,16)} onChange={(e) => setScheduledTime(e.target.value)} className="input-field" />
      </label>

      <button
        onClick={handleNext}
        disabled={(!routeId && !isCustom) || !scheduledTime || (isCustom && (!origin || !destination))}
        className="btn-primary w-full"
      >
        Get Quote →
      </button>
    </div>
  );
}
