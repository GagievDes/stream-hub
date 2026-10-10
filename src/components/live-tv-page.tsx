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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:py-10">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Live TV
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--fg)] sm:text-5xl">
          Free channels
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          Public news, science, and sports streams, grouped by category.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav className="rounded-md border border-[var(--line)] bg-[var(--surface)]">
          {grouped.map((category) => (
            <section key={category.id} className="border-b border-[var(--line)] last:border-b-0">
              <h2 className="px-3 pt-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                {category.label}
              </h2>
              <ul className="px-2 py-2">
                {category.channels.map((channel) => {
                  const active = channel.id === selected.id;
                  return (
                    <li key={channel.id}>
                      <button
                        type="button"
                        onClick={() => selectChannel(channel)}
                        className={cn(
                          "mb-1 flex w-full items-baseline justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : "text-[var(--fg)] hover:bg-[var(--surface-2)]",
                        )}
                      >
                        <span className="font-medium">{channel.name}</span>
                        <span className="shrink-0 text-xs text-[var(--muted)]">
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
        <LivePlayer key={selected.id} channel={selected} />
      </div>
    </main>
  );
}
