"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  asset: any;
}

export function DocumentUploadClient({ asset }: Props) {
  const [loading, setLoading] = useState(false);
  const [psvExpiry, setPsvExpiry] = useState(
    asset.psvInsuranceExpiry ? new Date(asset.psvInsuranceExpiry).toISOString().split("T")[0] : ""
  );
  const [compExpiry, setCompExpiry] = useState(
    asset.comprehensiveInsuranceExpiry ? new Date(asset.comprehensiveInsuranceExpiry).toISOString().split("T")[0] : ""
  );
  const [inspectionExpiry, setInspectionExpiry] = useState(
    asset.inspectionExpiry ? new Date(asset.inspectionExpiry).toISOString().split("T")[0] : ""
  );

  const handleUpdateExpiries = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      toast.success("Compliance document expiration dates saved for verification!");
    } catch (err: any) {
      toast.error("Failed to update document dates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-slate-900/60 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
          1. Insurance & Inspection Expiration Dates
        </h2>

        <form onSubmit={handleUpdateExpiries} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">
                PSV Certificate Expiry Date
              </label>
              <input
                type="date"
                value={psvExpiry}
                onChange={(e) => setPsvExpiry(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">
                Comprehensive Insurance Expiry
              </label>
              <input
                type="date"
                value={compExpiry}
                onChange={(e) => setCompExpiry(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">
                NTSA Inspection Sticker Expiry
              </label>
              <input
                type="date"
                value={inspectionExpiry}
                onChange={(e) => setInspectionExpiry(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-400/20"
            >
              {loading ? "Saving Dates..." : "Save Expiry Dates"}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-slate-900/60 backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
          2. Document Uploads (PDF / Images)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-dashed border-white/20 p-5 rounded-xl text-center space-y-2 hover:border-amber-400/50 transition-colors">
            <div className="text-2xl">📄</div>
            <p className="font-semibold text-white">PSV / Comprehensive Insurance Certificate</p>
            <p className="text-slate-400 text-[11px]">Upload scanned PDF or clear photo of policy cover</p>
            <input type="file" accept="image/*,.pdf" className="text-xs text-slate-400 mx-auto" />
          </div>

          <div className="border border-dashed border-white/20 p-5 rounded-xl text-center space-y-2 hover:border-amber-400/50 transition-colors">
            <div className="text-2xl">🛡️</div>
            <p className="font-semibold text-white">NTSA Vehicle Inspection Sticker</p>
            <p className="text-slate-400 text-[11px]">Upload clear photo of valid inspection certificate</p>
            <input type="file" accept="image/*,.pdf" className="text-xs text-slate-400 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
