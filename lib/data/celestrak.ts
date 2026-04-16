import { unstable_cache } from "next/cache";
import { RawSatcatRecord, OrbitalObject, CountsResponse } from "@/lib/types";
import { normalizeAll } from "./normalize";
import {
  getCachedData,
  getStaleCachedData,
  setCachedData,
  markCacheStale,
} from "./cache";
import { FALLBACK_COUNTS, FALLBACK_OBJECTS } from "./fallback";
import { CELESTRAK_CONFIG } from "@/lib/constants";

/**
 * Parse CSV text into an array of records.
 * CelesTrak SATCAT CSV has a header row followed by data rows.
 */
function parseSatcatCsv(csvText: string): RawSatcatRecord[] {
  const lines = csvText.split("\n");
  if (lines.length < 2) return [];

  // Header row
  const headers = parseCSVLine(lines[0]);
  const records: RawSatcatRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;

    const record: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j].trim();
      const val = values[j]?.trim() ?? "";
      // Convert numeric fields
      if (
        ["PERIOD", "INCLINATION", "APOGEE", "PERIGEE", "RCS", "NORAD_CAT_ID"].includes(key)
      ) {
        record[key] = val === "" ? null : Number(val);
      } else {
        record[key] = val || null;
      }
    }
    records.push(record as unknown as RawSatcatRecord);
  }

  return records;
}

/**
 * Parse a single CSV line respecting quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Fetch the complete SATCAT catalog as CSV (includes ALL object types).
 * This is the full catalog: payloads, rocket bodies, debris, and unknown.
 */
async function fetchFullSatcat(): Promise<RawSatcatRecord[]> {
  const url = CELESTRAK_CONFIG.SATCAT_URL;

  const response = await fetch(url, {
    // Next.js 16 data cache — the full CSV is shared across invocations for 2h.
    // Before, `cache: "no-store"` made every cold start re-download ~10MB.
    next: { revalidate: CELESTRAK_CONFIG.CACHE_TTL_MS / 1000, tags: ["satcat"] },
    headers: {
      "User-Agent": "HowManyObjects.space/1.0 (educational-project)",
    },
  });

  if (!response.ok) {
    throw new Error(`CelesTrak returned ${response.status}`);
  }

  const csvText = await response.text();
  return parseSatcatCsv(csvText);
}

/**
 * Main data fetch — tries CelesTrak, falls back to cache, then to static seed.
 *
 * Intentionally NOT wrapped in unstable_cache: the parsed catalog is
 * ~10.8MB serialized, which exceeds Vercel's 2MB per-entry data cache
 * limit. Instead we cache the small derived outputs (counts, snapshot)
 * that actually fit.
 */
export async function getOrbitalData(): Promise<{
  objects: OrbitalObject[];
  counts: CountsResponse;
}> {
  // 1. In-process (per-invocation) memory cache — cheapest path.
  //    This matters because counts + snapshot both call into here.
  const cached = getCachedData();
  if (cached) {
    return { objects: cached.objects, counts: cached.counts };
  }

  // 2. Fetch fresh data from CelesTrak (the fetch itself is data-cached
  //    via `next: { revalidate }`, so repeat CelesTrak downloads inside
  //    the same window are free even across invocations).
  try {
    const rawRecords = await fetchFullSatcat();
    const objects = normalizeAll(rawRecords);

    if (objects.length > 0) {
      const entry = setCachedData(objects);
      return { objects: entry.objects, counts: entry.counts };
    }

    throw new Error("No objects returned from CelesTrak");
  } catch (error) {
    console.error("Failed to fetch from CelesTrak:", error);

    // 3. Try stale in-process cache
    const stale = getStaleCachedData();
    if (stale) {
      markCacheStale();
      return { objects: stale.objects, counts: stale.counts };
    }

    // 4. Ultimate fallback: static seed data
    console.warn("Using static fallback data");
    return {
      objects: FALLBACK_OBJECTS,
      counts: FALLBACK_COUNTS,
    };
  }
}

/**
 * Counts-only accessor — fits comfortably under the 2MB data-cache limit
 * (~3KB), so we can memoize it across invocations via unstable_cache.
 * This is what /api/counts and the home page hero hit on every render.
 */
export const getOrbitalCounts = unstable_cache(
  async (): Promise<CountsResponse> => {
    const { counts } = await getOrbitalData();
    return counts;
  },
  ["orbital-counts-v1"],
  {
    revalidate: CELESTRAK_CONFIG.CACHE_TTL_MS / 1000,
    tags: ["orbital-data"],
  }
);

type SnapshotPayload = Array<{
  id: string;
  name: string;
  objectType: OrbitalObject["objectType"];
  orbitRegion: OrbitalObject["orbitRegion"];
  apogeeKm?: number;
  perigeeKm?: number;
  inclinationDeg?: number;
  launchDate?: string;
}>;

/**
 * Build a lightweight, evenly-sampled snapshot of the catalog for the
 * 3D hero scene. Small enough (~200KB) to cache in Next's data cache
 * and ship to clients. Giving every particle a real NORAD identity is
 * what makes click interactivity meaningful.
 */
export const getOrbitalSnapshot = unstable_cache(
  async (maxItems = 600): Promise<SnapshotPayload> => {
    const { objects } = await getOrbitalData();

    // Keep only orbit-classified objects so every particle has a region.
    const orbital = objects.filter((o) => o.orbitRegion !== "unknown");

    // Quota per (region × type) pair so the visualization feels balanced,
    // not 90% LEO debris (which is statistically true but visually noisy).
    const quota = {
      LEO: {
        active_satellite: 180,
        inactive_satellite: 40,
        rocket_body: 40,
        debris: 80,
      },
      MEO: {
        active_satellite: 30,
        inactive_satellite: 8,
        rocket_body: 8,
        debris: 10,
      },
      GEO: {
        active_satellite: 40,
        inactive_satellite: 20,
        rocket_body: 10,
        debris: 20,
      },
      HEO: {
        active_satellite: 20,
        inactive_satellite: 10,
        rocket_body: 10,
        debris: 20,
      },
    } as const;

    const seen = new Map<string, number>();
    const picked: OrbitalObject[] = [];
    for (const obj of orbital) {
      if (picked.length >= maxItems) break;
      const region = obj.orbitRegion as keyof typeof quota;
      if (!(region in quota)) continue;
      const type = obj.objectType as keyof (typeof quota)[typeof region];
      const cap = quota[region]?.[type];
      if (cap == null) continue;
      const key = `${region}:${type}`;
      const count = seen.get(key) ?? 0;
      if (count >= cap) continue;
      seen.set(key, count + 1);
      picked.push(obj);
    }

    return picked.map((o) => ({
      id: o.catalogNumber,
      name: o.name,
      objectType: o.objectType,
      orbitRegion: o.orbitRegion,
      apogeeKm: o.apogeeKm,
      perigeeKm: o.perigeeKm,
      inclinationDeg: o.inclinationDeg,
      launchDate: o.launchDate,
    }));
  },
  ["orbital-snapshot-v1"],
  {
    revalidate: CELESTRAK_CONFIG.CACHE_TTL_MS / 1000,
    tags: ["orbital-data"],
  }
);

/**
 * Get a single object by catalog number
 */
export async function getObjectById(
  id: string
): Promise<OrbitalObject | null> {
  const { objects } = await getOrbitalData();
  return objects.find((obj) => obj.catalogNumber === id) || null;
}

/**
 * Get filtered and paginated objects
 */
export async function getFilteredObjects(params: {
  types?: string[];
  regions?: string[];
  search?: string;
  launchedAfter?: string;
  sortBy?: "launch_desc" | "launch_asc" | "name";
  page?: number;
  pageSize?: number;
}): Promise<{ objects: OrbitalObject[]; total: number }> {
  const { objects } = await getOrbitalData();

  let filtered = objects;

  if (params.types && params.types.length > 0) {
    filtered = filtered.filter((obj) =>
      params.types!.includes(obj.objectType)
    );
  }

  if (params.regions && params.regions.length > 0) {
    filtered = filtered.filter((obj) =>
      params.regions!.includes(obj.orbitRegion)
    );
  }

  if (params.launchedAfter) {
    const cutoff = params.launchedAfter;
    filtered = filtered.filter(
      (obj) => obj.launchDate && obj.launchDate >= cutoff
    );
  }

  if (params.search) {
    const query = params.search.toLowerCase();
    filtered = filtered.filter(
      (obj) =>
        obj.name.toLowerCase().includes(query) ||
        obj.catalogNumber.includes(query) ||
        (obj.intlDesignator?.toLowerCase().includes(query) ?? false)
    );
  }

  // Sort
  if (params.sortBy === "launch_desc") {
    filtered.sort((a, b) =>
      (b.launchDate || "").localeCompare(a.launchDate || "")
    );
  } else if (params.sortBy === "launch_asc") {
    filtered.sort((a, b) =>
      (a.launchDate || "").localeCompare(b.launchDate || "")
    );
  }

  const total = filtered.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const start = (page - 1) * pageSize;

  return {
    objects: filtered.slice(start, start + pageSize),
    total,
  };
}
