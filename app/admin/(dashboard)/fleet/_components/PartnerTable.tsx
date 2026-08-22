"use client";

import { useState, useTransition } from "react";
import { updatePartnerCompliance, createPartner, addAsset } from "@/app/actions/fleet";

const COMPLIANCE_STYLES: Record<string, string> = {
  PENDING: "badge-pending", APPROVED: "badge-completed", SUSPENDED: "badge-cancelled",
};

interface Props { partners: any[]; }

export function PartnerTable({ partners }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();



  function handleComplianceChange(partnerId: string, status: "PENDING" | "APPROVED" | "SUSPENDED") {
    startTransition(async () => { await updatePartnerCompliance(partnerId, status); });
  }

  function handleAddPartner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => { await createPartner(fd); setShowAddPartner(false); });
  }

  function handleAddAsset(e: React.FormEvent<HTMLFormElement>, partnerId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("partnerId", partnerId);
    startTransition(async () => { await addAsset(fd); setShowAddAsset(null); });
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowAddPartner(!showAddPartner)} className="btn-ghost text-sm">
        + Add Partner
      </button>

      {showAddPartner && (
        <form onSubmit={handleAddPartner} className="glass-card p-5 space-y-4">
          <p className="font-semibold text-white">New Partner</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="section-label mb-1 block">Company Name</span><input name="companyName" required className="input-field" /></label>
            <label className="block"><span className="section-label mb-1 block">Contact Name</span><input name="contactName" required className="input-field" /></label>
            <label className="block"><span className="section-label mb-1 block">Phone</span><input name="phone" required className="input-field" /></label>
            <label className="block"><span className="section-label mb-1 block">Email</span><input name="email" type="email" className="input-field" /></label>
          </div>
          <label className="block"><span className="section-label mb-1 block">Internal Notes (vetting, insurance type, PSV/comprehensive)</span><textarea name="notes" rows={2} className="input-field resize-none" /></label>
          <div className="flex gap-3">
            <button type="submit" disabled={isPending} className="btn-primary">Save Partner</button>
            <button type="button" onClick={() => setShowAddPartner(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {partners.map((partner) => {
        const insuranceExpiries = partner.assets?.flatMap((a: any) => [a.psvInsuranceExpiry, a.comprehensiveInsuranceExpiry].filter(Boolean)) ?? [];
        const minDays = insuranceExpiries.length > 0
          ? Math.min(...insuranceExpiries.map((d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)))
          : null;

        return (
          <div key={partner.id} className="glass-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-white/10 flex items-center justify-center text-lg flex-shrink-0">🏢</div>
                <div>
                  <p className="font-semibold text-white">{partner.companyName}</p>
                  <p className="text-sm text-white/40">{partner.contactName} · {partner.phone}</p>
                  {partner.notes && <p className="text-xs text-white/25 mt-0.5 italic">{partner.notes}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {minDays !== null && minDays < 30 && (
                  <span className="badge badge-cancelled text-xs">⚠️ Insurance {minDays}d</span>
                )}
                <select value={partner.complianceStatus}
                  onChange={(e) => handleComplianceChange(partner.id, e.target.value as any)}
                  disabled={isPending}
                  className="text-xs rounded bg-transparent border border-white/10 px-2 py-1 text-white">
                  <option className="bg-slate-900" value="PENDING">Pending</option>
                  <option className="bg-slate-900" value="APPROVED">Approved</option>
                  <option className="bg-slate-900" value="SUSPENDED">Suspended</option>
                </select>
                <span className={`badge ${COMPLIANCE_STYLES[partner.complianceStatus]}`}>{partner.complianceStatus}</span>
                <button onClick={() => setExpanded(expanded === partner.id ? null : partner.id)} className="btn-ghost py-1.5 px-3 text-xs">
                  {partner.assets?.length ?? 0} vehicles · {partner.drivers?.length ?? 0} drivers
                </button>
              </div>
            </div>

            {expanded === partner.id && (
              <div className="border-t border-white/8 p-5 space-y-5">
                <table className="data-table">
                  <thead><tr><th>Plate</th><th>Vehicle</th><th>Category</th><th>Seats</th><th>Insurance</th><th>GPS</th></tr></thead>
                  <tbody>
                    {partner.assets?.map((a: any) => (
                      <tr key={a.id}>
                        <td className="font-mono text-amber-400">{a.plateNumber}</td>
                        <td className="text-white/80 text-sm">{a.makeModel} {a.year ? `(${a.year})` : ""}</td>
                        <td className="text-white/50 text-xs">{a.category.replace(/_/g, " ")}</td>
                        <td className="text-white/50 text-xs">{a.seatingCapacity}</td>
                        <td className="text-xs">
                          {a.psvInsuranceExpiry ? (
                            <span className="text-blue-400">PSV {new Date(a.psvInsuranceExpiry).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                          ) : a.comprehensiveInsuranceExpiry ? (
                            <span className="text-white/40">Comp {new Date(a.comprehensiveInsuranceExpiry).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                          ) : <span className="text-red-400">Not set</span>}
                        </td>
                        <td>{a.hasGpsTracker ? <span className="text-green-400 text-xs">✓ GPS</span> : <span className="text-white/20 text-xs">—</span>}</td>
                      </tr>
                    ))}
                    {!partner.assets?.length && (
                      <tr><td colSpan={6} className="text-center text-white/20 text-sm py-4">No vehicles registered</td></tr>
                    )}
                  </tbody>
                </table>

                <button onClick={() => setShowAddAsset(showAddAsset === partner.id ? null : partner.id)} className="btn-ghost text-xs">
                  + Add Vehicle
                </button>

                {showAddAsset === partner.id && (
                  <form onSubmit={(e) => handleAddAsset(e, partner.id)} className="space-y-4 border-t border-white/8 pt-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block"><span className="section-label mb-1 block">Plate</span><input name="plateNumber" required className="input-field" placeholder="KDA 123A" /></label>
                      <label className="block"><span className="section-label mb-1 block">Make & Model</span><input name="makeModel" required className="input-field" placeholder="Toyota Allion" /></label>
                      <label className="block"><span className="section-label mb-1 block">Year</span><input name="year" type="number" className="input-field" /></label>
                      <label className="block"><span className="section-label mb-1 block">Color</span><input name="color" className="input-field" /></label>
                      <label className="block"><span className="section-label mb-1 block">Category</span>
                        <select name="category" className="input-field">
                          <option value="SALOON">Saloon</option>
                          <option value="COMPACT_SUV">Compact SUV</option>
                          <option value="PRADO_LUXURY">Prado Luxury</option>
                          <option value="SAFARI_CRUISER_4X4">Safari Cruiser 4x4</option>
                          <option value="TOUR_VAN">Tour Van</option>
                          <option value="MINIBUS_14_SEATER">Minibus 14-Seater</option>
                          <option value="COASTER_33_SEATER">Coaster 33-Seater</option>
                          <option value="COACH_50_SEATER">Coach 50-Seater</option>
                        </select>
                      </label>
                      <label className="block"><span className="section-label mb-1 block">Seats</span><input name="seatingCapacity" type="number" required className="input-field" /></label>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block"><span className="section-label mb-1 block">PSV Insurance Expiry</span><input name="psvInsuranceExpiry" type="date" className="input-field" /></label>
                      <label className="block"><span className="section-label mb-1 block">Comprehensive Expiry</span><input name="comprehensiveInsuranceExpiry" type="date" className="input-field" /></label>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" name="isSelfDriveEligible" value="true" /> Self-drive eligible</label>
                      <label className="flex items-center gap-2 text-sm text-white/60"><input type="checkbox" name="hasGpsTracker" value="true" /> Has GPS tracker</label>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={isPending} className="btn-primary text-sm">Add Vehicle</button>
                      <button type="button" onClick={() => setShowAddAsset(null)} className="btn-ghost text-sm">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}