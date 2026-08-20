import { redirect } from "next/navigation";
import { getAdminSession } from "@/app/actions/auth";
import { AdminSidebar } from "./_components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex h-dvh overflow-hidden">
      <AdminSidebar role={session.user.role as string} userName={session.user.name} />
      <main className="flex-1 overflow-y-auto bg-[#0b0f1a]">
        {children}
      </main>
    </div>
  );
}