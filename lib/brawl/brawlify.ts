import "server-only";
import brawlersJson from "./data/brawlers.json";
import mapsJson from "./data/maps.json";

export type Brawler = {
  id: number;
  name: string;
  className: string;
  rarity: string;
  imageUrl: string;
};

export type GameMap = {
  id: number;
  name: string;
  mode: string;
  imageUrl: string;
};

const DRAFT_MODES = new Set([
  "Gem Grab",
  "Brawl Ball",
  "Heist",
  "Bounty",
  "Hot Zone",
  "Knockout",
  "Brawl Hockey",
  "Wipeout",
]);

let _brawlers: Brawler[] | null = null;
let _maps: GameMap[] | null = null;
let _byName: Map<string, Brawler> | null = null;
let _byId: Map<number, GameMap> | null = null;

export function loadBrawlers(): Brawler[] {
  if (_brawlers) return _brawlers;
  const list = (brawlersJson as { list: any[] }).list;
  _brawlers = list
    .filter((b) => b.released !== false)
    .map((b) => ({
      id: b.id as number,
      name: b.name as string,
      className: (b.class?.name as string) || "Unknown",
      rarity: (b.rarity?.name as string) || "Unknown",
      imageUrl: (b.imageUrl2 as string) || (b.imageUrl as string) || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return _brawlers;
}

export function loadMaps(): GameMap[] {
  if (_maps) return _maps;
  const list = (mapsJson as { list: any[] }).list;
  _maps = list
    .filter((m) => !m.disabled)
    .map((m) => ({
      id: m.id as number,
      name: m.name as string,
      mode: (m.gameMode?.name as string) || "",
      imageUrl: (m.imageUrl as string) || "",
    }))
    .filter((m) => DRAFT_MODES.has(m.mode))
    .sort((a, b) => (a.mode === b.mode ? a.name.localeCompare(b.name) : a.mode.localeCompare(b.mode)));
  return _maps;
}

export function brawlerByName(name: string | null | undefined): Brawler | null {
  if (!name) return null;
  if (!_byName) {
    _byName = new Map(loadBrawlers().map((b) => [b.name.toLowerCase(), b]));
  }
  return _byName.get(name.toLowerCase()) || null;
}

export function mapById(id: number): GameMap | null {
  if (!_byId) {
    _byId = new Map(loadMaps().map((m) => [m.id, m]));
  }
  return _byId.get(id) || null;
}
