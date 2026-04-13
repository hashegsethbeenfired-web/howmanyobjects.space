import { OrbitalObject, CountsResponse } from "@/lib/types";
import { CELESTRAK_CONFIG } from "@/lib/constants";
import { computeCounts } from "./normalize";

interface CacheEntry {
  objects: OrbitalObject[];
  counts: CountsResponse;
  fetchedAt: number;
}

let memoryCache: CacheEntry | null = null;

/**
 * Check if cache is still valid
 */
export function isCacheValid(): boolean {
  if (!memoryCache) return false;
  return Date.now() - memoryCache.fetchedAt < CELESTRAK_CONFIG.CACHE_TTL_MS;
}

/**
 * Get cached data if available and valid
 */
export function getCachedData(): CacheEntry | null {
  if (isCacheValid()) return memoryCache;
  return null;
}

/**
 * Get cached data even if stale (for fallback)
 */
export function getStaleCachedData(): CacheEntry | null {
  return memoryCache;
}

/**
 * Store data in cache
 */
export function setCachedData(objects: OrbitalObject[]): CacheEntry {
  const now = new Date().toISOString();
  const counts = computeCounts(objects, now, "ok");

  memoryCache = {
    objects,
    counts,
    fetchedAt: Date.now(),
  };

  return memoryCache;
}

/**
 * Mark cache as stale (when fetch fails but we have old data)
 */
export function markCacheStale(): void {
  if (memoryCache) {
    memoryCache.counts = {
      ...memoryCache.counts,
      dataHealth: "stale",
    };
  }
}

/**
 * Get counts (from cache or computed)
 */
export function getCachedCounts(): CountsResponse | null {
  const cached = getCachedData() || getStaleCachedData();
  return cached?.counts || null;
}

/**
 * Get all cached objects
 */
export function getCachedObjects(): OrbitalObject[] {
  const cached = getCachedData() || getStaleCachedData();
  return cached?.objects || [];
}
