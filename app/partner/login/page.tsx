"use client";

import { useState, useTransition } from "react";
import { partnerSignIn } from "@/app/actions/auth";

export default function PartnerLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await partnerSignIn(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-0 h-96 w-96 bg-blue-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 bg-amber-500/8 rounded-full blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center">
            <span className="text-black font-black text-lg">CT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Partner Portal</h1>
          <p className="text-white/40 text-sm mt-1">Fleet Management & Job Tracking</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
          {error && (
            <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          <label className="block">
            <span className="section-label mb-2 block">Email Address</span>
            <input name="email" type="email" required placeholder="partner@yourcompany.com" className="input-field" />
          </label>
          <label className="block">
            <span className="section-label mb-2 block">Password</span>
            <input name="password" type="password" required placeholder="••••••••" className="input-field" />
          </label>
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? "Signing in…" : "Sign In →"}
          </button>
        </form>
        <p className="text-center text-xs text-white/20">
          CT Logistics Admin?{" "}
          <a href="/admin/login" className="text-amber-400/60 hover:text-amber-400">Admin Portal →</a>
        </p>
      </div>
    </div>
  );
}