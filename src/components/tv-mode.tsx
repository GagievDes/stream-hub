"use client";

import { Suspense, useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { applyTvMode, isTvBackKey } from "@/lib/tv-mode";

export function TvMode() {
  return (
    <Suspense fallback={null}>
      <TvModeInner />
    </Suspense>
  );
}

function TvModeInner() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useLayoutEffect(() => {
    applyTvMode(window.location.search, navigator.userAgent);
  }, [pathname, search]);

  useEffect(() => {
    let last = 0;

    function onKey(event: KeyboardEvent) {
      if (!document.documentElement.classList.contains("tv-mode")) return;
      if (!isTvBackKey(event)) return;
      const now = Date.now();
      if (now - last < 400) {
        event.preventDefault();
        return;
      }
      const path =
        pathname.length > 1 && pathname.endsWith("/")
          ? pathname.slice(0, -1)
          : pathname;
      if (path === "/" || path === "") return;
      last = now;
      event.preventDefault();
      window.history.back();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname]);

  return null;
}
