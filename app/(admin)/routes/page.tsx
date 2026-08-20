import { db } from "@/db";
import { routes, routeRateCards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CorridorTable } from "./_components/CorridorTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Corridors & Rates | CT Logistics Admin" };
export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const allRoutes = await db.query.routes.findMany({
    with: { rateCards: true },
    orderBy: routes.name,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Corridors & Rate Cards</h1>
        <p className="text-white/40 text-sm mt-1">{allRoutes.length} corridors · Edit sell rates inline</p>
      </div>
      <CorridorTable routes={allRoutes as any} />
    </div>
  );
}