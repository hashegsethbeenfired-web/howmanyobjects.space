import { OrbitalObject, CountsResponse } from "@/lib/types";

/**
 * Static fallback counts — used when CelesTrak is unreachable
 * Numbers approximate as of April 2026
 */
export const FALLBACK_COUNTS: CountsResponse = {
  totalCount: 48500,
  countsByType: {
    active_satellite: 10200,
    inactive_satellite: 5100,
    rocket_body: 2800,
    debris: 29900,
    unknown: 500,
  },
  countsByOrbitRegion: {
    LEO: 38500,
    MEO: 2800,
    GEO: 1200,
    HEO: 450,
    unknown: 5550,
  },
  lastSyncedAt: "2026-04-13T00:00:00Z",
  dataHealth: "degraded",
};

/**
 * Representative sample objects for when full data is unavailable.
 * This is NOT a complete catalog — just enough to power the explore UI.
 */
export const FALLBACK_OBJECTS: OrbitalObject[] = [
  {
    id: "25544",
    catalogNumber: "25544",
    name: "ISS (ZARYA)",
    objectType: "active_satellite",
    orbitRegion: "LEO",
    launchDate: "1998-11-20",
    apogeeKm: 422,
    perigeeKm: 418,
    inclinationDeg: 51.6,
    periodMin: 92.9,
    operator: "ISS",
    status: "+",
  },
  {
    id: "48274",
    catalogNumber: "48274",
    name: "CSS (TIANHE)",
    objectType: "active_satellite",
    orbitRegion: "LEO",
    launchDate: "2021-04-29",
    apogeeKm: 389,
    perigeeKm: 382,
    inclinationDeg: 41.5,
    periodMin: 92.2,
    operator: "PRC",
    status: "+",
  },
  {
    id: "20580",
    catalogNumber: "20580",
    name: "HST (HUBBLE SPACE TELESCOPE)",
    objectType: "active_satellite",
    orbitRegion: "LEO",
    launchDate: "1990-04-24",
    apogeeKm: 540,
    perigeeKm: 537,
    inclinationDeg: 28.5,
    periodMin: 95.4,
    operator: "US",
    status: "+",
  },
  {
    id: "43013",
    catalogNumber: "43013",
    name: "STARLINK-0001",
    objectType: "active_satellite",
    orbitRegion: "LEO",
    launchDate: "2018-02-22",
    apogeeKm: 550,
    perigeeKm: 545,
    inclinationDeg: 53.0,
    periodMin: 95.6,
    operator: "US",
    status: "+",
  },
  {
    id: "36516",
    catalogNumber: "36516",
    name: "GOES 15",
    objectType: "active_satellite",
    orbitRegion: "GEO",
    launchDate: "2010-03-04",
    apogeeKm: 35791,
    perigeeKm: 35779,
    inclinationDeg: 0.04,
    periodMin: 1436.1,
    operator: "US",
    status: "+",
  },
];
