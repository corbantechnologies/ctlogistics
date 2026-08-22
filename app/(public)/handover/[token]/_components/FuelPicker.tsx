"use client";

const LEVELS = ["1/4", "1/2", "3/4", "FULL"] as const;
export type FuelLevel = typeof LEVELS[number];

const FILL: Record<FuelLevel, number> = { "1/4": 25, "1/2": 50, "3/4": 75, "FULL": 100 };

interface Props { value: FuelLevel; onChange: (v: FuelLevel) => void; }

export function FuelPicker({ value, onChange }: Props) {
  return (
    <div>
      <p className="section-label mb-3">Fuel Level</p>
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex-1 rounded border py-3 text-center text-sm font-semibold transition-all duration-150
              ${value === level ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"}`}
          >
            {level}
          </button>
        ))}
      </div>
      {/* Visual gauge */}
      <div className="mt-3 h-3 w-full rounded bg-white/10 overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{
            width: `${FILL[value]}%`,
            background: FILL[value] <= 25 ? "#ef4444" : FILL[value] <= 50 ? "#f59e0b" : "#22c55e",
          }}
        />
      </div>
    </div>
  );
}