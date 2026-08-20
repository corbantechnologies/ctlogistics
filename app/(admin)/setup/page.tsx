/**
 * /admin/setup — First-run setup page
 * Only accessible if no admin accounts exist yet.
 * Once the first admin is created, this page redirects to /admin/login.
 */
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { SetupForm } from "./_SetupForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "First-Time Setup | CT Logistics" };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  // If any admin already exists, this page is permanently closed
  const existing = await db.query.adminUsers.findFirst();
  if (existing) redirect("/admin/login");

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-blue-900/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center">
            <span className="text-black font-black text-lg">CT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">First-Time Setup</h1>
          <p className="text-white/40 text-sm mt-2">
            No admin accounts exist yet. Create your primary admin account to get started.
          </p>
          <p className="text-amber-400/60 text-xs mt-2">
            This page will be unavailable once the first admin is created.
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}