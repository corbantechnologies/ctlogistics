"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser } from "@/app/actions/users";
import toast from "react-hot-toast";

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    // Force role to ADMIN for first account
    fd.set("role", "ADMIN");
    startTransition(async () => {
      const result = await createAdminUser(fd);
      if ("success" in result) {
        toast.success("Admin account created! Redirecting to login...");
        setTimeout(() => router.push("/auth/login?setup=done"), 1500);
      } else {
        const errMsg = typeof result.error === "string" ? result.error : "Please check the form.";
        toast.error(errMsg);
        setError(errMsg);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <label className="block">
        <span className="section-label mb-2 block">Your Full Name</span>
        <input name="name" required className="input-field" placeholder="e.g. Brian Kimani" />
      </label>

      <label className="block">
        <span className="section-label mb-2 block">Admin Email</span>
        <input name="email" type="email" required className="input-field" placeholder="admin@ctlogistics.co.ke" />
      </label>

      <label className="block">
        <span className="section-label mb-2 block">Password</span>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            placeholder="Minimum 8 characters"
            className="input-field pr-16"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {/* hidden role field */}
      <input type="hidden" name="role" value="ADMIN" />

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Creating account…" : "Create Admin Account →"}
      </button>

      <p className="text-xs text-white/25 text-center">
        After setup, sign in at <strong className="text-white/40">/auth/login</strong>. You can then create dispatcher and partner accounts from the Users section.
      </p>
    </form>
  );
}