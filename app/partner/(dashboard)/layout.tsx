import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PartnerSidebar } from "./_components/PartnerSidebar";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/login?next=/partner");

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: { partner: true },
  });

  return (
    <div className="flex h-dvh overflow-hidden">
      <PartnerSidebar companyName={user?.partner?.companyName ?? "Partner"} />
      <main className="flex-1 overflow-y-auto bg-[#0b0f1a]">{children}</main>
    </div>
  );
}