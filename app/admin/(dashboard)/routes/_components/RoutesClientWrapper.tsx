"use client";

import { useState } from "react";
import { CorridorTable } from "./CorridorTable";
import { AddCorridorForm } from "./AddCorridorForm";

export function RoutesClientWrapper({ allRoutes }: { allRoutes: any[] }) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Corridors & Rate Cards</h1>
          <p className="text-white/40 text-sm mt-1">{allRoutes.length} corridors · Edit sell rates inline</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn-primary py-2 px-4 text-sm">
            + New Corridor
          </button>
        )}
      </div>

      {isAdding ? (
        <AddCorridorForm onSuccess={() => setIsAdding(false)} onCancel={() => setIsAdding(false)} />
      ) : (
        <CorridorTable routes={allRoutes} />
      )}
    </>
  );
}
