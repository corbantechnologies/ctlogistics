"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import toast from "react-hot-toast";

export default function AdminForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const email = new FormData(e.currentTarget).get("email") as string;

    try {
      const res = await requestPasswordReset(email, "Admin");
      if (res?.error) {
        toast.error(res.error);
        setError(res.error);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      console.error("[AUTH FRONTEND] Error caught during forgetPassword API call:", err);
      toast.error("An unexpected error occurred");
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/8 rounded blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-blue-900/15 rounded blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded bg-amber-400 flex items-center justify-center">
            <span className="text-black font-black text-lg">CT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-white/40 text-sm mt-1">Enter your email to receive a reset link.</p>
        </div>
        <form method="POST" onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
          {error && (
            <div className="rounded bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <label className="block">
            <span className="section-label mb-2 block">Email Address</span>
            <input name="email" type="email" required placeholder="name@domain.com" className="input-field" />
          </label>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
        <p className="text-center text-xs text-white/20">
          Remember your password? <a href="/auth/login" className="text-amber-400/60 hover:text-amber-400">Back to Login →</a>
        </p>
      </div>
    </div>
  );
}
