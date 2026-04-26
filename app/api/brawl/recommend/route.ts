import { NextRequest, NextResponse } from "next/server";
import { brawlerByName, loadBrawlers, mapById } from "@/lib/brawl/brawlify";
import { generateJson, TimeoutError } from "@/lib/brawl/gemini";
import { buildRecommendPrompt } from "@/lib/brawl/prompts";

export const runtime = "nodejs";
export const maxDuration = 15;

type Body = {
  map_id: number;
  your_team: (string | null)[];
  enemy_team: (string | null)[];
  your_slot: number;
  owned_brawlers?: string[] | null;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const gameMap = mapById(body.map_id);
  if (!gameMap) return NextResponse.json({ detail: `Unknown map id: ${body.map_id}` }, { status: 404 });

  const yourTeam = body.your_team.map((n) => brawlerByName(n));
  const enemyTeam = body.enemy_team.map((n) => brawlerByName(n));

  if (body.your_slot < 0 || body.your_slot > 2)
    return NextResponse.json({ detail: "your_slot must be 0..2" }, { status: 400 });
  if (yourTeam[body.your_slot] !== null)
    return NextResponse.json({ detail: "Your slot is already filled" }, { status: 400 });

  const taken = new Set<number>();
  for (const b of [...yourTeam, ...enemyTeam]) if (b) taken.add(b.id);

  let available = loadBrawlers().filter((b) => !taken.has(b.id));

  if (body.owned_brawlers && body.owned_brawlers.length > 0) {
    const owned = new Set(body.owned_brawlers.map((n) => n.toLowerCase()));
    available = available.filter((b) => owned.has(b.name.toLowerCase()));
  }
  if (available.length === 0) {
    return NextResponse.json(
      { detail: "No brawlers available — your collection filter is too narrow." },
      { status: 400 }
    );
  }

  const prompt = buildRecommendPrompt(gameMap, yourTeam, enemyTeam, body.your_slot, available);

  try {
    const data = (await generateJson(prompt)) as {
      recommendations?: Array<{ brawler: string; reason: string }>;
    };
    const recs = (data.recommendations || []).map((r) => {
      const b = brawlerByName(r.brawler);
      return {
        brawler: r.brawler,
        reason: r.reason,
        imageUrl: b?.imageUrl ?? null,
        className: b?.className ?? null,
      };
    });
    return NextResponse.json({ recommendations: recs });
  } catch (err) {
    return aiErrorResponse(err);
  }
}

function aiErrorResponse(err: unknown): NextResponse {
  if (err instanceof TimeoutError)
    return NextResponse.json({ detail: "AI took longer than 10s — try again." }, { status: 504 });
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429"))
    return NextResponse.json(
      { detail: "Gemini quota hit. Try a different model or wait a minute." },
      { status: 429 }
    );
  return NextResponse.json({ detail: `AI error: ${msg.slice(0, 200)}` }, { status: 502 });
}
