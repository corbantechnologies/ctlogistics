import { db } from "@/db";
import { routes } from "@/db/schema";
import { RoutesClientWrapper } from "./_components/RoutesClientWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Corridors & Rates | CT Drive Admin" };
export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const allRoutes = await db.query.routes.findMany({
    with: { rateCards: true },
    orderBy: routes.name,
  });

  return (
    <div className="p-6 space-y-6">
      <RoutesClientWrapper allRoutes={allRoutes as any} />
    </div>
  );
}