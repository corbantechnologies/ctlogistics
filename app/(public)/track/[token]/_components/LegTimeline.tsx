interface Leg {
  id: string;
  legSequence: number;
  originLocation: string;
  destinationLocation: string;
  scheduledTime: string;
  status: string;
}

const LEG_STATUS_ICONS: Record<string, string> = {
  SCHEDULED: "⏰",
  EN_ROUTE: "🚗",
  ARRIVED: "📍",
  BOARDED_LOADED: "✅",
  COMPLETED: "🏁",
};

export function LegTimeline({ legs }: { legs: Leg[] }) {
  return (
    <div className="glass-card p-5">
      <p className="section-label mb-4">Trip Itinerary</p>
      <ol className="relative">
        {legs.map((leg, idx) => {
          const isLast = idx === legs.length - 1;
          const isDone = leg.status === "COMPLETED" || leg.status === "BOARDED_LOADED";
          const isActive = leg.status === "EN_ROUTE" || leg.status === "ARRIVED";
          return (
            <li key={leg.id} className={`relative flex gap-4 pb-6 ${isLast ? "pb-0" : ""}`}>
              {!isLast && (
                <div className={`absolute left-[15px] top-8 w-0.5 h-full -bottom-0 ${isDone ? "bg-amber-400/60" : "bg-white/10"}`} />
              )}
              <div className={`
                relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-sm
                ${isDone ? "bg-amber-400 text-black" : isActive ? "bg-amber-400/20 text-amber-400 ring-2 ring-amber-400/40 ring-offset-0" : "bg-white/10 text-white/40"}
              `}>
                {LEG_STATUS_ICONS[leg.status] ?? (idx + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-white/40">
                      {new Date(leg.scheduledTime).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                      {new Date(leg.scheduledTime).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-white font-medium mt-0.5">
                      {leg.originLocation}
                      <span className="text-white/30 mx-2">→</span>
                      {leg.destinationLocation}
                    </p>
                  </div>
                  {isActive && (
                    <span className="flex-shrink-0 badge badge-in-progress text-xs">Live</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}