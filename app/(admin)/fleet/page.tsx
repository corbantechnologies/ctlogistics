import { db } from "@/db";
import { partners } from "@/db/schema";
import { PartnerTable } from "./_components/PartnerTable";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fleet & Partners | CT Logistics Admin" };
export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const allPartners = await db.query.partners.findMany({
    with: { assets: true, drivers: true },
    orderBy: partners.companyName,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Fleet & Partners</h1>
        <p className="text-white/40 text-sm mt-1">{allPartners.length} registered partners</p>
      </div>
      <PartnerTable partners={allPartners as any} />
    </div>
  );
}