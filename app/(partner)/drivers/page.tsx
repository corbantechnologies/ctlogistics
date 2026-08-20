import { getMyDrivers } from "@/app/actions/partner";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Drivers | Partner Portal" };
export const dynamic = "force-dynamic";

export default async function PartnerDriversPage() {
  const myDrivers = await getMyDrivers();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Drivers</h1>
        <p className="text-white/40 text-sm mt-1">{myDrivers.length} registered drivers</p>
      </div>

      {myDrivers.length === 0 ? (
        <div className="glass-card p-10 text-center text-white/30">
          No drivers registered. Contact CT Logistics admin to add drivers.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myDrivers.map((driver) => {
            const licenseExpiry = driver.licenseExpiry ? new Date(driver.licenseExpiry) : null;
            const daysLeft = licenseExpiry ? Math.ceil((licenseExpiry.getTime() - Date.now()) / 86400000) : null;

            return (
              <div key={driver.id} className="glass-card p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                    🧑‍✈️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{driver.name}</p>
                    <a href={`tel:${driver.phone}`} className="text-amber-400 text-sm hover:underline">{driver.phone}</a>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${driver.isActive ? "badge-completed" : "badge-cancelled"}`}>
                    {driver.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/8 pt-3 text-xs">
                  <div>
                    <p className="text-white/30">License #</p>
                    <p className="text-white/70 font-mono mt-0.5">{driver.licenseNumber ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/30">License Expiry</p>
                    <p className={`mt-0.5 font-medium ${daysLeft !== null && daysLeft < 30 ? "text-red-400" : "text-white/70"}`}>
                      {licenseExpiry ? licenseExpiry.toLocaleDateString("en-KE", {day:"numeric",month:"short",year:"numeric"}) : "Not set"}
                    </p>
                  </div>
                </div>

                {daysLeft !== null && daysLeft < 30 && (
                  <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-3 py-2 text-xs text-red-400">
                    ⚠️ License expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
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