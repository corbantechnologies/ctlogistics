"use client";

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string; emoji: string }> = {
  PENDING: { label: "Awaiting Dispatch", cls: "badge-pending", dot: "bg-yellow-400", emoji: "🕐" },
  CONFIRMED: { label: "Booking Confirmed", cls: "badge-confirmed", dot: "bg-blue-400", emoji: "✅" },
  DISPATCHED: { label: "Partner Assigned", cls: "badge-dispatched", dot: "bg-purple-400", emoji: "📋" },
  IN_PROGRESS: { label: "En Route", cls: "badge-in-progress", dot: "bg-orange-400", emoji: "🚗" },
  COMPLETED: { label: "Trip Completed", cls: "badge-completed", dot: "bg-green-400", emoji: "🏁" },
  CANCELLED: { label: "Cancelled", cls: "badge-cancelled", dot: "bg-red-400", emoji: "❌" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`badge ${cfg.cls} text-sm px-4 py-2`}>
      <span className={`h-2 w-2 rounded ${cfg.dot} animate-pulse`} />
      {cfg.emoji} {cfg.label}
    </span>
  );
}