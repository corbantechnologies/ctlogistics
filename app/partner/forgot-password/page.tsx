"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";

export default function PartnerForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    
    startTransition(async () => {
      try {
        const { partnerAuthClient } = await import("@/lib/auth-client.partner");
        const { error } = await partnerAuthClient.forgetPassword({
          email,
          redirectTo: `${window.location.origin}/partner/reset-password`
        });

        if (error) {
          toast.error(error.message || "Failed to send reset email");
          setError(error.message);
        } else {
          toast.success("Password reset email sent! Check your inbox.");
          (e.target as HTMLFormElement).reset();
        }
      } catch (err: any) {
        console.error("[PARTNER FRONTEND] Error caught during forgetPassword API call:", err);
        toast.error("An unexpected error occurred");
        setError(err.message);
      }
    });
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-0 h-96 w-96 bg-green-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 bg-blue-900/15 rounded-full blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-green-500 flex items-center justify-center">
            <span className="text-white font-black text-lg">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-white/40 text-sm mt-1">Enter your partner email to receive a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5 border-green-500/20">
          {error && (
            <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}
          <label className="block">
            <span className="section-label mb-2 block">Login Email</span>
            <input name="email" type="email" required placeholder="partner@example.com" className="input-field" />
          </label>
          
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? "Sending link…" : "Send Reset Link →"}
          </button>
        </form>
        <p className="text-center text-xs text-white/20">
          Remember your password? <a href="/partner/login" className="text-green-500/60 hover:text-green-500">Back to Login →</a>
        </p>
      </div>
    </div>
  );
}
