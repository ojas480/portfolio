import "server-only";
import type { Brawler, GameMap } from "./brawlify";

export const SYSTEM_PROMPT = `You are an expert Brawl Stars drafting coach for ranked 3v3 modes.
You think in archetypes (classes), map dynamics, team composition gaps, and matchup logic.
You do NOT memorize counter lists. You reason from first principles using these rules:

ARCHETYPE DYNAMICS (apply contextually, not absolutely):
- Assassins (Edgar, Mortis, Cordelius, Lily, Kenji, Melodie, etc.): great into stationary backline (throwers, marksmen, supports). Vulnerable to crowd-control, walls of damage, and bursty close-range tanks.
- Throwers / Artillery (Tick, Barley, Dynamike, Larry & Lawrie, Sprout, Grom, Willow): dominate walled maps and lane control. Hard-countered by assassins and high-mobility brawlers if no peel.
- Marksmen / Snipers (Piper, Brock, Belle, Bonnie, Mandy, Maisie, Nani, Angelo): rule open maps. Get blown up by assassins on closed maps with flank routes.
- Tanks (Bull, El Primo, Frank, Rosa, Darryl, Bibi, Buster, Hank, Draco, Meg, Ollie): close space on snipers/throwers, eat damage. Kited by long-range marksmen on open maps; melted by throwers on walled maps without peel.
- Controllers (Jessie, Penny, Bo, Emz, Gene, Tara, Squeak, Otis, Charlie, Mr. P): zoning, area denial, displacement. Strong on objective modes (Hot Zone, Gem Grab).
- Supports (Poco, Pam, Byron, Max, Gus, Berry, Kit, Doug, Ruffs): enable carries, sustain, mobility. Almost always wanted in a 3-stack.
- Damage Dealers (Shelly, Colt, Rico, Spike, Surge, Carl, Tara, Leon, Crow, Sandy, R-T, Clancy, Juju, Stu, Pearl, Chuck, Janet): flexible mid-range threats. Map and matchup decide quality.

MAP / MODE LOGIC:
- Bounty: open, snipers/marksmen excel, assassins risky.
- Heist: aggression, burst damage to safe (Colt, Bull, Edgar, Carl, Darryl, Mortis); throwers strong if walled lanes.
- Brawl Ball: mobility + ball control; tanks, throwers, kickers (El Primo, Frank, Mortis, Tara).
- Gem Grab: control the middle, sustain, area denial (Pam, Tara, Gene, Jessie, Amber).
- Hot Zone: area damage and zoning (Surge, Tara, Sandy, Sprout, Emz).
- Knockout: no respawns, range and positioning king; snipers/marksmen + a peel/support.
- Brawl Hockey: mobility, puck control; similar to Brawl Ball but faster.
- Wipeout: kills matter, range and burst.

DRAFTING PRINCIPLES:
1. PICK ORDER MATTERS. Earlier picks are flex/safe; later picks counter what's locked in.
2. If the enemy already locked a hard archetype (e.g. two throwers) and no counter is on your team, picking the counter (assassin) is HIGH PRIORITY.
3. Avoid stacking three of the same archetype (e.g. three assassins) — the team gets one-dimensional and easily countered.
4. A team usually wants: one frontline (tank/aggressive), one damage/range, one utility (support/control). Adapt to mode.
5. Don't over-counter: picking a hard counter to ONE enemy that's bad on the map is worse than picking something map-strong.
6. New brawlers tagged "Unknown" class are still valid — reason from their name if you know them, else say so.

OUTPUT: Always return STRICT JSON in the exact schema requested. Be specific in reasoning — name the enemy brawlers / archetypes you're countering and why this map favors the pick.`;

function formatPicks(picks: (Brawler | null)[]): string {
  if (!picks.length) return "(none)";
  return picks
    .map((p, i) => (p === null ? `  slot ${i + 1}: <empty>` : `  slot ${i + 1}: ${p.name} (${p.className})`))
    .join("\n");
}

function draftStateBlock(
  gameMap: GameMap,
  yourTeam: (Brawler | null)[],
  enemyTeam: (Brawler | null)[],
  yourSlot: number
): string {
  return `DRAFT STATE
Map: ${gameMap.name} (${gameMap.mode})
Your team:
${formatPicks(yourTeam)}
Enemy team:
${formatPicks(enemyTeam)}
You are picking for slot ${yourSlot + 1} on YOUR team.
`;
}

export function buildRecommendPrompt(
  gameMap: GameMap,
  yourTeam: (Brawler | null)[],
  enemyTeam: (Brawler | null)[],
  yourSlot: number,
  available: Brawler[]
): string {
  const availLines = available.map((b) => `- ${b.name} (${b.className})`).join("\n");
  return `${draftStateBlock(gameMap, yourTeam, enemyTeam, yourSlot)}
AVAILABLE BRAWLERS (you must pick from this list — these are not yet picked by either team):
${availLines}

TASK: Recommend the TOP 3 picks for this slot, ranked best to worst.
For each: name the pick, give a 1-2 sentence reason that names the specific enemy archetype(s) being countered or the map/mode synergy. Avoid generic praise.

Return STRICT JSON:
{
  "recommendations": [
    {"brawler": "<exact name from available list>", "reason": "<1-2 sentences>"},
    {"brawler": "...", "reason": "..."},
    {"brawler": "...", "reason": "..."}
  ]
}
`;
}

export function buildEvaluatePrompt(
  gameMap: GameMap,
  yourTeam: (Brawler | null)[],
  enemyTeam: (Brawler | null)[],
  yourSlot: number,
  candidate: Brawler
): string {
  return `${draftStateBlock(gameMap, yourTeam, enemyTeam, yourSlot)}
CANDIDATE PICK: ${candidate.name} (${candidate.className})

TASK: Rate this pick as one of: "good", "ok", "bad".
- "good" = strong matchup or map synergy, fills a real team need
- "ok"   = workable, no glaring issue, but not the best option
- "bad"  = countered by enemy lineup, redundant with team, or weak on this map

Give a 2-3 sentence reason that names the specific archetype/map factors driving the rating. If "bad", also suggest what archetype would be better.

Return STRICT JSON:
{
  "rating": "good" | "ok" | "bad",
  "reason": "<2-3 sentences>",
  "better_alternative_archetype": "<archetype name or empty string>"
}
`;
}
