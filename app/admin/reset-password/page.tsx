"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [show, setShow] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const formToken = fd.get("token") as string || token;
    
    if (!formToken) {
      setError("Reset token is required. Please check your email.");
      return;
    }

    startTransition(async () => {
      try {
        const { adminAuthClient } = await import("@/lib/auth-client.admin");
        const { error } = await adminAuthClient.resetPassword({
          newPassword: password,
          token: formToken
        });

        if (error) {
          toast.error(error.message || "Failed to reset password");
          setError(error.message);
        } else {
          toast.success("Password reset successful!");
          setTimeout(() => router.push("/admin/login"), 1500);
        }
      } catch (err: any) {
        toast.error("An unexpected error occurred");
        setError(err.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      
      {!token && (
        <label className="block">
          <span className="section-label mb-2 block">Reset Token</span>
          <input
            name="token"
            type="text"
            required
            placeholder="Paste token from email"
            className="input-field mb-4"
          />
        </label>
      )}

      <label className="block">
        <span className="section-label mb-2 block">New Password</span>
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
      
      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Resetting…" : "Reset Password →"}
      </button>
    </form>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 h-96 w-96 bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-blue-900/15 rounded-full blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center">
            <span className="text-black font-black text-lg">CT</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-white/40 text-sm mt-1">Enter your new admin password below.</p>
        </div>
        
        <Suspense fallback={<div className="glass-card p-7 text-center text-white/50">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
        
      </div>
    </div>
  );
}
