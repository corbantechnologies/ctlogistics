"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logOut } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/admin/dispatch", icon: "📡", label: "Watchtower" },
  { href: "/admin/routes", icon: "🛣️", label: "Corridors & Rates" },
  { href: "/admin/fleet", icon: "🚐", label: "Fleet & Partners" },
  { href: "/admin/finance", icon: "💰", label: "Finance & Ledger" },
  { href: "/admin/events", icon: "🎪", label: "Group Events" },
  { href: "/admin/users", icon: "👥", label: "Users & Accounts" },
];

interface Props { role: string; userName: string; }

export function AdminSidebar({ role, userName }: Props) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-white/8 bg-[#0d1120]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="h-8 w-8 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-xs">CT</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">CT Drive</p>
          <p className="text-xs text-amber-400/70 capitalize">{role?.toLowerCase()}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="section-label px-2 mb-3">Operations</p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname.startsWith(item.href) ? "active" : ""}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/8 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
            {userName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-white/30 capitalize">{role?.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/settings" className="btn-ghost flex-1 text-xs py-2 text-white/50 text-center">
            Settings
          </Link>
          <form action={logOut} className="flex-1">
            <button type="submit" className="btn-ghost w-full text-xs py-2 text-white/50">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}