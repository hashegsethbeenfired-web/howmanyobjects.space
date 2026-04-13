import { ImageResponse } from "next/og";
import { getOrbitalData } from "@/lib/data/celestrak";

export const runtime = "nodejs";
export const revalidate = 7200;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  let totalCount = "10,000+";

  try {
    const { counts } = await getOrbitalData();
    totalCount = counts.totalCount.toLocaleString("en-US");
  } catch {
    // Use fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060a14 0%, #0c1220 50%, #0a1628 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Stars effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.15), transparent), radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.2), transparent)",
          }}
        />

        {/* Earth glow */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,58,92,0.4) 0%, rgba(10,22,40,0.2) 50%, transparent 70%)",
            bottom: -100,
            right: 100,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: "#94a3b8",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Right now, there are
          </span>

          <span
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: "#f0f2f5",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textShadow: "0 0 60px rgba(77, 166, 255, 0.3)",
            }}
          >
            {totalCount}
          </span>

          <span
            style={{
              fontSize: 28,
              color: "#94a3b8",
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            human-made objects orbiting Earth
          </span>
        </div>

        <span
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 16,
            color: "#64748b",
          }}
        >
          howmanyobjects.space
        </span>
      </div>
    ),
    { ...size }
  );
}
