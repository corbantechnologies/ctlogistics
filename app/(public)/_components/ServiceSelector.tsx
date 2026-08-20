"use client";

import type { BookingType } from "./types";

const SERVICES: {
  type: BookingType;
  icon: string;
  label: string;
  desc: string;
}[] = [
  {
    type: "CAR_RENTAL",
    icon: "🚗",
    label: "Self-Drive Rental",
    desc: "Delivered to your door. Pick your dates & vehicle.",
  },
  {
    type: "INTER_COUNTY_TRANSFER",
    icon: "🛣️",
    label: "Private Transfer",
    desc: "Mombasa ↔ Nairobi, coastal zones & beyond.",
  },
  {
    type: "SAFARI_TOUR",
    icon: "🦁",
    label: "Safari & Tours",
    desc: "Tsavo, Amboseli, Maasai Mara & multi-day charters.",
  },
];

interface Props {
  selected: BookingType | null;
  onSelect: (type: BookingType) => void;
}

export function ServiceSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">What do you need?</h2>
      <p className="text-white/60 text-sm">
        Select a service to get an instant quote
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {SERVICES.map((s) => (
          <button
            key={s.type}
            onClick={() => onSelect(s.type)}
            className={`
              relative flex flex-col gap-3 rounded-2xl border p-6 text-left transition-all duration-200
              ${
                selected === s.type
                  ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
              }
            `}
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="font-semibold text-white">{s.label}</p>
              <p className="mt-1 text-xs text-white/50">{s.desc}</p>
            </div>
            {selected === s.type && (
              <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs text-black font-bold">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
