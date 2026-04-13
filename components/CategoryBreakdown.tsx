"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils";
import { TYPE_LABELS, TYPE_COLORS, REGION_LABELS, REGION_COLORS } from "@/lib/constants";
import type { CountsResponse, ObjectType, OrbitRegion } from "@/lib/types";
import ScrollReveal from "./ScrollReveal";

interface CategoryBreakdownProps {
  counts: CountsResponse | null;
}

const TYPE_BAR_CLASSES: Record<ObjectType, string> = {
  active_satellite: "breakdown__bar-fill--active",
  inactive_satellite: "breakdown__bar-fill--inactive",
  rocket_body: "breakdown__bar-fill--rocket",
  debris: "breakdown__bar-fill--debris",
  unknown: "breakdown__bar-fill--unknown",
};

export default function CategoryBreakdown({ counts }: CategoryBreakdownProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!counts) return null;

  const typeEntries = Object.entries(counts.countsByType)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]) as [ObjectType, number][];

  const regionEntries = Object.entries(counts.countsByOrbitRegion)
    .filter(([key, count]) => count > 0 && key !== "unknown")
    .sort((a, b) => b[1] - a[1]) as [OrbitRegion, number][];

  const maxTypeCount = Math.max(...typeEntries.map(([, c]) => c));

  return (
    <>
      <section className="section" id="breakdown" aria-labelledby="breakdown-title">
        <ScrollReveal>
          <h2 className="section__title" id="breakdown-title">
            What&apos;s up there?
          </h2>
          <p className="section__subtitle">
            A breakdown of {formatNumber(counts.totalCount)} tracked objects by category
          </p>
        </ScrollReveal>

        <div className="breakdown">
          {typeEntries.map(([type, count], i) => {
            const percentage = ((count / counts.totalCount) * 100).toFixed(1);
            const barWidth = animated
              ? `${(count / maxTypeCount) * 100}%`
              : "0%";

            return (
              <ScrollReveal key={type} delay={i * 100}>
                <div
                  className="breakdown__item"
                  role="listitem"
                  style={{
                    borderLeftColor: TYPE_COLORS[type],
                    borderLeftWidth: "3px",
                  }}
                >
                  <div className="breakdown__item-header">
                    <span className="breakdown__item-label">
                      {TYPE_LABELS[type]}
                    </span>
                    <span className="breakdown__item-count">
                      {formatNumber(count)}
                    </span>
                  </div>
                  <div className="breakdown__bar">
                    <div
                      className={`breakdown__bar-fill ${TYPE_BAR_CLASSES[type]}`}
                      style={{ width: barWidth }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemax={counts.totalCount}
                      aria-label={`${TYPE_LABELS[type]}: ${formatNumber(count)}`}
                    />
                  </div>
                  <span className="breakdown__percentage">{percentage}%</span>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section
        className="section"
        id="orbit-regions"
        aria-labelledby="regions-title"
      >
        <ScrollReveal>
          <h2 className="section__title" id="regions-title">
            Where are they?
          </h2>
          <p className="section__subtitle">Distribution across orbital shells</p>
        </ScrollReveal>

        <div className="regions">
          {regionEntries.map(([region, count], i) => (
            <ScrollReveal key={region} delay={i * 80}>
              <div className="regions__item">
                <span
                  className={`regions__dot regions__dot--${region.toLowerCase()}`}
                />
                <span className="regions__label">
                  {REGION_LABELS[region]}
                  <br />
                  <small style={{ color: "var(--text-tertiary)" }}>
                    {region}
                  </small>
                </span>
                <span
                  className="regions__count"
                  style={{ color: REGION_COLORS[region] }}
                >
                  {formatNumber(count)}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
