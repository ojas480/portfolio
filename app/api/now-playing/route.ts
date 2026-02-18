import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
    "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL =
    "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function getAccessToken() {
    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: REFRESH_TOKEN,
        }),
    });
    const data = await res.json();
    return data.access_token as string;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        const accessToken = await getAccessToken();

        // Try currently playing first
        const nowRes = await fetch(NOW_PLAYING_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
            cache: "no-store",
        });

        if (nowRes.status === 200) {
            const data = await nowRes.json();
            if (data.is_playing && data.item) {
                return NextResponse.json({
                    isPlaying: true,
                    title: data.item.name,
                    artist: data.item.artists
                        .map((a: { name: string }) => a.name)
                        .join(", "),
                    albumArt: data.item.album.images?.[2]?.url || data.item.album.images?.[0]?.url,
                    songUrl: data.item.external_urls.spotify,
                });
            }
        }

        // Fall back to recently played (with retry on 429)
        const fetchRecent = async (): Promise<Response> => {
            const res = await fetch(RECENTLY_PLAYED_URL, {
                headers: { Authorization: `Bearer ${accessToken}` },
                cache: "no-store",
            });
            if (res.status === 429) {
                const retryAfter = Math.min(parseInt(res.headers.get("Retry-After") || "2", 10), 5);
                await new Promise((r) => setTimeout(r, retryAfter * 1000));
                return fetch(RECENTLY_PLAYED_URL, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    cache: "no-store",
                });
            }
            return res;
        };

        const recentRes = await fetchRecent();

        if (recentRes.status === 200) {
            const data = await recentRes.json();
            const track = data.items?.[0]?.track;
            const playedAt = data.items?.[0]?.played_at;
            if (track) {
                return NextResponse.json({
                    isPlaying: false,
                    title: track.name,
                    artist: track.artists
                        .map((a: { name: string }) => a.name)
                        .join(", "),
                    albumArt: track.album.images?.[2]?.url || track.album.images?.[0]?.url,
                    songUrl: track.external_urls.spotify,
                    playedAt: playedAt || null,
                });
            }
        }

        return NextResponse.json({ isPlaying: false, title: null });
    } catch {
        return NextResponse.json({ isPlaying: false, title: null });
    }
}
