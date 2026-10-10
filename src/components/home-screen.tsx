"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  continueHref,
  continueSubtitle,
  readContinueList,
  type ContinueItem,
} from "@/lib/continue-watching";
import { watchHref } from "@/lib/paths";
import { backdropUrl, getCatalog, getDetails, posterUrl } from "@/lib/tmdb";

type Stage = {
  href: string;
  kicker: string;
  title: string;
  detail: string;
  overview: string;
  backdrop: string | null;
  poster: string | null;
};

const EMPTY_STAGE: Stage = {
  href: "/tv",
  kicker: "Start",
  title: "TV Series",
  detail: "Find a show and jump to any episode",
  overview: "",
  backdrop: null,
  poster: null,
};

function useContinue() {
  const [latest, setLatest] = useState<ContinueItem | null | undefined>(undefined);

  useEffect(() => {
    const load = () => setLatest(readContinueList()[0] ?? null);
    load();
    window.addEventListener("strain-continue-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("strain-continue-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return latest;
}

export function HomeScreen() {
  const latest = useContinue();
  const [stage, setStage] = useState<Stage>(EMPTY_STAGE);

  useEffect(() => {
    if (latest === undefined) return;
    let cancelled = false;

    async function paint() {
      if (latest) {
        const poster = posterUrl(latest.posterPath, "w500");
        if (!cancelled) {
          setStage({
            href: continueHref(latest),
            kicker: "Continue",
            title: latest.title,
            detail: continueSubtitle(latest),
            overview: "",
            backdrop: null,
            poster,
          });
        }
        const details = await getDetails(latest.mediaType, latest.id);
        if (cancelled || !details) return;
        setStage({
          href: continueHref(latest),
          kicker: "Continue",
          title: latest.title,
          detail: continueSubtitle(latest),
          overview: details.overview,
          backdrop: backdropUrl(details.backdropPath, "w1280"),
          poster: posterUrl(details.posterPath ?? latest.posterPath, "w500"),
        });
        return;
      }

      const trending = await getCatalog("tv", "trending").catch(() => []);
      const pick = trending.find((item) => item.backdropPath) ?? trending[0];
      if (cancelled) return;
      if (!pick) {
        setStage(EMPTY_STAGE);
        return;
      }
      setStage({
        href: watchHref(pick.mediaType, pick.id),
        kicker: "Suggested",
        title: pick.title,
        detail: "A series people are watching this week",
        overview: pick.overview,
        backdrop: backdropUrl(pick.backdropPath, "w1280"),
        poster: posterUrl(pick.posterPath, "w500"),
      });
    }

    void paint();
    return () => {
      cancelled = true;
    };
  }, [latest]);

  return (
    <main className="home">
      <Link href={stage.href} className="home-stage">
        {stage.backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="home-art" src={stage.backdrop} alt="" />
        ) : stage.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="home-art home-art-poster" src={stage.poster} alt="" />
        ) : null}
        <span className="home-scrim" aria-hidden="true" />
        {stage.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="home-poster" src={stage.poster} alt="" />
        ) : null}
        <span className="home-copy">
          <span className="home-kicker">
            <span className="home-dot" aria-hidden="true" />
            {stage.kicker}
          </span>
          <span className="home-title">{stage.title}</span>
          <span className="home-rule" aria-hidden="true" />
          <span className="home-detail">{stage.detail}</span>
          {stage.overview ? <span className="home-overview">{stage.overview}</span> : null}
        </span>
      </Link>
    </main>
  );
}
