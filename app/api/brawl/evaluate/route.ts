import { NextRequest, NextResponse } from "next/server";
import { brawlerByName, mapById } from "@/lib/brawl/brawlify";
import { generateJson, TimeoutError } from "@/lib/brawl/gemini";
import { buildEvaluatePrompt } from "@/lib/brawl/prompts";

export const runtime = "nodejs";
export const maxDuration = 15;

type Body = {
  map_id: number;
  your_team: (string | null)[];
  enemy_team: (string | null)[];
  your_slot: number;
  candidate: string;
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
  const candidate = brawlerByName(body.candidate);
  if (!candidate)
    return NextResponse.json({ detail: `Unknown brawler: ${body.candidate}` }, { status: 404 });

  const prompt = buildEvaluatePrompt(gameMap, yourTeam, enemyTeam, body.your_slot, candidate);

  try {
    const data = (await generateJson(prompt)) as {
      rating?: string;
      reason?: string;
      better_alternative_archetype?: string;
    };
    let rating = data.rating || "ok";
    if (rating !== "good" && rating !== "ok" && rating !== "bad") rating = "ok";
    return NextResponse.json({
      rating,
      reason: data.reason || "",
      betterAlternativeArchetype: data.better_alternative_archetype || "",
    });
  } catch (err) {
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
}
