"use client";

import { useState } from "react";
import { updateAssetAvailability, registerPartnerAsset } from "@/app/actions/partner";
import toast from "react-hot-toast";

interface Props {
  initialAssets: any[];
}

export function FleetInventoryClient({ initialAssets }: Props) {
  const [assetsList, setAssetsList] = useState(initialAssets);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    plateNumber: "",
    makeModel: "",
    category: "EXECUTIVE_SEDAN",
    seatingCapacity: 4,
    dailyRate: "",
    hourlyRate: "",
    features: "4x4, AC, WiFi, Leather Seats",
    offeredServices: "Airport Transfer, Safari, Chauffeur, Corporate Hire",
  });

  const handleStatusChange = async (assetId: string, status: string) => {
    try {
      const res = await updateAssetAvailability(assetId, status);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Availability status updated to ${status}`);
        setAssetsList((prev) =>
          prev.map((a) => (a.id === assetId ? { ...a, availabilityStatus: status } : a))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plateNumber || !formData.makeModel) {
      toast.error("Please provide plate number and make/model.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerPartnerAsset({
        plateNumber: formData.plateNumber,
        makeModel: formData.makeModel,
        category: formData.category,
        seatingCapacity: Number(formData.seatingCapacity),
        dailyRate: formData.dailyRate ? Number(formData.dailyRate) : undefined,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        features: formData.features,
        offeredServices: formData.offeredServices,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Vehicle registered successfully!");
        setAssetsList((prev) => [res.asset, ...prev]);
        setShowAddModal(false);
        setFormData({
          plateNumber: "",
          makeModel: "",
          category: "EXECUTIVE_SEDAN",
          seatingCapacity: 4,
          dailyRate: "",
          hourlyRate: "",
          features: "4x4, AC, WiFi, Leather Seats",
          offeredServices: "Airport Transfer, Safari, Chauffeur, Corporate Hire",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Fleet & Services</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your registered vehicles, rate cards, offered services, and real-time dispatch availability.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-400/20"
        >
          + List New Vehicle
        </button>
      </div>

      {assetsList.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400 rounded-2xl border border-white/10 space-y-3">
          <div className="text-4xl">🚐</div>
          <p className="font-semibold text-white">No Vehicles Registered Yet</p>
          <p className="text-sm max-w-md mx-auto">
            Click "+ List New Vehicle" to add your first vehicle to the CT Drive partner network.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assetsList.map((asset) => {
            const status = asset.availabilityStatus || "AVAILABLE";

            return (
              <div
                key={asset.id}
                className="glass-card p-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl relative"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xl font-extrabold text-amber-400">
                      {asset.plateNumber}
                    </span>
                    <h3 className="text-white font-bold text-base mt-0.5">{asset.makeModel}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {asset.category?.replace(/_/g, " ")} • {asset.seatingCapacity} Seater
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      status === "AVAILABLE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : status === "ON_TRIP"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Rates & Features */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-slate-500 block">Daily Rate</span>
                    <span className="font-mono font-bold text-amber-300">
                      {asset.dailyRate ? `KES ${Number(asset.dailyRate).toLocaleString()}` : "Contact"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hourly Rate</span>
                    <span className="font-mono font-bold text-slate-300">
                      {asset.hourlyRate ? `KES ${Number(asset.hourlyRate).toLocaleString()}` : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Services:</strong> {asset.offeredServices || "Transfers, Safaris"}
                  </p>
                  <p className="text-slate-400">
                    <strong className="text-slate-300">Features:</strong> {asset.features || "AC, 4x4"}
                  </p>
                </div>

                {/* Availability Toggle */}
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <label className="text-[11px] text-slate-400 block font-medium">
                    Change Status:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(asset.id, e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="AVAILABLE">AVAILABLE (Accepting Jobs)</option>
                    <option value="ON_TRIP">ON TRIP (Currently Dispatched)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Servicing)</option>
                    <option value="OFFLINE">OFFLINE (Unavailable)</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List New Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold">List New Vehicle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Registration Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KDG 456X"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Make & Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Prado TX"
                    value={formData.makeModel}
                    onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Vehicle Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  >
                    <option value="EXECUTIVE_SEDAN">Executive Sedan</option>
                    <option value="LUXURY_SUV">Luxury SUV (Prado/V8)</option>
                    <option value="SAFARI_LAND_CRUISER">Safari Land Cruiser 4x4</option>
                    <option value="TOUR_VAN">Tour Van 4x4</option>
                    <option value="VIP_ALPHARD_VELLFIRE">VIP Alphard/Vellfire</option>
                    <option value="MINI_BUS_COASTER">Coaster Mini Bus</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.seatingCapacity}
                    onChange={(e) => setFormData({ ...formData, seatingCapacity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Daily Rental Rate (KES)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Hourly Rate (KES)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Offered Services</label>
                <input
                  type="text"
                  placeholder="e.g. Airport Transfer, Safari, Self-drive, Corporate Hire"
                  value={formData.offeredServices}
                  onChange={(e) => setFormData({ ...formData, offeredServices: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Vehicle Features & Amenities</label>
                <input
                  type="text"
                  placeholder="e.g. 4x4, Pop-up Roof, AC, WiFi, Refrigerator"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-400/20"
                >
                  {loading ? "Registering..." : "Submit Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
