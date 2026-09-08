import { getMarketplaceJobs, getMyFleet } from "@/app/actions/partner";
import { ClaimJobCard } from "./_ClaimJobCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Job Marketplace | CT Drive Partner" };
export const dynamic = "force-dynamic";

export default async function JobsMarketplacePage() {
  const [unassignedJobs, myFleet] = await Promise.all([
    getMarketplaceJobs(),
    getMyFleet(),
  ]);

  // Filter fleet to active, available vehicles
  const availableVehicles = myFleet.filter(
    (a) => a.isActive && a.availabilityStatus === "AVAILABLE"
  );

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto text-white">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <h1 className="text-2xl font-bold tracking-tight">Job Marketplace</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Browse incoming unassigned trip inquiries. Claim jobs matching your fleet capacity to confirm bookings.
        </p>
      </div>

      {availableVehicles.length === 0 ? (
        <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-sm flex items-center justify-between">
          <span>⚠️ All your registered vehicles are currently assigned or offline. Update your fleet status to claim marketplace jobs.</span>
        </div>
      ) : (
        <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 px-3 inline-block">
          ✓ {availableVehicles.length} vehicle(s) currently available in your fleet for dispatch.
        </div>
      )}

      <div className="space-y-4">
        {unassignedJobs.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 rounded-2xl border border-white/10 space-y-3">
            <div className="text-4xl">✨</div>
            <p className="font-semibold text-white">No Unassigned Jobs Right Now</p>
            <p className="text-sm max-w-md mx-auto">
              All active client inquiries are currently claimed. New inquiries will appear here automatically in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unassignedJobs.map((leg) => (
              <ClaimJobCard
                key={leg.id}
                leg={leg}
                availableVehicles={availableVehicles}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
