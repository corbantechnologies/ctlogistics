"use client";

import { useState, useTransition } from "react";
import { toggleRouteStatus, updateRateCard } from "@/app/actions/routes";
import { VEHICLE_CATEGORY_LABELS } from "@/app/(public)/_components/types";

interface Props { routes: any[]; }

export function CorridorTable({ routes }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(routeId: string, current: boolean) {
    startTransition(() => toggleRouteStatus(routeId, !current));
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <div key={route.id} className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${route.isActive ? "bg-green-400" : "bg-white/20"}`} />
              <div>
                <p className="font-semibold text-white">{route.name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {route.standardDistanceKm} km · ~{Math.round(route.estimatedDurationMins / 60)}h
                  {route.tollsIncluded ? " · Tolls included" : ""}
                  {route.deadheadIncluded ? " · Deadhead included" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(route.id, route.isActive)}
                disabled={isPending}
                className={`text-xs rounded-lg px-3 py-1.5 font-medium transition-colors ${route.isActive ? "bg-green-400/10 text-green-400 hover:bg-red-400/10 hover:text-red-400" : "bg-white/10 text-white/40 hover:bg-green-400/10 hover:text-green-400"}`}
              >
                {route.isActive ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => setExpanded(expanded === route.id ? null : route.id)}
                className="btn-ghost py-1.5 px-3 text-xs"
              >
                {expanded === route.id ? "Close" : "Rate Cards"} {route.rateCards?.length ?? 0}
              </button>
            </div>
          </div>

          {expanded === route.id && (
            <div className="border-t border-white/8 p-5">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle Category</th>
                    <th>Buy Rate (COGS)</th>
                    <th>Sell Rate</th>
                    <th>Margin</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {route.rateCards?.map((card: any) => (
                    <RateCardRow key={card.id} card={card} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RateCardRow({ card }: { card: any }) {
  const [editing, setEditing] = useState(false);
  const [buy, setBuy] = useState(card.defaultBuyRate);
  const [sell, setSell] = useState(card.retailSellRate);
  const [isPending, startTransition] = useTransition();

  const margin = sell > 0 ? (((sell - buy) / sell) * 100).toFixed(0) : "0";

  function handleSave() {
    const fd = new FormData();
    fd.set("id", card.id);
    fd.set("defaultBuyRate", buy);
    fd.set("retailSellRate", sell);
    startTransition(async () => {
      await updateRateCard(fd);
      setEditing(false);
    });
  }

  const catLabel = (VEHICLE_CATEGORY_LABELS as any)[card.vehicleCategory] ?? card.vehicleCategory;

  return (
    <tr>
      <td className="text-white/70 text-xs">{catLabel.split("—")[0].trim()}</td>
      <td>
        {editing ? (
          <input type="number" value={buy} onChange={(e) => setBuy(e.target.value)} className="input-field py-1 text-xs w-28" />
        ) : (
          <span className="text-white/60">KES {parseFloat(buy).toLocaleString()}</span>
        )}
      </td>
      <td>
        {editing ? (
          <input type="number" value={sell} onChange={(e) => setSell(e.target.value)} className="input-field py-1 text-xs w-28" />
        ) : (
          <span className="text-white font-medium">KES {parseFloat(sell).toLocaleString()}</span>
        )}
      </td>
      <td>
        <span className={`font-bold text-sm ${parseFloat(margin) >= 25 ? "text-green-400" : parseFloat(margin) >= 15 ? "text-amber-400" : "text-red-400"}`}>
          {margin}%
        </span>
      </td>
      <td>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={isPending} className="text-xs text-green-400 hover:text-green-300">Save</button>
            <button onClick={() => setEditing(false)} className="text-xs text-white/30 hover:text-white">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-amber-400/60 hover:text-amber-400">Edit</button>
        )}
      </td>
    </tr>
  );
}