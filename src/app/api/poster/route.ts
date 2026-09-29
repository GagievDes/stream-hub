import { NextResponse } from "next/server";
import { TMDB_IMAGE_BASE } from "@/lib/tmdb";

const ALLOWED_SIZES = new Set(["w185", "w342", "w500", "w780", "original"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path")?.trim() ?? "";
  const size = searchParams.get("size")?.trim() || "w500";

  if (!path.startsWith("/") || path.includes("..") || path.includes("//")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  if (!ALLOWED_SIZES.has(size)) {
    return NextResponse.json({ error: "Invalid size" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${TMDB_IMAGE_BASE}/${size}${path}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Poster not found" },
        { status: upstream.status },
      );
    }

    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch poster" }, { status: 502 });
  }
}
