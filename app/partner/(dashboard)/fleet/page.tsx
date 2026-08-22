import { getMyFleet } from "@/app/actions/partner";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Fleet | Partner Portal" };
export const dynamic = "force-dynamic";

export default async function PartnerFleetPage() {
  const myAssets = await getMyFleet();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Fleet</h1>
        <p className="text-white/40 text-sm mt-1">{myAssets.length} registered vehicles</p>
      </div>

      {myAssets.length === 0 ? (
        <div className="glass-card p-10 text-center text-white/30">
          No vehicles registered. Contact CT Drive admin to add vehicles.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myAssets.map((asset) => {
            const psvExpiry = asset.psvInsuranceExpiry ? new Date(asset.psvInsuranceExpiry) : null;
            const compExpiry = asset.comprehensiveInsuranceExpiry ? new Date(asset.comprehensiveInsuranceExpiry) : null;
            const expiryDate = psvExpiry ?? compExpiry;
            const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000) : null;

            return (
              <div key={asset.id} className="glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xl font-black text-amber-400">{asset.plateNumber}</p>
                    <p className="text-white font-semibold">{asset.makeModel}</p>
                    <p className="text-white/40 text-xs">{asset.color} · {asset.year ?? "—"}</p>
                  </div>
                  <span className={`badge text-xs ${asset.isActive ? "badge-completed" : "badge-cancelled"}`}>
                    {asset.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-3 text-xs">
                  <div>
                    <p className="text-white/30">Category</p>
                    <p className="text-white/70 mt-0.5">{asset.category.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-white/30">Seats</p>
                    <p className="text-white/70 mt-0.5">{asset.seatingCapacity}</p>
                  </div>
                  <div>
                    <p className="text-white/30">Insurance</p>
                    <p className={`mt-0.5 font-medium ${daysLeft !== null && daysLeft < 30 ? "text-red-400" : "text-white/70"}`}>
                      {psvExpiry ? "PSV" : "Comp"} · {expiryDate ? expiryDate.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "2-digit" }) : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30">GPS</p>
                    <p className={`mt-0.5 ${asset.hasGpsTracker ? "text-green-400" : "text-white/30"}`}>
                      {asset.hasGpsTracker ? "✓ Fitted" : "Not fitted"}
                    </p>
                  </div>
                </div>

                {daysLeft !== null && daysLeft < 30 && (
                  <div className="rounded bg-red-400/10 border border-red-400/20 px-3 py-2 text-xs text-red-400">
                    ⚠️ Insurance expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}