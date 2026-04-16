"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { CountsResponse, OrbitalObject } from "@/lib/types";
import type { SnapshotObject } from "@/components/EarthVisualization";
import HeroCount from "@/components/HeroCount";
import DataStatus from "@/components/DataStatus";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ExploreSection from "@/components/ExploreSection";
import EducationalSection from "@/components/EducationalSection";
import ShareActions from "@/components/ShareActions";
import ScrollReveal from "@/components/ScrollReveal";
import ObjectDrawer from "@/components/ObjectDrawer";

// Dynamic import for Three.js to avoid SSR issues. Kept in its own chunk
// so the hero globe doesn't block first paint.
const EarthVisualization = dynamic(
  () => import("@/components/EarthVisualization"),
  {
    ssr: false,
    loading: () => (
      <div className="hero__canvas-container">
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at center, #0a1628 0%, #060a14 100%)",
          }}
        />
      </div>
    ),
  }
);

interface HomeClientProps {
  initialCounts: CountsResponse | null;
}

function snapshotToOrbital(s: SnapshotObject): OrbitalObject {
  return {
    id: s.id,
    catalogNumber: s.id,
    name: s.name,
    objectType: s.objectType,
    orbitRegion: s.orbitRegion,
    launchDate: s.launchDate,
    apogeeKm: s.apogeeKm,
    perigeeKm: s.perigeeKm,
    inclinationDeg: s.inclinationDeg,
  };
}

export default function HomeClient({ initialCounts }: HomeClientProps) {
  const [counts, setCounts] = useState<CountsResponse | null>(initialCounts);
  const [selectedObject, setSelectedObject] = useState<OrbitalObject | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Refresh counts periodically
  const refreshCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/counts");
      if (res.ok) {
        const data: CountsResponse = await res.json();
        setCounts(data);
      }
    } catch {
      // Silently fail — we have cached data
    }
  }, []);

  useEffect(() => {
    // Refresh on tab focus
    const handleFocus = () => refreshCounts();
    window.addEventListener("focus", handleFocus);

    // Periodic refresh every 5 minutes (was 2m — counts change slowly;
    // less polling = less bandwidth + fewer wakeups on mobile)
    const interval = setInterval(refreshCounts, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [refreshCounts]);

  const handleParticleSelect = useCallback((snap: SnapshotObject) => {
    setSelectedObject(snapshotToOrbital(snap));
    setDrawerOpen(true);
  }, []);

  // If we have the full drawer payload in the catalog, swap it in so the
  // user gets operator/launch-site fields after opening. Fire-and-forget.
  useEffect(() => {
    if (!drawerOpen || !selectedObject) return;
    let cancelled = false;
    fetch(
      `/api/object/${encodeURIComponent(selectedObject.catalogNumber)}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data: OrbitalObject | null) => {
        if (cancelled || !data || !data.catalogNumber) return;
        setSelectedObject((prev) =>
          prev && prev.catalogNumber === data.catalogNumber ? data : prev
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [drawerOpen, selectedObject]);

  const heroInstructions = useMemo(
    () =>
      "Hover objects in the cloud to read their names, click to see orbital details.",
    []
  );

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero" id="hero">
        <EarthVisualization
          counts={counts}
          onSelect={handleParticleSelect}
        />

        <HeroCount
          targetCount={counts?.totalCount || 0}
          isLoading={!counts}
        />

        <div className="hero__timestamp">
          {counts && (
            <DataStatus
              lastSyncedAt={counts.lastSyncedAt}
              dataHealth={counts.dataHealth}
            />
          )}
        </div>

        <p className="hero__interact-hint" aria-live="polite">
          {heroInstructions}
        </p>

        <div className="hero__scroll-hint" aria-hidden="true">
          <span>Explore</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider" />

      {/* ── Category Breakdown ── */}
      <CategoryBreakdown counts={counts} />

      {/* ── Divider ── */}
      <div className="divider" />

      {/* ── Explore Section ── */}
      <ExploreSection />

      {/* ── Divider ── */}
      <div className="divider" />

      {/* ── Educational Section ── */}
      <EducationalSection />

      {/* ── Share Actions ── */}
      <ScrollReveal>
        <ShareActions totalCount={counts?.totalCount || 0} />
      </ScrollReveal>

      {/* ── Footer ── */}
      <footer className="footer">
        <p>
          Data sourced from{" "}
          <a
            href="https://celestrak.org"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            CelesTrak
          </a>{" "}
          / 18th Space Defense Squadron
        </p>
        <p>
          Built with wonder. Not affiliated with any government agency.
        </p>
        <p style={{ marginTop: "var(--space-2)" }}>
          Made by{" "}
          <a
            href="https://www.instagram.com/yasir._jama/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
            style={{ fontWeight: 500 }}
          >
            me
          </a>
        </p>
        <p style={{ marginTop: "var(--space-4)", opacity: 0.5 }}>
          howmanyobjects.space © {new Date().getFullYear()}
        </p>
      </footer>

      {/* Drawer — shared with ExploreSection's drawer semantics */}
      <ObjectDrawer
        object={selectedObject}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
