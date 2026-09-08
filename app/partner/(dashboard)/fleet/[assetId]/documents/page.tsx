import { notFound } from "next/navigation";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DocumentUploadClient } from "./_DocumentUploadClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vehicle Compliance Documents | Partner Portal" };
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ assetId: string }>;
}

export default async function VehicleDocumentsPage({ params }: Props) {
  const { assetId } = await params;

  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, assetId),
    with: { partner: true },
  });

  if (!asset) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto text-white">
      <div>
        <h1 className="text-2xl font-bold">Vehicle Compliance Documents</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload official compliance documents for vehicle <strong className="text-amber-400 font-mono">{asset.plateNumber}</strong> ({asset.makeModel}).
        </p>
      </div>

      <DocumentUploadClient asset={asset} />
    </div>
  );
}
