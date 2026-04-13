"use client";

import { useState, useEffect } from "react";
import { getRelativeTime } from "@/lib/utils";
import type { DataHealth } from "@/lib/types";

interface DataStatusProps {
  lastSyncedAt: string | null;
  dataHealth: DataHealth;
}

export default function DataStatus({
  lastSyncedAt,
  dataHealth,
}: DataStatusProps) {
  const [relativeTime, setRelativeTime] = useState("");

  useEffect(() => {
    if (!lastSyncedAt) return;

    setRelativeTime(getRelativeTime(lastSyncedAt));

    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(lastSyncedAt));
    }, 10000);

    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  if (!lastSyncedAt) return null;

  const healthLabels: Record<DataHealth, string> = {
    ok: "Live data",
    stale: "Data may be stale",
    degraded: "Using cached data",
  };

  return (
    <div
      className="data-status"
      title={`Last synced: ${new Date(lastSyncedAt).toUTCString()}`}
      role="status"
      aria-label={`${healthLabels[dataHealth]}. Updated ${relativeTime}`}
    >
      <span className={`data-status__dot data-status__dot--${dataHealth}`} />
      <span>Updated {relativeTime}</span>
    </div>
  );
}
