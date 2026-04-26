import { NextResponse } from "next/server";
import { loadBrawlers, loadMaps } from "@/lib/brawl/brawlify";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    brawlers: loadBrawlers(),
    maps: loadMaps(),
  });
}
