import { redirect } from "next/navigation";
import { getPartnerSession } from "@/app/actions/auth";
import { PartnerSidebar } from "./_components/PartnerSidebar";
import { db } from "@/db";
import { partnerUsers, partners } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getPartnerSession();
  if (!session) redirect("/partner/login");

  const user = await db.query.partnerUsers.findFirst({
    where: eq(partnerUsers.id, session.user.id),
    with: { partner: true },
  });

  return (
    <div className="flex h-dvh overflow-hidden">
      <PartnerSidebar companyName={user?.partner?.companyName ?? "Partner"} />
      <main className="flex-1 overflow-y-auto bg-[#0b0f1a]">{children}</main>
    </div>
  );
}