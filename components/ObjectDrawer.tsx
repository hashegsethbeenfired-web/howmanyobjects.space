"use client";

import { useEffect, useRef, useCallback } from "react";
import type { OrbitalObject } from "@/lib/types";
import { TYPE_LABELS, TYPE_COLORS, REGION_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

interface ObjectDrawerProps {
  object: OrbitalObject | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ObjectDrawer({
  object,
  isOpen,
  onClose,
}: ObjectDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Focus trap
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!object) return null;

  const typeColor = TYPE_COLORS[object.objectType] || TYPE_COLORS.unknown;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? "drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`drawer ${isOpen ? "drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${object.name}`}
      >
        {/* Mobile handle */}
        <div className="drawer__handle">
          <div className="drawer__handle-bar" />
        </div>

        {/* Header */}
        <div className="drawer__header">
          <h2 className="drawer__title">{object.name}</h2>
          <button
            className="drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="drawer__body">
          {/* Type Badge */}
          <div className="drawer__field">
            <div className="drawer__field-label">Type</div>
            <span
              className="drawer__type-badge"
              style={{
                background: `${typeColor}20`,
                color: typeColor,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: typeColor,
                  display: "inline-block",
                }}
              />
              {TYPE_LABELS[object.objectType]}
            </span>
          </div>

          {/* Catalog Number */}
          <div className="drawer__field">
            <div className="drawer__field-label">NORAD Catalog Number</div>
            <div className="drawer__field-value">{object.catalogNumber}</div>
          </div>

          {/* International Designator */}
          {object.intlDesignator && (
            <div className="drawer__field">
              <div className="drawer__field-label">
                International Designator
              </div>
              <div className="drawer__field-value">{object.intlDesignator}</div>
            </div>
          )}

          {/* Orbit Region */}
          <div className="drawer__field">
            <div className="drawer__field-label">Orbit Region</div>
            <div className="drawer__field-value">
              {REGION_LABELS[object.orbitRegion] || object.orbitRegion} (
              {object.orbitRegion})
            </div>
          </div>

          {/* Altitude */}
          {(object.perigeeKm || object.apogeeKm) && (
            <div className="drawer__field">
              <div className="drawer__field-label">Altitude Range</div>
              <div className="drawer__field-value">
                {object.perigeeKm != null
                  ? `${formatNumber(Math.round(object.perigeeKm))} km`
                  : "—"}{" "}
                –{" "}
                {object.apogeeKm != null
                  ? `${formatNumber(Math.round(object.apogeeKm))} km`
                  : "—"}
              </div>
            </div>
          )}

          {/* Inclination */}
          {object.inclinationDeg != null && (
            <div className="drawer__field">
              <div className="drawer__field-label">Inclination</div>
              <div className="drawer__field-value">
                {object.inclinationDeg.toFixed(1)}°
              </div>
            </div>
          )}

          {/* Period */}
          {object.periodMin != null && (
            <div className="drawer__field">
              <div className="drawer__field-label">Orbital Period</div>
              <div className="drawer__field-value">
                {object.periodMin.toFixed(1)} minutes
              </div>
            </div>
          )}

          {/* Launch Date */}
          {object.launchDate && (
            <div className="drawer__field">
              <div className="drawer__field-label">Launch Date</div>
              <div className="drawer__field-value">
                {new Date(object.launchDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )}

          {/* Operator */}
          {object.operator && (
            <div className="drawer__field">
              <div className="drawer__field-label">Operator / Owner</div>
              <div className="drawer__field-value">{object.operator}</div>
            </div>
          )}

          {/* Launch Site */}
          {object.launchSite && (
            <div className="drawer__field">
              <div className="drawer__field-label">Launch Site</div>
              <div className="drawer__field-value">{object.launchSite}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
