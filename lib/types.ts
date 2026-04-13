export type ObjectType =
  | "active_satellite"
  | "inactive_satellite"
  | "rocket_body"
  | "debris"
  | "unknown";

export type OrbitRegion = "LEO" | "MEO" | "GEO" | "HEO" | "unknown";

export type DataHealth = "ok" | "stale" | "degraded";

export interface OrbitalObject {
  id: string;
  catalogNumber: string;
  name: string;
  objectType: ObjectType;
  orbitRegion: OrbitRegion;
  launchDate?: string;
  apogeeKm?: number;
  perigeeKm?: number;
  inclinationDeg?: number;
  periodMin?: number;
  operator?: string;
  launchSite?: string;
  status?: string;
  intlDesignator?: string;
}

export interface CountsResponse {
  totalCount: number;
  countsByType: Record<ObjectType, number>;
  countsByOrbitRegion: Record<OrbitRegion, number>;
  lastSyncedAt: string;
  dataHealth: DataHealth;
}

export interface ObjectsResponse {
  objects: OrbitalObject[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AppState {
  counts: CountsResponse | null;
  selectedObject: OrbitalObject | null;
  filters: {
    types: ObjectType[];
    regions: OrbitRegion[];
    search: string;
  };
  isLoading: boolean;
  error: string | null;
}

// Raw CelesTrak SATCAT record
export interface RawSatcatRecord {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: string;
  OBJECT_TYPE: string;
  OPS_STATUS_CODE: string;
  OWNER: string;
  LAUNCH_DATE: string;
  LAUNCH_SITE: string;
  DECAY_DATE: string | null;
  PERIOD: number | null;
  INCLINATION: number | null;
  APOGEE: number | null;
  PERIGEE: number | null;
  RCS: number | null;
  DATA_STATUS_CODE: string;
  ORBIT_CENTER: string;
  ORBIT_TYPE: string;
}
