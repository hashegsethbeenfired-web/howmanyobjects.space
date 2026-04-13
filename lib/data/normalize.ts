import {
  OrbitalObject,
  ObjectType,
  OrbitRegion,
  RawSatcatRecord,
  CountsResponse,
} from "@/lib/types";
import { ORBIT_THRESHOLDS, ACTIVE_STATUS_CODES } from "@/lib/constants";

/**
 * Safely coerce a value to a trimmed string.
 * CelesTrak JSON may return numbers, nulls, or strings for fields like NORAD_CAT_ID.
 */
function safeStr(val: unknown): string {
  if (val == null) return "";
  return String(val).trim();
}

/**
 * Determine object type from SATCAT fields
 */
function classifyObjectType(record: RawSatcatRecord): ObjectType {
  const objType = safeStr(record.OBJECT_TYPE).toUpperCase();
  const opsStatus = safeStr(record.OPS_STATUS_CODE);

  if (objType === "DEB") return "debris";
  if (objType === "R/B") return "rocket_body";
  if (objType === "UNK") return "unknown";

  // It's a payload — check if active
  if (objType === "PAY") {
    if (ACTIVE_STATUS_CODES.includes(opsStatus)) {
      return "active_satellite";
    }
    return "inactive_satellite";
  }

  return "unknown";
}

/**
 * Derive orbit region from apogee/perigee
 */
function classifyOrbitRegion(
  apogee: number | null,
  perigee: number | null
): OrbitRegion {
  if (apogee == null || perigee == null) return "unknown";

  const avgAlt = (apogee + perigee) / 2;

  if (avgAlt <= ORBIT_THRESHOLDS.LEO_MAX) return "LEO";
  if (avgAlt <= ORBIT_THRESHOLDS.MEO_MAX) {
    // Check if it's GEO
    if (
      perigee >= ORBIT_THRESHOLDS.GEO_MIN - 200 &&
      apogee <= ORBIT_THRESHOLDS.GEO_MAX + 200
    ) {
      return "GEO";
    }
    return "MEO";
  }
  if (
    perigee >= ORBIT_THRESHOLDS.GEO_MIN - 200 &&
    apogee <= ORBIT_THRESHOLDS.GEO_MAX + 200
  ) {
    return "GEO";
  }
  if (apogee > ORBIT_THRESHOLDS.GEO_MAX) return "HEO";

  return "unknown";
}

/**
 * Normalize a raw CelesTrak SATCAT record into our OrbitalObject format
 */
export function normalizeRecord(record: RawSatcatRecord): OrbitalObject {
  const catId = safeStr(record.NORAD_CAT_ID);
  return {
    id: catId || "",
    catalogNumber: catId || "",
    name: safeStr(record.OBJECT_NAME) || "Unknown Object",
    objectType: classifyObjectType(record),
    orbitRegion: classifyOrbitRegion(record.APOGEE, record.PERIGEE),
    launchDate: safeStr(record.LAUNCH_DATE) || undefined,
    apogeeKm: record.APOGEE ?? undefined,
    perigeeKm: record.PERIGEE ?? undefined,
    inclinationDeg: record.INCLINATION ?? undefined,
    periodMin: record.PERIOD ?? undefined,
    operator: safeStr(record.OWNER) || undefined,
    launchSite: safeStr(record.LAUNCH_SITE) || undefined,
    status: safeStr(record.OPS_STATUS_CODE) || undefined,
    intlDesignator: safeStr(record.OBJECT_ID) || undefined,
  };
}

/**
 * Filter to only Earth-orbiting objects (exclude deep space, landed, impacted, decayed)
 */
export function filterOnOrbit(record: RawSatcatRecord): boolean {
  // Must be orbiting Earth
  const center = safeStr(record.ORBIT_CENTER).toUpperCase();
  if (center && center !== "EA" && center !== "") return false;

  // Must not have decayed
  if (record.DECAY_DATE) return false;

  // Must be in orbit (not landed/impacted)
  const orbitType = safeStr(record.ORBIT_TYPE).toUpperCase();
  if (orbitType && orbitType !== "ORB") return false;

  return true;
}

/**
 * Normalize a full batch of records
 */
export function normalizeAll(records: RawSatcatRecord[]): OrbitalObject[] {
  return records.filter(filterOnOrbit).map(normalizeRecord);
}

/**
 * Compute aggregate counts from a list of objects
 */
export function computeCounts(
  objects: OrbitalObject[],
  lastSyncedAt: string,
  dataHealth: "ok" | "stale" | "degraded" = "ok"
): CountsResponse {
  const countsByType: Record<ObjectType, number> = {
    active_satellite: 0,
    inactive_satellite: 0,
    rocket_body: 0,
    debris: 0,
    unknown: 0,
  };

  const countsByOrbitRegion: Record<OrbitRegion, number> = {
    LEO: 0,
    MEO: 0,
    GEO: 0,
    HEO: 0,
    unknown: 0,
  };

  for (const obj of objects) {
    countsByType[obj.objectType]++;
    countsByOrbitRegion[obj.orbitRegion]++;
  }

  return {
    totalCount: objects.length,
    countsByType,
    countsByOrbitRegion,
    lastSyncedAt,
    dataHealth,
  };
}
