import { db } from "@/db";
import { bookings, tripLegs, assets, partners } from "@/db/schema";
import { eq, desc, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finance & Ledger | CT Drive Admin" };
export const dynamic = "force-dynamic";

export default async function FinancePage() {
  // 1. Fetch Revenue Overview Data
  const allBookings = await db.query.bookings.findMany({
    orderBy: [desc(bookings.createdAt)],
  });

  // Calculate totals
  let totalRevenue = 0;
  let totalCogs = 0;

  const unpaidDeposits = [];
  
  for (const b of allBookings) {
    const sell = parseFloat(b.totalSellAmount) || 0;
    const buy = parseFloat(b.totalBuyAmount) || 0;
    totalRevenue += sell;
    totalCogs += buy;

    if (!b.isDepositPaid && b.status !== "CANCELLED") {
      unpaidDeposits.push(b);
    }
  }

  const grossMargin = totalRevenue - totalCogs;
  const marginPct = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  // 2. Fetch Partner Settlement Ledger
  const allPartners = await db.query.partners.findMany({
    with: {
      assets: {
        with: {
          tripLegs: true
        }
      }
    }
  });

  const partnerLedgers = allPartners.map(p => {
    let totalOwed = 0;
    let completedLegs = 0;
    
    p.assets.forEach(a => {
      a.tripLegs.forEach(leg => {
        if (leg.status === "COMPLETED") {
          totalOwed += parseFloat(leg.partnerPayout) || 0;
          completedLegs++;
        }
      });
    });

    return {
      partnerName: p.companyName,
      completedJobs: completedLegs,
      totalOwed,
    };
  }).filter(p => p.completedJobs > 0);

  // 3. Fetch Insurance Expiry Data
  // In a real app we'd parse expiry dates. For now, we list assets with their compliance status.
  const allAssets = await db.query.assets.findMany({
    with: { partner: true },
    orderBy: desc(assets.createdAt)
  });

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Finance & Ledger</h1>
        <p className="text-white/40 text-sm mt-1">Revenue, settlements, and compliance tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Total Revenue (Sell)</p>
          <p className="text-3xl font-bold text-white">KES {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Total COGS (Buy)</p>
          <p className="text-3xl font-bold text-amber-400">KES {totalCogs.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Gross Margin</p>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-green-400">KES {grossMargin.toLocaleString()}</p>
            <p className="text-sm font-medium text-green-400/80 mb-1">{marginPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Partner Settlement Ledger</h2>
          <div className="glass-card overflow-hidden">
            <table className="data-table w-full text-left">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Completed Jobs</th>
                  <th>Total Owed</th>
                </tr>
              </thead>
              <tbody>
                {partnerLedgers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-white/30">No completed jobs yet</td>
                  </tr>
                ) : partnerLedgers.map((l, i) => (
                  <tr key={i}>
                    <td className="font-medium text-white">{l.partnerName}</td>
                    <td>{l.completedJobs}</td>
                    <td className="font-mono text-amber-400">KES {l.totalOwed.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center justify-between">
            <span>Unpaid Deposits</span>
            <span className="badge badge-pending text-xs">{unpaidDeposits.length} Pending</span>
          </h2>
          <div className="glass-card overflow-hidden">
            <table className="data-table w-full text-left">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Client</th>
                  <th>Deposit Amount</th>
                </tr>
              </thead>
              <tbody>
                {unpaidDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-white/30">No pending deposits</td>
                  </tr>
                ) : unpaidDeposits.slice(0, 10).map((b, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-white/60">{b.id.split('-')[0].toUpperCase()}</td>
                    <td className="font-medium text-white">{b.clientName}</td>
                    <td className="font-mono text-amber-400">KES {parseFloat(b.securityDeposit).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Asset Compliance Status</h2>
        <div className="glass-card p-6">
          <p className="text-sm text-white/50 mb-4">
            Monitoring {allAssets.length} vehicles for insurance and NTSA compliance.
          </p>
          <div className="flex flex-wrap gap-3">
            {allAssets.slice(0, 8).map(asset => (
              <div key={asset.id} className={`border rounded-lg px-4 py-2 ${asset.complianceStatus === 'VERIFIED' ? 'border-green-500/20 bg-green-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                <p className="text-sm font-bold text-white">{asset.plateNumber}</p>
                <p className={`text-xs ${asset.complianceStatus === 'VERIFIED' ? 'text-green-400' : 'text-amber-400'}`}>
                  {asset.complianceStatus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
