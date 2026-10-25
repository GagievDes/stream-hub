"use client";

import { useLayoutEffect, useState } from "react";
import { TV_CHANGE_EVENT, readTvFlag, resolveTvMode } from "@/lib/tv-mode";

export function useTvMode() {
  const [tv, setTv] = useState(false);

  useLayoutEffect(() => {
    const sync = () => {
      setTv(resolveTvMode(window.location.search, navigator.userAgent, readTvFlag()));
    };
    sync();
    window.addEventListener(TV_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TV_CHANGE_EVENT, sync);
  }, []);

  return tv;
}
