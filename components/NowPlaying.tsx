import { getNowPlaying } from "@/lib/spotify";

export default async function NowPlaying() {
    const data = await getNowPlaying();

    if (!data) return null;

    return (
        <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 mt-3 group w-fit"
        >
            {data.isLive ? (
                <>
                    {/* Animated bars */}
                    <span className="flex items-end gap-[2px] h-3 w-3 shrink-0">
                        <span className="w-[2px] bg-[#1DB954] animate-bar-1 rounded-full" />
                        <span className="w-[2px] bg-[#1DB954] animate-bar-2 rounded-full" />
                        <span className="w-[2px] bg-[#1DB954] animate-bar-3 rounded-full" />
                    </span>

                    {/* Text */}
                    <span className="text-xs text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors truncate max-w-[360px]">
                        <span className="text-[#1DB954] font-medium">LIVE</span>
                        {" · "}
                        <span className="text-[var(--text)] font-medium">{data.track}</span>
                        <span className="text-[var(--text-dim)]"> — {data.artist}</span>
                    </span>
                </>
            ) : (
                <>
                    {/* Disc icon */}
                    <svg className="w-3 h-3 text-[var(--text-dim)] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>

                    {/* Text */}
                    <span className="text-xs text-[var(--text-dim)] group-hover:text-[var(--text)] transition-colors truncate max-w-[360px]">
                        Last played{data.playedAt ? ` ${data.playedAt}` : ""}{" · "}
                        <span className="text-[var(--text)] font-medium opacity-70">{data.track}</span>
                        <span className="text-[var(--text-dim)]"> — {data.artist}</span>
                    </span>
                </>
            )}
        </a>
    );
}
