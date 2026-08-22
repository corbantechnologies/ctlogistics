interface DriverCardProps {
  driverName: string | null;
  driverPhone: string | null;
  plateNumber: string | null;
  makeModel: string | null;
  color: string | null;
}

export function DriverCard({ driverName, driverPhone, plateNumber, makeModel, color }: DriverCardProps) {
  if (!driverName && !plateNumber) {
    return (
      <div className="glass-card p-5 text-center text-sm text-white/40">
        Driver assignment pending — the dispatcher will update this shortly.
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-4">
      <p className="section-label">Your Driver & Vehicle</p>
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded bg-amber-400/20 flex items-center justify-center text-2xl flex-shrink-0">
          🧑‍✈️
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-lg">{driverName ?? "—"}</p>
          {driverPhone && (
            <a
              href={`tel:${driverPhone}`}
              className="text-amber-400 text-sm hover:underline mt-0.5 block"
            >
              📞 {driverPhone}
            </a>
          )}
        </div>
      </div>

      {plateNumber && (
        <div className="rounded bg-white/5 border border-white/10 p-4 flex items-center justify-between">
          <div>
            <p className="section-label">Vehicle</p>
            <p className="text-white font-semibold mt-1">{makeModel ?? "—"}</p>
            {color && <p className="text-white/40 text-xs">{color}</p>}
          </div>
          <div className="text-right">
            <p className="section-label">Plate</p>
            <p className="font-mono font-bold text-amber-400 text-lg mt-1">{plateNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
}