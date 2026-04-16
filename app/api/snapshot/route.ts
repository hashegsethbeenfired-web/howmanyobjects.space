import { NextRequest, NextResponse } from "next/server";
import { getOrbitalSnapshot } from "@/lib/data/celestrak";
import { isAllowed } from "@/lib/rateLimit";

export const revalidate = 7200; // 2 hours — matches the SATCAT cache

/**
 * Lightweight balanced catalog sample (~600 objects) for the 3D hero.
 * Served from the Next.js data cache so repeat hits cost nothing.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!isAllowed(ip, 30, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const objects = await getOrbitalSnapshot(600);
    return NextResponse.json(
      { objects, total: objects.length },
      {
        headers: {
          // Edge + CDN cache. Clients get a fresh copy every 2h, stale served
          // instantly during revalidation.
          "Cache-Control":
            "public, s-maxage=7200, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/snapshot:", error);
    return NextResponse.json(
      { error: "Failed to build snapshot" },
      { status: 500 }
    );
  }
}
