"use client";

import { useEffect, useState } from "react";

interface SpotifyData {
    isPlaying: boolean;
    title: string | null;
    artist?: string;
    albumArt?: string;
    songUrl?: string;
    playedAt?: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NowPlaying() {
    const [data, setData] = useState<SpotifyData | null>(null);

    useEffect(() => {
        const fetchNowPlaying = async () => {
            try {
                const res = await fetch("/api/now-playing");
                const json = await res.json();
                setData(json);
            } catch {
                setData(null);
            }
        };

        fetchNowPlaying();
        // Poll every 30 seconds
        const interval = setInterval(fetchNowPlaying, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!data || !data.title) return null;

    return (
        <a
            href={data.songUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 mt-3 group w-fit"
        >
            {data.isPlaying ? (
                <>
                    {/* Animated bars */}
                    <span className="flex items-end gap-[2px] h-3 w-3 shrink-0">
                        <span className="w-[2px] bg-[#1DB954] animate-bar-1 rounded-full" />
                        <span className="w-[2px] bg-[#1DB954] animate-bar-2 rounded-full" />
                        <span className="w-[2px] bg-[#1DB954] animate-bar-3 rounded-full" />
                    </span>

                    {/* Album art */}
                    {data.albumArt && (
                        <img src={data.albumArt} alt="" className="w-4 h-4 rounded-[2px]" />
                    )}

                    {/* Text */}
                    <span className="text-xs text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors truncate max-w-[320px]">
                        <span className="text-[#1DB954] font-medium">LIVE</span>
                        {" · "}
                        <span className="text-[var(--text)] font-medium">{data.title}</span>
                        {data.artist && (
                            <span className="text-[var(--text-dim)]"> — {data.artist}</span>
                        )}
                    </span>
                </>
            ) : (
                <>
                    {/* Disc icon */}
                    <svg className="w-3 h-3 text-[var(--text-dim)] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    {/* Album art */}
                    {data.albumArt && (
                        <img src={data.albumArt} alt="" className="w-4 h-4 rounded-[2px] opacity-60" />
                    )}

                    {/* Text */}
                    <span className="text-xs text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors truncate max-w-[360px]">
                        Last played{data.playedAt ? ` ${timeAgo(data.playedAt)}` : ""}{" · "}
                        <span className="text-[var(--text)] font-medium opacity-70">{data.title}</span>
                        {data.artist && (
                            <span className="text-[var(--text-dim)]"> — {data.artist}</span>
                        )}
                    </span>
                </>
            )}
        </a>
    );
}
