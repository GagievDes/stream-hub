"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LivePlayer } from "@/components/live-player";
import {
  LIVE_CATEGORIES,
  LIVE_CHANNELS,
  liveChannelById,
  type LiveChannel,
} from "@/lib/live-channels";
import { cn } from "@/lib/utils";

export function LiveTvPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected =
    liveChannelById(searchParams.get("channel")) ?? LIVE_CHANNELS[0];
  const categoryLabel =
    LIVE_CATEGORIES.find((category) => category.id === selected.category)?.label ??
    "Live";

  const grouped = useMemo(
    () =>
      LIVE_CATEGORIES.map((category) => ({
        ...category,
        channels: LIVE_CHANNELS.filter((channel) => channel.category === category.id),
      })),
    [],
  );

  function selectChannel(channel: LiveChannel) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("channel", channel.id);
    router.replace(`/live?${params.toString()}`, { scroll: false });
  }

  return (
    <main className="live-page mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:py-10">
      <div className="live-intro mb-8 max-w-2xl">
        <p className="live-kicker mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          {categoryLabel}
        </p>
        <h1 className="live-heading font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--fg)] sm:text-5xl">
          {selected.name}
        </h1>
        <p className="mt-3 text-[var(--muted)]">{selected.description}</p>
      </div>

      <div className="live-layout grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="live-guide rounded-md border border-[var(--line)] bg-[var(--surface)]">
          {grouped.map((category) => (
            <section key={category.id} className="live-category border-b border-[var(--line)] last:border-b-0">
              <h2 className="live-cat px-3 pt-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {category.label}
              </h2>
              <ul className="live-channel-list px-2 py-2">
                {category.channels.map((channel) => {
                  const active = channel.id === selected.id;
                  return (
                    <li key={channel.id}>
                      <button
                        type="button"
                        data-active={active ? "true" : "false"}
                        onClick={() => selectChannel(channel)}
                        className={cn(
                          "live-channel mb-1 flex w-full items-baseline justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "text-[var(--fg)] hover:bg-[var(--surface-2)]",
                        )}
                      >
                        <span className="font-medium">{channel.name}</span>
                        <span className="live-region shrink-0 text-xs text-[var(--muted)]">
                          {channel.region}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
        <div className="live-stage">
          <LivePlayer key={selected.id} channel={selected} />
        </div>
      </div>
    </main>
  );
}
