import { NextResponse } from "next/server";
import { getOrbitalData } from "@/lib/data/celestrak";

export const revalidate = 7200; // 2 hours

export async function GET() {
  try {
    const { counts } = await getOrbitalData();
    return NextResponse.json(counts, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error in /api/counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch orbital data" },
      { status: 500 }
    );
  }
}
