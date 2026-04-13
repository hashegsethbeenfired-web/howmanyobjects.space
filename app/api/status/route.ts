import { NextResponse } from "next/server";
import { isCacheValid, getCachedCounts } from "@/lib/data/cache";

export async function GET() {
  const counts = getCachedCounts();
  const cacheValid = isCacheValid();

  return NextResponse.json({
    status: cacheValid ? "healthy" : counts ? "stale" : "no_data",
    cacheValid,
    lastSyncedAt: counts?.lastSyncedAt || null,
    totalCount: counts?.totalCount || 0,
    dataHealth: counts?.dataHealth || "degraded",
  });
}
