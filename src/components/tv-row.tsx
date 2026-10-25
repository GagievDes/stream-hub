"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CachedPoster } from "@/components/cached-poster";
import { watchHref } from "@/lib/paths";
import { yearFromDate } from "@/lib/tmdb";
import type { MediaItem } from "@/lib/types";

export type TvCard = {
  key: string;
  href: string;
  title: string;
  posterPath: string | null;
  subtitle?: string;
  onRemove?: () => void;
};

export function mediaToTvCard(item: MediaItem): TvCard {
  const year = yearFromDate(item.releaseDate);
  const rating = item.voteAverage > 0 ? item.voteAverage.toFixed(1) : "";
  return {
    key: `${item.mediaType}-${item.id}`,
    href: watchHref(item.mediaType, item.id),
    title: item.title,
    posterPath: item.posterPath,
    subtitle: [year, rating].filter(Boolean).join(" · "),
  };
}

export function TvRow({ title, cards }: { title: string; cards: TvCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const unique = cards.filter(
    (card, index) => cards.findIndex((other) => other.key === card.key) === index,
  );
  const cardKey = unique.map((card) => card.key).join("|");

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();

    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth + 1) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      let delta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 56;
      else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= el.clientWidth * 0.85;
      else if (Math.abs(delta) > 0 && Math.abs(delta) < 16) delta *= 56;
      if (delta === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = Math.max(0, Math.min(max, el.scrollLeft + delta));
      if (next === el.scrollLeft) return;
      event.preventDefault();
      el.scrollLeft = next;
    };

    el.addEventListener("scroll", update, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      observer.disconnect();
    };
  }, [cardKey]);

  function scrollByDir(direction: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.round(el.clientWidth * 0.82));
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  if (unique.length === 0) return null;

  return (
    <section className="tv-row" aria-labelledby={titleId}>
      <h2 id={titleId} className="tv-row-title">
        {title}
      </h2>
      <div className="tv-row-frame">
        {canLeft ? (
          <button
            type="button"
            className="tv-row-arrow is-left"
            aria-label={`Scroll ${title} backward`}
            onClick={() => scrollByDir(-1)}
          >
            <span>
              <ChevronLeft aria-hidden="true" />
            </span>
          </button>
        ) : null}
        <div
          ref={scrollerRef}
          className="tv-row-scroller"
          role="list"
          aria-label={title}
        >
          {unique.map((card) => (
            <div key={card.key} className="tv-card-wrap" role="listitem">
              <Link href={card.href} className="tv-card">
                <span className="tv-card-poster">
                  {card.posterPath ? (
                    <CachedPoster posterPath={card.posterPath} alt="" size="w342" />
                  ) : (
                    <span className="tv-card-fallback" aria-hidden="true">
                      {card.title.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="tv-card-title">{card.title}</span>
                {card.subtitle ? (
                  <span className="tv-card-sub">{card.subtitle}</span>
                ) : null}
              </Link>
              {card.onRemove ? (
                <button
                  type="button"
                  className="tv-card-remove"
                  aria-label={`Remove ${card.title}`}
                  onClick={card.onRemove}
                >
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        {canRight ? (
          <button
            type="button"
            className="tv-row-arrow is-right"
            aria-label={`Scroll ${title} forward`}
            onClick={() => scrollByDir(1)}
          >
            <span>
              <ChevronRight aria-hidden="true" />
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function TvRowSkeleton() {
  return (
    <div className="tv-row" aria-hidden="true">
      <div className="tv-skel tv-skel-heading" />
      <div className="tv-row-scroller">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="tv-card-wrap">
            <div className="tv-skel tv-skel-poster" />
          </div>
        ))}
      </div>
    </div>
  );
}
