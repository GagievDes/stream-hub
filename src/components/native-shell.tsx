"use client";

import { useEffect } from "react";

export function NativeShell() {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform() || cancelled) return;
        document.documentElement.classList.add("native-app");
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#070708" });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch {
        // Browser / Electron — ignore missing native plugins
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
