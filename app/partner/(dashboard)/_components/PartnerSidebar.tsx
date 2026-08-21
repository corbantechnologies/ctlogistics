"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { partnerSignOut } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/partner/dashboard", icon: "📊", label: "My Jobs" },
  { href: "/partner/fleet", icon: "🚐", label: "My Fleet" },
  { href: "/partner/drivers", icon: "🧑‍✈️", label: "My Drivers" },
];

interface Props { companyName: string; }

export function PartnerSidebar({ companyName }: Props) {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 flex-shrink-0 flex-col border-r border-white/8 bg-[#0d1120]">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="h-8 w-8 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
          <span className="text-black font-black text-xs">CT</span>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Partner Portal</p>
          <p className="text-xs text-amber-400/70 truncate">{companyName}</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="section-label px-2 mb-3">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}
            className={`nav-link ${pathname.startsWith(item.href) ? "active" : ""}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/8 p-4">
        <div className="flex gap-2">
          <Link href="/partner/settings" className="btn-ghost flex-1 text-xs py-2 text-white/50 text-center">
            Settings
          </Link>
          <form action={partnerSignOut} className="flex-1">
            <button type="submit" className="btn-ghost w-full text-xs py-2 text-white/50">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}