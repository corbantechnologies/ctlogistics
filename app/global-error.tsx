"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh flex items-center justify-center px-4 py-12 bg-slate-950 text-white font-sans antialiased">
        <div className="w-full max-w-lg text-center space-y-8 backdrop-blur-xl bg-slate-900/70 border border-white/10 p-8 sm:p-10 rounded-2xl shadow-2xl">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-400 flex items-center justify-center shadow-xl shadow-red-500/20">
              <svg className="w-7 h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Critical System Error
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              An unexpected critical system error occurred. Please refresh the application.
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-amber-400/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
