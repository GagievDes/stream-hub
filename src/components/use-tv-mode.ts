"use client";

import { useLayoutEffect, useState } from "react";
import { TV_CHANGE_EVENT, readTvFlag, readVidaaFlag, resolveTvMode } from "@/lib/tv-mode";

export function useTvMode() {
  const [tv, setTv] = useState(false);

  useLayoutEffect(() => {
    const sync = () => {
      setTv(
        resolveTvMode(
          window.location.search,
          navigator.userAgent,
          readTvFlag(),
          readVidaaFlag(),
        ),
      );
    };
    sync();
    window.addEventListener(TV_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TV_CHANGE_EVENT, sync);
  }, []);

  return tv;
}
