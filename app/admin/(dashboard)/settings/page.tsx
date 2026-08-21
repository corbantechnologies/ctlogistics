"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/app/actions/auth";

export default function AdminSettingsPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    if (fd.get("newPassword") !== fd.get("confirmPassword")) {
      setError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const res = await changePassword(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        form.reset();
      }
    });
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm mb-4">
            Password changed successfully. Other sessions have been revoked.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Current Password</label>
            <input type="password" name="currentPassword" required className="input-field w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">New Password</label>
            <input type="password" name="newPassword" required minLength={8} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Confirm New Password</label>
            <input type="password" name="confirmPassword" required minLength={8} className="input-field w-full" />
          </div>
          
          <div className="pt-2">
            <button type="submit" disabled={isPending} className="btn-primary w-full py-2">
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
