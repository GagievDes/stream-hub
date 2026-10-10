"use client";

import { useLayoutEffect } from "react";
import { applyTheme, readTheme } from "@/lib/theme";

/** Restores the saved design before the browser paints the hydrated page. */
export function ThemeBoot() {
  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, []);
  return null;
}
