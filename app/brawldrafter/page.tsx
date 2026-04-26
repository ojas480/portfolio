"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "./brawl.css";

type Brawler = {
  id: number;
  name: string;
  className: string;
  rarity: string;
  imageUrl: string;
};

type GameMap = {
  id: number;
  name: string;
  mode: string;
  imageUrl: string;
};

type Recommendation = {
  brawler: string;
  reason: string;
  imageUrl: string | null;
  className: string | null;
};

type Evaluation = {
  rating: "good" | "ok" | "bad";
  reason: string;
  betterAlternativeArchetype: string;
};

type PickerTarget = { side: "you" | "enemy"; index: number } | null;

const LS_OWNED = "bda.ownedBrawlerIds";
const LS_FILTER = "bda.filterToOwned";

export default function BrawlDrafterPage() {
  const [brawlers, setBrawlers] = useState<Brawler[]>([]);
  const [maps, setMaps] = useState<GameMap[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const [mapSearch, setMapSearch] = useState("");

  const [yourTeam, setYourTeam] = useState<(Brawler | null)[]>([null, null, null]);
  const [enemyTeam, setEnemyTeam] = useState<(Brawler | null)[]>([null, null, null]);
  const [yourSlot, setYourSlot] = useState(0);

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [ownedIds, setOwnedIds] = useState<Set<number>>(new Set());
  const [filterToOwned, setFilterToOwned] = useState(false);

  const [status, setStatus] = useState("");
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [evalResult, setEvalResult] = useState<{ candidate: Brawler; data: Evaluation } | null>(null);
  const [busy, setBusy] = useState(false);

  const hydratedRef = useRef(false);

  // Initial load: fetch brawlers + maps
  useEffect(() => {
    fetch("/api/brawl/data")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { brawlers: Brawler[]; maps: GameMap[] }) => {
        setBrawlers(d.brawlers);
        setMaps(d.maps);
        const modes = Array.from(new Set(d.maps.map((m) => m.mode))).sort();
        if (modes.length > 0) setSelectedMode(modes[0]);
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  // Hydrate localStorage once brawlers are loaded
  useEffect(() => {
    if (hydratedRef.current || brawlers.length === 0) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(LS_OWNED);
      if (raw) {
        const ids: unknown = JSON.parse(raw);
        if (Array.isArray(ids)) {
          setOwnedIds(new Set(ids.filter((x): x is number => typeof x === "number")));
        }
      } else {
        // First run: default to all owned
        setOwnedIds(new Set(brawlers.map((b) => b.id)));
        localStorage.setItem(LS_OWNED, JSON.stringify(brawlers.map((b) => b.id)));
      }
      setFilterToOwned(localStorage.getItem(LS_FILTER) === "1");
    } catch {
      setOwnedIds(new Set(brawlers.map((b) => b.id)));
    }
  }, [brawlers]);

  const mapsByMode = useMemo(() => {
    const acc: Record<string, GameMap[]> = {};
    for (const m of maps) (acc[m.mode] ||= []).push(m);
    return acc;
  }, [maps]);

  const modeOptions = useMemo(() => Object.keys(mapsByMode).sort(), [mapsByMode]);

  const filteredMaps = useMemo(() => {
    const all = mapsByMode[selectedMode] || [];
    const q = mapSearch.trim().toLowerCase();
    return q ? all.filter((m) => m.name.toLowerCase().includes(q)) : all;
  }, [mapsByMode, selectedMode, mapSearch]);

  // Keep selected map valid when mode/filter changes
  useEffect(() => {
    if (filteredMaps.length === 0) {
      setSelectedMapId(null);
      return;
    }
    const stillThere = filteredMaps.some((m) => m.id === selectedMapId);
    if (!stillThere) setSelectedMapId(filteredMaps[0].id);
  }, [filteredMaps, selectedMapId]);

  const brawlersByName = useMemo(() => {
    const m = new Map<string, Brawler>();
    for (const b of brawlers) m.set(b.name.toLowerCase(), b);
    return m;
  }, [brawlers]);

  const selectedMap = maps.find((m) => m.id === selectedMapId) || null;

  const persistOwned = (next: Set<number>) => {
    setOwnedIds(next);
    localStorage.setItem(LS_OWNED, JSON.stringify([...next]));
  };

  const openPicker = (target: NonNullable<PickerTarget>) => {
    setPickerTarget(target);
    setPickerSearch("");
  };

  const closePicker = () => setPickerTarget(null);

  const assignSlot = (brawler: Brawler | null) => {
    if (!pickerTarget) return;
    const setter = pickerTarget.side === "you" ? setYourTeam : setEnemyTeam;
    setter((prev) => prev.map((b, i) => (i === pickerTarget.index ? brawler : b)));
    closePicker();
  };

  const buildPayload = () => ({
    map_id: selectedMapId,
    your_team: yourTeam.map((b) => b?.name ?? null),
    enemy_team: enemyTeam.map((b) => b?.name ?? null),
    your_slot: yourSlot,
    ...(filterToOwned
      ? { owned_brawlers: brawlers.filter((b) => ownedIds.has(b.id)).map((b) => b.name) }
      : {}),
  });

  const doRecommend = async () => {
    if (yourTeam[yourSlot] !== null) {
      setStatus("Clear your marked slot first — recommend is for an empty slot.");
      return;
    }
    if (selectedMapId === null) {
      setStatus("Pick a map first.");
      return;
    }
    setStatus("Thinking...");
    setBusy(true);
    setEvalResult(null);
    try {
      const r = await fetch("/api/brawl/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || `HTTP ${r.status}`);
      setRecs(data.recommendations as Recommendation[]);
      setStatus("");
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
      setRecs(null);
    } finally {
      setBusy(false);
    }
  };

  const doEvaluate = async () => {
    const candidate = yourTeam[yourSlot];
    if (!candidate) {
      setStatus("Pick a brawler in your marked slot first to evaluate it.");
      return;
    }
    if (selectedMapId === null) {
      setStatus("Pick a map first.");
      return;
    }
    setStatus("Evaluating...");
    setBusy(true);
    setRecs(null);
    try {
      const r = await fetch("/api/brawl/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), candidate: candidate.name }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || `HTTP ${r.status}`);
      setEvalResult({ candidate, data: data as Evaluation });
      setStatus("");
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
      setEvalResult(null);
    } finally {
      setBusy(false);
    }
  };

  const clearAll = () => {
    setYourTeam([null, null, null]);
    setEnemyTeam([null, null, null]);
    setYourSlot(0);
    setRecs(null);
    setEvalResult(null);
    setStatus("");
  };

  const toggleOwned = (id: number) => {
    const next = new Set(ownedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistOwned(next);
  };

  const taken = useMemo(() => {
    const s = new Set<number>();
    for (const b of [...yourTeam, ...enemyTeam]) if (b) s.add(b.id);
    return s;
  }, [yourTeam, enemyTeam]);

  if (loadError) {
    return (
      <div className="brawl-app">
        <main>
          <p>Failed to load: {loadError}</p>
          <Link href="/" className="back-link">← back to portfolio</Link>
        </main>
      </div>
    );
  }

  if (brawlers.length === 0 || maps.length === 0) {
    return (
      <div className="brawl-app">
        <main>
          <p>Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="brawl-app">
      <header>
        <div>
          <h1>Brawl Drafting AI</h1>
          <p className="sub">Pick the map, fill in what&apos;s locked, get a recommendation or rate your pick.</p>
        </div>
        <Link href="/" className="back-link">← back to portfolio</Link>
      </header>

      <main>
        <section className="map-row">
          <label>
            Mode
            <select value={selectedMode} onChange={(e) => setSelectedMode(e.target.value)}>
              {modeOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="map-pair">
            <div style={{ display: "flex", flexDirection: "column" }}>
              Map
              <input
                type="text"
                className="map-search"
                placeholder="Type to filter..."
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
            <select
              value={selectedMapId ?? ""}
              onChange={(e) => setSelectedMapId(parseInt(e.target.value, 10))}
            >
              {filteredMaps.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </label>
          {selectedMap && (
            <img className="map-image" src={selectedMap.imageUrl} alt={selectedMap.name} />
          )}
        </section>

        <section className="teams">
          <TeamPanel
            label="Your Team"
            sideClass="team-you"
            team={yourTeam}
            ownerSide="you"
            yourSlot={yourSlot}
            onSlotClick={(i) => openPicker({ side: "you", index: i })}
            onMarkSlot={(i) => setYourSlot(i)}
          />
          <TeamPanel
            label="Enemy Team"
            sideClass="team-enemy"
            team={enemyTeam}
            ownerSide="enemy"
            yourSlot={null}
            onSlotClick={(i) => openPicker({ side: "enemy", index: i })}
            onMarkSlot={() => {}}
          />
        </section>

        <section className="actions">
          <button className="primary" onClick={doRecommend} disabled={busy}>
            Recommend best for my slot
          </button>
          <button onClick={doEvaluate} disabled={busy}>Evaluate my pick</button>
          <button onClick={clearAll}>Clear all</button>
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={filterToOwned}
              onChange={(e) => {
                setFilterToOwned(e.target.checked);
                localStorage.setItem(LS_FILTER, e.target.checked ? "1" : "0");
              }}
            />
            Only recommend brawlers I own
          </label>
          <button className="ghost" onClick={() => setCollectionOpen(true)}>
            My brawlers ({ownedIds.size})
          </button>
          <span className="status">{status}</span>
        </section>

        <section className="results" style={{ display: recs || evalResult ? "block" : "none" }}>
          {recs && (
            <div className="rec-grid">
              {recs.map((r, i) => {
                const b = brawlersByName.get(r.brawler.toLowerCase());
                const img = r.imageUrl || b?.imageUrl || "";
                const cls = r.className || b?.className || "";
                return (
                  <div key={i} className={`rec-card rank-${i + 1}`}>
                    {img && <img src={img} alt={r.brawler} />}
                    <div className="rec-body">
                      <h4>#{i + 1} {r.brawler}</h4>
                      <div className="class">{cls}</div>
                      <div className="reason">{r.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {evalResult && (
            <div className="eval-card">
              <div className={`eval-rating ${evalResult.data.rating}`}>{evalResult.data.rating}</div>
              <div className="eval-body">
                <p><strong>{evalResult.candidate.name}</strong> ({evalResult.candidate.className})</p>
                <p>{evalResult.data.reason}</p>
                {evalResult.data.betterAlternativeArchetype && (
                  <p className="alt">
                    Consider an archetype like: <strong>{evalResult.data.betterAlternativeArchetype}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {pickerTarget && (
        <BrawlerPicker
          target={pickerTarget}
          brawlers={brawlers}
          taken={taken}
          currentInSlot={
            (pickerTarget.side === "you" ? yourTeam : enemyTeam)[pickerTarget.index]
          }
          search={pickerSearch}
          onSearchChange={setPickerSearch}
          onPick={assignSlot}
          onClose={closePicker}
        />
      )}

      {collectionOpen && (
        <CollectionEditor
          brawlers={brawlers}
          ownedIds={ownedIds}
          search={collectionSearch}
          onSearchChange={setCollectionSearch}
          onToggle={toggleOwned}
          onSelectAll={() => persistOwned(new Set(brawlers.map((b) => b.id)))}
          onSelectNone={() => persistOwned(new Set())}
          onClose={() => setCollectionOpen(false)}
        />
      )}
    </div>
  );
}

function TeamPanel({
  label,
  sideClass,
  team,
  ownerSide,
  yourSlot,
  onSlotClick,
  onMarkSlot,
}: {
  label: string;
  sideClass: string;
  team: (Brawler | null)[];
  ownerSide: "you" | "enemy";
  yourSlot: number | null;
  onSlotClick: (i: number) => void;
  onMarkSlot: (i: number) => void;
}) {
  return (
    <div className={`team ${sideClass}`}>
      <h2>{label}</h2>
      <div className="slots">
        {team.map((b, i) => {
          const isMarker = ownerSide === "you" && i === yourSlot;
          return (
            <div key={i} className={`slot ${isMarker ? "is-you-marker" : ""}`}>
              <div className="slot-portrait" onClick={() => onSlotClick(i)}>
                {b ? <img src={b.imageUrl} alt={b.name} /> : <span className="placeholder">+</span>}
              </div>
              <div className="slot-name">{b ? b.name : "—"}</div>
              <div className="slot-class">{b ? b.className : ""}</div>
              {ownerSide === "you" && (
                <label className="slot-marker">
                  <input
                    type="radio"
                    name="yourSlot"
                    checked={isMarker}
                    onChange={() => onMarkSlot(i)}
                  />
                  my slot
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrawlerPicker({
  target,
  brawlers,
  taken,
  currentInSlot,
  search,
  onSearchChange,
  onPick,
  onClose,
}: {
  target: NonNullable<PickerTarget>;
  brawlers: Brawler[];
  taken: Set<number>;
  currentInSlot: Brawler | null;
  search: string;
  onSearchChange: (v: string) => void;
  onPick: (b: Brawler | null) => void;
  onClose: () => void;
}) {
  const q = search.trim().toLowerCase();
  const filtered = q ? brawlers.filter((b) => b.name.toLowerCase().includes(q)) : brawlers;
  const effectiveTaken = new Set(taken);
  if (currentInSlot) effectiveTaken.delete(currentInSlot.id);

  return (
    <div className="picker" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="picker-inner">
        <div className="picker-header">
          <h3>Pick for {target.side === "you" ? "your" : "enemy"} slot {target.index + 1}</h3>
          <input
            type="text"
            placeholder="Search brawlers..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="picker-grid">
          {currentInSlot && (
            <div className="picker-cell" onClick={() => onPick(null)}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1a1d2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#e26d6d", fontSize: 28 }}>×</div>
              <div className="name">Clear</div>
            </div>
          )}
          {filtered.map((b) => {
            const isTaken = effectiveTaken.has(b.id);
            return (
              <div
                key={b.id}
                className={`picker-cell ${isTaken ? "taken" : ""}`}
                onClick={() => !isTaken && onPick(b)}
              >
                <img src={b.imageUrl} alt={b.name} loading="lazy" />
                <div className="name">{b.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CollectionEditor({
  brawlers,
  ownedIds,
  search,
  onSearchChange,
  onToggle,
  onSelectAll,
  onSelectNone,
  onClose,
}: {
  brawlers: Brawler[];
  ownedIds: Set<number>;
  search: string;
  onSearchChange: (v: string) => void;
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onClose: () => void;
}) {
  const q = search.trim().toLowerCase();
  const filtered = q ? brawlers.filter((b) => b.name.toLowerCase().includes(q)) : brawlers;

  return (
    <div className="picker" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="picker-inner">
        <div className="picker-header">
          <h3>My brawlers — click to toggle ownership</h3>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button onClick={onSelectAll}>All</button>
          <button onClick={onSelectNone}>None</button>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="picker-grid">
          {filtered.map((b) => {
            const owned = ownedIds.has(b.id);
            return (
              <div
                key={b.id}
                className={`picker-cell ${owned ? "owned" : "unowned"}`}
                onClick={() => onToggle(b.id)}
              >
                <img src={b.imageUrl} alt={b.name} loading="lazy" />
                <div className="name">{b.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
