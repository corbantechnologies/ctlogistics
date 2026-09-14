/**
 * /admin/setup — First-run setup page
 * Only accessible if no admin accounts exist yet.
 * Once the first admin is created, this page redirects to /auth/login.
 */
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SetupForm } from "./_SetupForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "First-Time Setup | CT Drive" };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  let existing = null;
  try {
    // If any admin already exists, this page is permanently closed
    existing = await db.query.users.findFirst({
      where: eq(users.role, "ADMIN"),
    });
  } catch (error) {
    console.warn("Database tables missing during setup. Auto-initializing schema...", error);
    try {
      const { syncDatabaseSchema } = await import("@/db/sync");
      await syncDatabaseSchema();
      existing = await db.query.users.findFirst({
        where: eq(users.role, "ADMIN"),
      });
    } catch (syncErr) {
      console.error("Error during auto-sync:", syncErr);
    }
  }

  if (existing) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-blue-900/15 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 backdrop-blur-xl bg-slate-900/60 border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-black font-black text-xl">CT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">First-Time Setup</h1>
          <p className="text-slate-400 text-sm mt-2">
            No admin accounts exist yet. Create your primary admin account to get started.
          </p>
          <p className="text-amber-400/80 text-xs mt-2 font-medium bg-amber-400/10 border border-amber-400/20 rounded-lg py-1.5 px-3 inline-block">
            This page will be locked once the first admin is created.
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}