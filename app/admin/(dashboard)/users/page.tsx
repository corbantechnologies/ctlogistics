import { db } from "@/db";
import { users, partners } from "@/db/schema";
import { UsersPanel } from "./_components/UsersPanel";
import { eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "User Management | CT Drive Admin" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [allAdmins, allPartnerUsers, allPartners] = await Promise.all([
    db.query.users.findMany({ 
      where: inArray(users.role, ["ADMIN", "DISPATCHER"]),
      orderBy: users.createdAt 
    }),
    db.query.users.findMany({
      where: eq(users.role, "PARTNER"),
      with: { partner: true },
      orderBy: users.createdAt,
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