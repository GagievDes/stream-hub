"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  continueHref,
  continueSubtitle,
  readContinueList,
  type ContinueItem,
} from "@/lib/continue-watching";

const ENTRIES = [
  {
    href: "/movies",
    index: "01",
    title: "Movies",
    text: "Browse and watch films by name",
  },
  {
    href: "/tv",
    index: "02",
    title: "TV Series",
    text: "Find a show and jump to any episode",
  },
  {
    href: "/live",
    index: "03",
    title: "Live TV",
    text: "Public channels, sorted by category",
  },
] as const;

function useContinue() {
  const [items, setItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    const load = () => setItems(readContinueList().slice(0, 5));
    load();
    window.addEventListener("strain-continue-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("strain-continue-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return items;
}

export function HomeScreen() {
  const items = useContinue();
  const latest = items[0];
  const featuredHref = latest ? continueHref(latest) : "/tv";
  const featuredTitle = latest?.title ?? "TV Series";
  const featuredDetail = latest
    ? continueSubtitle(latest)
    : "Find a show and jump to any episode";

  return (
    <>
      <main className="home-ink">
        <nav className="home-ink-list">
          {ENTRIES.map((entry) => (
            <Link key={entry.href} href={entry.href} className="home-ink-row">
              <span>
                <span className="home-ink-title">{entry.title}</span>
                <span className="home-ink-text">{entry.text}</span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
        {items.length > 0 ? (
          <section className="home-ink-continue">
            <div className="home-ink-continue-head">
              <span>Continue</span>
              <span>{items.length} titles</span>
            </div>
            <div className="home-ink-posters">
              {items.map((item) => (
                <Link key={`${item.mediaType}-${item.id}`} href={continueHref(item)} className="home-ink-poster">
                  <span>
                    {item.title}
                    <br />
                    {continueSubtitle(item)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <main className="home-editorial">
        <div className="home-editorial-trio">
          {ENTRIES.map((entry) => (
            <Link key={entry.href} href={entry.href} className="home-editorial-col">
              <span className="home-editorial-num">{entry.index}</span>
              <span className="home-editorial-title">{entry.title}</span>
              <span className="home-editorial-text">{entry.text}</span>
            </Link>
          ))}
        </div>
        <Link href={featuredHref} className="home-editorial-feature">
          <span>Continue</span>
          <strong>
            {featuredTitle}
            {latest ? ` · ${featuredDetail}` : ""}
          </strong>
          <span>Open</span>
        </Link>
      </main>

      <main className="home-glass">
        <Link href={featuredHref} className="home-glass-frame">
          <span className="home-glass-kicker">{latest ? "Continue" : "Start"}</span>
          <span className="home-glass-title">{featuredTitle}</span>
          <span className="home-glass-detail">{featuredDetail}</span>
        </Link>
      </main>
    </>
  );
}
