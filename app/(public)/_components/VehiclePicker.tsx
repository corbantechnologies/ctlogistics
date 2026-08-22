"use client";

import type { VehicleCategory } from "./types";
import { VEHICLE_CATEGORY_LABELS } from "./types";

interface Props {
  value: VehicleCategory;
  onChange: (v: VehicleCategory) => void;
  /** Limit choices for a specific service type */
  filter?: VehicleCategory[];
}

const ALL_CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];

const CATEGORY_ICONS: Record<VehicleCategory, string> = {
  SALOON: "🚗",
  COMPACT_SUV: "🚙",
  PRADO_LUXURY: "🏎️",
  SAFARI_CRUISER_4X4: "🚐",
  TOUR_VAN: "🚌",
  MINIBUS_14_SEATER: "🚎",
  COASTER_33_SEATER: "🚌",
  COACH_50_SEATER: "🚍",
};

export function VehiclePicker({ value, onChange, filter }: Props) {
  const categories = filter ?? ALL_CATEGORIES;

  return (
    <div>
      <span className="mb-2 block text-xs font-medium text-white/60 uppercase tracking-wide">
        Vehicle Category
      </span>
      <div className="grid gap-2 sm:grid-cols-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`
              flex items-center gap-3 rounded border p-3 text-left transition-all duration-150
              ${value === cat
                ? "border-amber-400 bg-amber-400/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }
            `}
          >
            <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
            <span className="text-sm text-white/90 leading-tight">
              {VEHICLE_CATEGORY_LABELS[cat]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
