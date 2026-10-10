"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LivePlayer } from "@/components/live-player";
import {
  LIVE_CATEGORIES,
  LIVE_CHANNELS,
  liveChannelById,
  type LiveCategoryId,
  type LiveChannel,
} from "@/lib/live-channels";
import { cn } from "@/lib/utils";

export function LiveTvPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected =
    liveChannelById(searchParams.get("channel")) ?? LIVE_CHANNELS[0];
  const [openCategory, setOpenCategory] = useState<LiveCategoryId | null>(
    selected.category,
  );

  useEffect(() => {
    setOpenCategory(selected.category);
  }, [selected.category]);

  const grouped = useMemo(
    () =>
      LIVE_CATEGORIES.map((category) => ({
        ...category,
        channels: LIVE_CHANNELS.filter((channel) => channel.category === category.id),
      })).filter((category) => category.channels.length > 0),
    [],
  );

  function selectChannel(channel: LiveChannel) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("channel", channel.id);
    router.replace(`/live?${params.toString()}`, { scroll: false });
    setOpenCategory(channel.category);
  }

  function toggleCategory(id: LiveCategoryId) {
    setOpenCategory((current) => (current === id ? null : id));
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-8 sm:py-10">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Live TV
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-[var(--fg)] sm:text-5xl">
          {selected.name}
        </h1>
        <p className="mt-3 text-[var(--muted)]">{selected.description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex max-h-[50vh] flex-col overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] lg:h-0 lg:max-h-none lg:min-h-full">
          <div className="shrink-0 border-b border-[var(--line)] px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Channels
            </p>
          </div>
          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="divide-y divide-[var(--line)]">
              {grouped.map((category) => {
                const open = openCategory === category.id;
                return (
                  <div key={category.id}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm transition-colors hover:bg-[var(--surface-2)]",
                        open || selected.category === category.id
                          ? "text-[var(--fg)]"
                          : "text-[var(--muted)]",
                      )}
                    >
                      <span className="font-medium">
                        {category.label}
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                          {category.channels.length}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          open && "rotate-180 text-[var(--accent)]",
                        )}
                      />
                    </button>
                    {open ? (
                      <ul className="bg-[var(--bg)]/40 px-2 pb-2">
                        {category.channels.map((channel) => {
                          const active = channel.id === selected.id;
                          return (
                            <li key={channel.id}>
                              <button
                                type="button"
                                data-active={active ? "true" : "false"}
                                onClick={() => selectChannel(channel)}
                                className={cn(
                                  "mb-1 flex w-full items-baseline justify-between gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                                  active
                                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]",
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
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <LivePlayer key={selected.id} channel={selected} />
        </div>
      </div>
    </main>
  );
}
