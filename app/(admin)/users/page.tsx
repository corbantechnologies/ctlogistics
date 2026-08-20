import { db } from "@/db";
import { adminUsers, partnerUsers, partners } from "@/db/schema";
import { UsersPanel } from "./_components/UsersPanel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management | CT Logistics Admin" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [allAdmins, allPartnerUsers, allPartners] = await Promise.all([
    db.query.adminUsers.findMany({ orderBy: adminUsers.createdAt }),
    db.query.partnerUsers.findMany({
      with: { partner: true },
      orderBy: partnerUsers.createdAt,
    }),
    db.query.partners.findMany({
      where: (p, { eq }) => eq(p.isActive, true),
      orderBy: partners.companyName,
    }),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-white/40 text-sm mt-1">
          {allAdmins.length} admin/dispatcher accounts · {allPartnerUsers.length} partner logins
        </p>
      </div>
      <UsersPanel
        admins={allAdmins as any}
        partnerUsers={allPartnerUsers as any}
        partners={allPartners as any}
      />
    </div>
  );
}