"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { formatNumber, easeOutCubic, prefersReducedMotion } from "@/lib/utils";
import { ANIMATION } from "@/lib/constants";

interface HeroCountProps {
  targetCount: number;
  isLoading?: boolean;
}

export default function HeroCount({
  targetCount,
  isLoading = false,
}: HeroCountProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const animationRef = useRef<number | null>(null);
  const previousCount = useRef(0);

  const animateCount = useCallback(
    (from: number, to: number) => {
      if (prefersReducedMotion()) {
        setDisplayCount(to);
        previousCount.current = to;
        return;
      }

      const startTime = performance.now();
      const duration = ANIMATION.COUNT_DURATION;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const current = Math.round(from + (to - from) * easedProgress);

        setDisplayCount(current);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(tick);
        } else {
          previousCount.current = to;
        }
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      animationRef.current = requestAnimationFrame(tick);
    },
    []
  );

  useEffect(() => {
    if (targetCount > 0 && targetCount !== previousCount.current) {
      animateCount(previousCount.current, targetCount);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetCount, animateCount]);

  return (
    <div className="hero__content">
      <p className="hero__label" aria-hidden="true">
        Right now, there are
      </p>

      <div
        className="hero__count"
        role="status"
        aria-live="polite"
        aria-label={`${formatNumber(targetCount)} human-made objects orbiting Earth`}
      >
        {isLoading ? (
          <div className="skeleton skeleton--count" aria-hidden="true" />
        ) : (
          <span aria-hidden="true">{formatNumber(displayCount)}</span>
        )}
      </div>

      <p className="hero__sublabel" aria-hidden="true">
        human-made objects orbiting Earth
      </p>
    </div>
  );
}
