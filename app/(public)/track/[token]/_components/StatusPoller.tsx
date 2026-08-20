"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "./StatusBadge";

interface Props {
  token: string;
  initialStatus: string;
}

export function StatusPoller({ token, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    // Don't poll if trip is in a terminal state
    if (status === "COMPLETED" || status === "CANCELLED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/booking-status?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== status) setStatus(data.status);
          setLastChecked(new Date());
        }
      } catch {
        // Silent failure — network hiccup
      }
    }, 30_000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [token, status]);

  return (
    <div className="space-y-2">
      <StatusBadge status={status} />
      <p className="text-xs text-white/25">
        Last updated: {lastChecked.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}