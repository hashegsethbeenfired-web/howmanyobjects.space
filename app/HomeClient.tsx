"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { CountsResponse } from "@/lib/types";
import HeroCount from "@/components/HeroCount";
import DataStatus from "@/components/DataStatus";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ExploreSection from "@/components/ExploreSection";
import EducationalSection from "@/components/EducationalSection";
import ShareActions from "@/components/ShareActions";
import SiteFooter from "@/components/SiteFooter";
import ScrollReveal from "@/components/ScrollReveal";

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

export default function HomeClient({ initialCounts }: HomeClientProps) {
  const [counts, setCounts] = useState<CountsResponse | null>(initialCounts);

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

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="hero" id="hero">
        <EarthVisualization counts={counts} />

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

        <div className="hero__scroll-hint" aria-hidden="true">
          <span>Explore</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </section>

      <div className="orbital-story">
        <div className="orbital-story__field" aria-hidden="true">
          <span className="orbital-story__ring orbital-story__ring--one" />
          <span className="orbital-story__ring orbital-story__ring--two" />
          <span className="orbital-story__ring orbital-story__ring--three" />
          <span className="orbital-story__signal orbital-story__signal--one" />
          <span className="orbital-story__signal orbital-story__signal--two" />
          <span className="orbital-story__signal orbital-story__signal--three" />
        </div>

        {/* ── Divider ── */}
        <div className="divider divider--entry" />

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
        <SiteFooter />
      </div>

    </>
  );
}
