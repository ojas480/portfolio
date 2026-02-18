import "server-only";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
    "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL =
    "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const FETCH_TIMEOUT = 3000;

export interface SpotifyTrack {
    track: string;
    artist: string;
    url: string;
    isLive: boolean;
    playedAt?: string;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

async function getAccessToken(): Promise<string> {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: REFRESH_TOKEN,
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

// In-memory cache to avoid rate limits and ensure widget never disappears
let cachedTrack: SpotifyTrack | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function getNowPlaying(): Promise<SpotifyTrack | null> {
    // Return cached data if fresh enough
    if (cachedTrack && Date.now() - cacheTime < CACHE_TTL) {
        return cachedTrack;
    }

    try {
        const accessToken = await getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };

        // Try currently playing first
        const nowRes = await fetch(NOW_PLAYING_URL, {
            headers,
            signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });

        if (nowRes.ok && nowRes.status !== 204) {
            const data = await nowRes.json();
            if (data?.item) {
                const result: SpotifyTrack = {
                    track: data.item.name,
                    artist: data.item.artists
                        .map((a: { name: string }) => a.name)
                        .join(", "),
                    url: data.item.external_urls.spotify,
                    isLive: data.is_playing === true,
                };
                cachedTrack = result;
                cacheTime = Date.now();
                return result;
            }
        }

        // Nothing is currently playing — update cache if it was marked live
        if (cachedTrack?.isLive) {
            cachedTrack = { ...cachedTrack, isLive: false };
        }

        // Fall back to recently played
        const recentRes = await fetch(RECENTLY_PLAYED_URL, {
            headers,
            signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });

        if (recentRes.ok) {
            const data = await recentRes.json();
            const entry = data?.items?.[0];
            const item = entry?.track;
            if (item) {
                const result: SpotifyTrack = {
                    track: item.name,
                    artist: item.artists
                        .map((a: { name: string }) => a.name)
                        .join(", "),
                    url: item.external_urls.spotify,
                    isLive: false,
                    playedAt: entry.played_at ? timeAgo(entry.played_at) : undefined,
                };
                cachedTrack = result;
                cacheTime = Date.now();
                return result;
            }
        }

        // If Spotify returned no data but we have cache, use it
        return cachedTrack;
    } catch (err) {
        console.error("[Spotify]", err instanceof Error ? err.message : "Unknown error");
        // On error, return cached data instead of null
        return cachedTrack;
    }
}
