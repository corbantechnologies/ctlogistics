import { getMyFleet } from "@/app/actions/partner";
import { FleetInventoryClient } from "./_FleetInventoryClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Fleet & Services | Partner Portal" };
export const dynamic = "force-dynamic";

export default async function PartnerFleetPage() {
  const myAssets = await getMyFleet();

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FleetInventoryClient initialAssets={myAssets} />
    </div>
  );
}