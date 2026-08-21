import { getMyUpcomingLegs } from "@/app/actions/partner";
import type { Metadata } from "next";
import { updateLegStatus } from "@/app/actions/partner";

export const metadata: Metadata = { title: "My Jobs | Partner Portal" };
export const dynamic = "force-dynamic";

const LEG_STATUS_OPTS = [
  { value: "EN_ROUTE", label: "▶ Start (En Route)" },
  { value: "ARRIVED", label: "📍 Arrived" },
  { value: "BOARDED_LOADED", label: "✅ Passengers Boarded" },
  { value: "COMPLETED", label: "🏁 Mark Complete" },
];

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "badge-pending", EN_ROUTE: "badge-in-progress",
  ARRIVED: "badge-confirmed", BOARDED_LOADED: "badge-dispatched", COMPLETED: "badge-completed",
};

export default async function PartnerDashboard() {
  const legs = await getMyUpcomingLegs();

  const active = legs.filter((l) => l.status !== "COMPLETED" && l.status !== "SCHEDULED");
  const upcoming = legs.filter((l) => l.status === "SCHEDULED");
  const completed = legs.filter((l) => l.status === "COMPLETED");

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Jobs</h1>
        <p className="text-white/40 text-sm mt-1">{legs.length} total assigned legs</p>
      </div>

      {active.length > 0 && (
        <section>
          <p className="section-label mb-4">Active Now</p>
          <div className="space-y-4">
            {active.map((leg) => <LegCard key={leg.id} leg={leg as any} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <p className="section-label mb-4">Upcoming</p>
          <div className="space-y-4">
            {upcoming.map((leg) => <LegCard key={leg.id} leg={leg as any} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <p className="section-label mb-4">Completed</p>
          <div className="space-y-3">
            {completed.slice(0, 10).map((leg) => (
              <div key={leg.id} className="glass-card px-5 py-4 flex items-center justify-between opacity-50">
                <div>
                  <p className="text-sm text-white">{leg.originLocation} → {leg.destinationLocation}</p>
                  <p className="text-xs text-white/40">{leg.assignedAsset?.plateNumber} · {new Date(leg.scheduledTime).toLocaleDateString("en-KE")}</p>
                </div>
                <span className="badge badge-completed text-xs">🏁 Done</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {legs.length === 0 && (
        <div className="glass-card p-10 text-center space-y-3">
          <p className="text-4xl">📭</p>
          <p className="text-white font-semibold">No jobs assigned yet</p>
          <p className="text-white/40 text-sm">CT Logistics dispatch will assign bookings to your vehicles.</p>
        </div>
      )}
    </div>
  );
}

function LegCard({ leg }: { leg: any }) {
  const payout = parseFloat(leg.partnerPayout || 0);
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/40">{new Date(leg.scheduledTime).toLocaleDateString("en-KE", { weekday:"short", day:"numeric", month:"short" })} · {new Date(leg.scheduledTime).toLocaleTimeString("en-KE", { hour:"2-digit", minute:"2-digit" })}</p>
          <p className="text-white font-semibold mt-1">{leg.originLocation}</p>
          <p className="text-white/50 text-sm">→ {leg.destinationLocation}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`badge ${STATUS_COLORS[leg.status] ?? "badge-pending"} text-xs`}>{leg.status.replace(/_/g, " ")}</span>
          {payout > 0 && <p className="text-amber-400 font-bold text-lg mt-2">KES {payout.toLocaleString()}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm border-t border-white/8 pt-3">
        <div>
          <p className="section-label">Vehicle</p>
          <p className="text-white font-mono mt-0.5">{leg.assignedAsset?.plateNumber ?? "—"}</p>
        </div>
        <div>
          <p className="section-label">Model</p>
          <p className="text-white/60 mt-0.5">{leg.assignedAsset?.makeModel ?? "—"}</p>
        </div>
        {leg.driver && (
          <div>
            <p className="section-label">Driver</p>
            <p className="text-white/60 mt-0.5">{leg.driver.name}</p>
          </div>
        )}
      </div>

      {leg.status !== "COMPLETED" && (
        <form action={async (fd: FormData) => {
          "use server";
          await updateLegStatus(leg.id, fd.get("status") as any);
        }} className="flex gap-2 flex-wrap">
          {LEG_STATUS_OPTS.filter((o) => o.value !== leg.status).map((opt) => (
            <button key={opt.value} name="status" value={opt.value} type="submit"
              className="btn-ghost text-xs py-2 px-3">
              {opt.label}
            </button>
          ))}
          {leg.handoverToken && (
            <a href={`/handover/${leg.handoverToken}`} className="btn-primary text-xs py-2 px-3">
              📋 Open Handover Form
            </a>
          )}
        </form>
      )}
    </div>
  );
}