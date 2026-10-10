"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  continueHref,
  continueSubtitle,
  readContinueList,
  type ContinueItem,
} from "@/lib/continue-watching";

function useContinue() {
  const [items, setItems] = useState<ContinueItem[]>([]);

  useEffect(() => {
    const load = () => setItems(readContinueList().slice(0, 1));
    load();
    window.addEventListener("strain-continue-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("strain-continue-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return items[0];
}

export function HomeScreen() {
  const latest = useContinue();
  const href = latest ? continueHref(latest) : "/tv";
  const title = latest?.title ?? "TV Series";
  const detail = latest
    ? continueSubtitle(latest)
    : "Find a show and jump to any episode";

  return (
    <main className="home">
      <Link href={href} className="home-stage">
        <span className="home-kicker">
          <span className="home-dot" aria-hidden="true" />
          {latest ? "Continue" : "Start"}
        </span>
        <span className="home-title">{title}</span>
        <span className="home-rule" aria-hidden="true" />
        <span className="home-detail">{detail}</span>
      </Link>
    </main>
  );
}
