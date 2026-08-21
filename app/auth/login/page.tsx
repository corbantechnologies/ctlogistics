"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authenticate } from "@/app/actions/auth";
import toast from "react-hot-toast";

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("next", nextUrl);
    
    try {
      const result = await authenticate(formData);
      if (result?.error) {
        toast.error(result.error);
        setError(result.error);
        setIsLoading(false);
      }
      // If successful, the action will throw a redirect which is handled by Next.js
    } catch (err: any) {
      if (err.message === "NEXT_REDIRECT") throw err;
      toast.error("An unexpected error occurred");
      setError(err.message || "Failed to log in");
      setIsLoading(false);
    }
  };

  return (
    <form method="POST" onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-400/10 border border-red-400/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      <label className="block">
        <span className="section-label mb-2 block">Email Address</span>
        <input name="email" type="email" required placeholder="name@domain.com" className="input-field" />
      </label>
      <label className="block">
        <div className="flex items-center justify-between mb-2">
          <span className="section-label">Password</span>
          <a href="/auth/forgot-password" className="text-xs text-amber-400 hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <input name="password" type={show ? "text" : "password"} required placeholder="••••••••" className="input-field pr-16" />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>
      <button type="submit" disabled={isLoading} className="btn-primary w-full">
        {isLoading ? "Signing in…" : "Sign In →"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
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
          <h1 className="text-2xl font-bold text-white">CT Drive Portal</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
        </div>
        <Suspense fallback={<div className="glass-card p-7 text-center text-white/50 text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}