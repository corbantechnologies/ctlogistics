"use client";

import { useState } from "react";
import type { VehicleCategory, Route } from "./types";
import { VehiclePicker } from "./VehiclePicker";

interface Props {
  routes: Route[];
  onNext: (data: SafariData) => void;
}

export type SafariData = {
  vehicleCategory: VehicleCategory;
  routeId?: string;
  originLocation: string;
  destinationLocation: string;
  scheduledTime: string;
  paxCount: number;
  specialRequirements: string;
  bookingType: "SAFARI_TOUR" | "EVENT_CHARTER";
};

const SAFARI_DESTINATIONS = [
  { id: "tsavo", label: "Tsavo East / West", origin: "Mombasa CBD", destination: "Voi / Tsavo East Gate" },
  { id: "amboseli", label: "Amboseli National Park", origin: "Nairobi CBD / JKIA", destination: "Amboseli National Park" },
  { id: "mara", label: "Maasai Mara", origin: "Nairobi CBD / JKIA", destination: "Maasai Mara (Sekenani Gate)" },
  { id: "naivasha", label: "Lake Naivasha / Hell's Gate", origin: "JKIA", destination: "Naivasha" },
  { id: "custom", label: "Custom Destination", origin: "", destination: "" },
];

export function SafariStep({ routes, onNext }: Props) {
  const [category, setCategory] = useState<VehicleCategory>("COMPACT_SUV");
  const [selectedDest, setSelectedDest] = useState<string>("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [paxCount, setPaxCount] = useState(2);
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [isEventCharter, setIsEventCharter] = useState(false);
  const [routeId, setRouteId] = useState<string | undefined>();

  function handleDestSelect(id: string) {
    setSelectedDest(id);
    const dest = SAFARI_DESTINATIONS.find((d) => d.id === id);
    if (dest && id !== "custom") {
      setOrigin(dest.origin);
      setDestination(dest.destination);
      // Try to match a route
      const match = routes.find((r) =>
        r.destinationZone.toLowerCase().includes(dest.destination.split(" ")[0].toLowerCase())
      );
      setRouteId(match?.id);
    } else {
      setOrigin("");
      setDestination("");
      setRouteId(undefined);
    }
  }

  const minDateTime = new Date();
  minDateTime.setDate(minDateTime.getDate() + 1);

  function handleNext() {
    onNext({
      vehicleCategory: category,
      routeId,
      originLocation: origin,
      destinationLocation: destination,
      scheduledTime: new Date(scheduledTime).toISOString(),
      paxCount,
      specialRequirements,
      bookingType: isEventCharter ? "EVENT_CHARTER" : "SAFARI_TOUR",
    });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Safari & Tours</h2>

      <div>
        <span className="mb-2 block text-xs font-medium text-white/60 uppercase tracking-wide">Destination</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {SAFARI_DESTINATIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleDestSelect(d.id)}
              className={`rounded border p-3 text-left transition-all duration-150 ${selectedDest === d.id
                ? "border-amber-400 bg-amber-400/10"
                : d.id === "custom"
                  ? "border-dashed border-white/20 bg-white/3 hover:border-white/30"
                  : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
            >
              <p className="text-sm font-semibold text-white">{d.label}</p>
              {d.id !== "custom" && (
                <p className="text-xs text-white/40 mt-0.5">{d.origin}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedDest === "custom" && (
        <div className="space-y-3 rounded border border-white/10 bg-white/5 p-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Departure Point</span>
            <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. JKIA, Mombasa CBD" className="input-field" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Safari Destination</span>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Nakuru National Park" className="input-field" />
          </label>
        </div>
      )}

      <VehiclePicker value={category} onChange={setCategory} filter={["COMPACT_SUV", "PRADO_LUXURY", "SAFARI_CRUISER_4X4", "TOUR_VAN", "MINIBUS_14_SEATER", "COASTER_33_SEATER"]} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Departure Date & Time</span>
          <input type="datetime-local" value={scheduledTime} min={minDateTime.toISOString().slice(0, 16)} onChange={(e) => setScheduledTime(e.target.value)} className="input-field" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Number of Passengers</span>
          <input type="number" value={paxCount} min={1} max={300} onChange={(e) => setPaxCount(Number(e.target.value))} className="input-field" />
        </label>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setIsEventCharter(!isEventCharter)}
          className={`relative h-6 w-11 rounded transition-colors duration-200 ${isEventCharter ? "bg-amber-400" : "bg-white/20"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded bg-white shadow transition-transform duration-200 ${isEventCharter ? "translate-x-5" : "translate-x-0"}`} />
        </div>
        <span className="text-sm text-white">This is a group event / wedding charter (200+ pax)</span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">Special Requirements (optional)</span>
        <textarea
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          placeholder="e.g. Pop-up roof vehicles required, park gate preference, lodge name..."
          rows={3}
          className="input-field resize-none"
        />
      </label>

      <button
        onClick={handleNext}
        disabled={!selectedDest || !scheduledTime || !origin || !destination}
        className="btn-primary w-full"
      >
        Get Quote →
      </button>
    </div>
  );
}
