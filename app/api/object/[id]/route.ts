import { NextRequest, NextResponse } from "next/server";
import { getObjectById } from "@/lib/data/celestrak";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const object = await getObjectById(id);

    if (!object) {
      return NextResponse.json(
        { error: "Object not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(object);
  } catch (error) {
    console.error("Error in /api/object/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch object" },
      { status: 500 }
    );
  }
}
