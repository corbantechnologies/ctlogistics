"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime application error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12 relative bg-slate-950 text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] bg-red-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-10 h-72 w-72 bg-amber-500/10 rounded-full blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center space-y-8 backdrop-blur-xl bg-slate-900/70 border border-white/10 p-8 sm:p-10 rounded-2xl shadow-2xl">
        {/* Brand Badge */}
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-400 flex items-center justify-center shadow-xl shadow-red-500/20">
            <svg className="w-7 h-7 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Error Details */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            Server Exception
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Something went wrong
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            A temporary server issue occurred while processing your request. Our engineering team has been notified.
          </p>

          {error?.digest && (
            <div className="mt-2 inline-block">
              <code className="text-[11px] font-mono bg-slate-950/80 border border-white/10 text-slate-400 px-2.5 py-1 rounded-md">
                Error Reference ID: {error.digest}
              </code>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-sm transition-all duration-200 shadow-lg shadow-amber-400/20 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-white/10 transition-all duration-200 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return Home
          </Link>
        </div>

        {/* Contact Support */}
        <div className="pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>Need immediate assistance?</span>
          <a
            href={`https://wa.me/254768978865?text=Hello%20CT%20Drive%20Support,%20I%20encountered%20error%20digest%20${error?.digest || 'unknown'}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}
