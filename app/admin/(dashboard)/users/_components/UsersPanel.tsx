"use client";

import { useState, useTransition } from "react";
import { createAdminUser, createPartnerUser, toggleUserStatus } from "@/app/actions/users";

interface Props {
  admins: any[];
  partnerUsers: any[];
  partners: any[];
}

function PasswordField({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={8}
        placeholder="Minimum 8 characters"
        className="input-field pr-16"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white transition-colors"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export function UsersPanel({ admins, partnerUsers, partners }: Props) {
  const [activeTab, setActiveTab] = useState<"admin" | "partner">("admin");
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdminSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await createAdminUser(fd);
      if ("success" in result) {
        setFeedback({ type: "success", msg: result.message as string });
        form.reset();
        setShowForm(false);
      } else {
        setFeedback({ type: "error", msg: typeof result.error === "string" ? result.error : "Please check the form." });
      }
    });
  }

  function handlePartnerSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await createPartnerUser(fd);
      if ("success" in result) {
        setFeedback({ type: "success", msg: result.message as string });
        form.reset();
        setShowForm(false);
      } else {
        setFeedback({ type: "error", msg: typeof result.error === "string" ? result.error : "Please check the form." });
      }
    });
  }

  function handleToggleAdmin(userId: string, current: boolean) {
    startTransition(async () => { await toggleUserStatus(userId, !current); });
  }

  function handleTogglePartner(userId: string, current: boolean) {
    startTransition(async () => { await toggleUserStatus(userId, !current); });
  }

  return (
    <div className="space-y-5">
      {/* Feedback banner */}
      {feedback && (
        <div className={`rounded border px-4 py-3 text-sm flex items-center justify-between
          ${feedback.type === "success" ? "bg-green-400/10 border-green-400/20 text-green-400" : "bg-red-400/10 border-red-400/20 text-red-400"}`}>
          <span>{feedback.type === "success" ? "✓ " : "✕ "}{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-50 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center justify-between">
        <div className="flex rounded overflow-hidden border border-white/10">
          {(["admin", "partner"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowForm(false); }}
              className={`px-5 py-2 text-sm font-medium transition-colors capitalize
                ${activeTab === tab ? "bg-amber-400/15 text-amber-400" : "text-white/40 hover:text-white"}`}
            >
              {tab === "admin" ? `👤 Admins & Dispatchers (${admins.length})` : `🏢 Partner Logins (${partnerUsers.length})`}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setFeedback(null); }}
          className="btn-ghost text-sm"
        >
          {showForm ? "× Cancel" : `+ Create ${activeTab === "admin" ? "Admin/Dispatcher" : "Partner Login"}`}
        </button>
      </div>

      {/* Create form */}
      {showForm && activeTab === "admin" && (
        <form onSubmit={handleAdminSubmit} className="glass-card p-6 space-y-4 border-amber-400/20">
          <p className="font-semibold text-white">New Admin / Dispatcher Account</p>
          <p className="text-xs text-white/40">Admins can create users. Dispatchers can only manage bookings.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="section-label mb-1 block">Full Name</span>
              <input name="name" required className="input-field" placeholder="Jane Muthoni" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Email</span>
              <input name="email" type="email" required className="input-field" placeholder="jane@ctlogistics.co.ke" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Role</span>
              <select name="role" className="input-field">
                <option value="DISPATCHER">Dispatcher</option>
                <option value="ADMIN">Admin (full access)</option>
              </select>
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Temporary Password</span>
              <PasswordField name="password" />
            </label>
          </div>
          <div className="rounded bg-amber-400/8 border border-amber-400/15 px-4 py-3 text-xs text-amber-300">
            💡 Share the password securely (e.g. WhatsApp + delete after). A password-change flow will be added in Phase 2.
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Creating…" : "Create Account"}
            </button>
          </div>
        </form>
      )}

      {showForm && activeTab === "partner" && (
        <form onSubmit={handlePartnerSubmit} className="glass-card p-6 space-y-4 border-amber-400/20">
          <p className="font-semibold text-white">New Partner Portal Login</p>
          <p className="text-xs text-white/40">
            The partner company must already be registered under Fleet & Partners.
            This creates their login credentials for <strong className="text-white/60">/partner/login</strong>.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="section-label mb-1 block">Partner Company</span>
              <select name="partnerId" required className="input-field">
                <option value="">— Select partner —</option>
                {partners.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.companyName}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Contact Person Name</span>
              <input name="name" required className="input-field" placeholder="James Kariuki" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Email</span>
              <input name="email" type="email" required className="input-field" placeholder="james@partner.co.ke" />
            </label>
            <label className="block">
              <span className="section-label mb-1 block">Temporary Password</span>
              <PasswordField name="password" />
            </label>
          </div>
          <div className="rounded bg-blue-400/8 border border-blue-400/15 px-4 py-3 text-xs text-blue-300">
            💡 Partner will log in at <strong>/partner/login</strong> and only see their own fleet and assigned jobs.
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Creating…" : "Create Partner Login"}
            </button>
          </div>
        </form>
      )}

      {/* Admin users table */}
      {activeTab === "admin" && (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((u: any) => (
                <tr key={u.id}>
                  <td className="text-white font-medium">{u.name}</td>
                  <td className="text-white/60">{u.email}</td>
                  <td>
                    <span className={`badge text-xs ${u.role === "ADMIN" ? "badge-confirmed" : "badge-pending"}`}>
                      {u.role === "ADMIN" ? "🔑 Admin" : "📡 Dispatcher"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge text-xs ${u.isActive ? "badge-completed" : "badge-cancelled"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-white/30 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.isActive)}
                      disabled={isPending}
                      className={`text-xs font-medium transition-colors ${u.isActive ? "text-red-400/60 hover:text-red-400" : "text-green-400/60 hover:text-green-400"}`}
                    >
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={6} className="text-center text-white/20 py-8">No admin accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Partner users table */}
      {activeTab === "partner" && (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {partnerUsers.map((u: any) => (
                <tr key={u.id}>
                  <td className="text-white font-medium">{u.name}</td>
                  <td className="text-white/60">{u.email}</td>
                  <td className="text-white/50">{u.partner?.companyName ?? "—"}</td>
                  <td>
                    <span className={`badge text-xs ${u.isActive ? "badge-completed" : "badge-cancelled"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-white/30 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePartner(u.id, u.isActive)}
                      disabled={isPending}
                      className={`text-xs font-medium transition-colors ${u.isActive ? "text-red-400/60 hover:text-red-400" : "text-green-400/60 hover:text-green-400"}`}
                    >
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {partnerUsers.length === 0 && (
                <tr><td colSpan={6} className="text-center text-white/20 py-8">No partner logins created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}