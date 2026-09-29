import Link from "next/link";
import { EMBED_SOURCES, getVidsrcEmbedUrl } from "@/lib/vidsrc";
import type { MediaType } from "@/lib/types";

type PlayerEmbedProps = {
  mediaType: MediaType;
  tmdbId: number;
  title: string;
  sourceId?: string;
  season?: number;
  episode?: number;
  /** Current page path without query, e.g. /tv/1405 */
  pathname: string;
};

export function PlayerEmbed({
  mediaType,
  tmdbId,
  title,
  sourceId = "vidsrc-io",
  season = 1,
  episode = 1,
  pathname,
}: PlayerEmbedProps) {
  const activeSource =
    EMBED_SOURCES.find((s) => s.id === sourceId)?.id ?? EMBED_SOURCES[0].id;

  const src =
    mediaType === "tv"
      ? getVidsrcEmbedUrl(mediaType, tmdbId, { season, episode }, activeSource)
      : getVidsrcEmbedUrl(mediaType, tmdbId, undefined, activeSource);

  function hrefFor(next: {
    source?: string;
    season?: number;
    episode?: number;
  }) {
    const params = new URLSearchParams();
    params.set("source", next.source ?? activeSource);
    if (mediaType === "tv") {
      params.set("s", String(next.season ?? season));
      params.set("e", String(next.episode ?? episode));
    }
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {EMBED_SOURCES.map((source) => {
            const active = source.id === activeSource;
            return (
              <Link
                key={source.id}
                href={hrefFor({ source: source.id })}
                className={
                  active
                    ? "rounded-md border border-[var(--accent)] bg-[var(--accent)]/15 px-3 py-1.5 text-xs font-medium text-[var(--accent)]"
                    : "rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                }
              >
                {source.label}
              </Link>
            );
          })}
        </div>

        {mediaType === "tv" ? (
          <form
            action={pathname}
            method="get"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <input type="hidden" name="source" value={activeSource} />
            <label className="flex items-center gap-1.5 text-[var(--muted)]">
              S
              <input
                type="number"
                name="s"
                min={1}
                defaultValue={season}
                className="h-9 w-16 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-[var(--fg)]"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[var(--muted)]">
              E
              <input
                type="number"
                name="e"
                min={1}
                defaultValue={episode}
                className="h-9 w-16 rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-[var(--fg)]"
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-xs text-[var(--fg)] transition-colors hover:border-[var(--accent)]"
            >
              Load episode
            </button>
          </form>
        ) : null}
      </div>

      <div className="player-shell relative w-full overflow-hidden bg-black">
        <iframe
          key={src}
          src={src}
          title={`${title} player`}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <p>
          If playback fails, try another source above
          {mediaType === "tv" ? " or change season/episode" : ""}.
        </p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Open source in new tab
        </a>
      </div>
    </div>
  );
}
