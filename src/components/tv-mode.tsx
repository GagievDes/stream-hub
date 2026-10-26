"use client";

import { Suspense, useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  applyTvMode,
  isTvBackKey,
  isVidaaBackKey,
  vidaaMediaAction,
  type VidaaMediaAction,
} from "@/lib/tv-mode";

const TEXT_TYPES = new Set([
  "",
  "text",
  "search",
  "email",
  "url",
  "password",
  "tel",
  "number",
]);

export function TvMode() {
  return (
    <Suspense fallback={null}>
      <TvModeInner />
    </Suspense>
  );
}

function homePath(pathname: string) {
  const path =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return path === "/" || path === "";
}

function editingBackspace(event: KeyboardEvent) {
  if (event.keyCode !== 8 && event.key !== "Backspace") return false;
  const el = event.target instanceof HTMLElement ? event.target : document.activeElement;
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) return TEXT_TYPES.has(el.type);
  return false;
}

function exitVidaa() {
  const host = window as Window & { SmartTvA_API?: { exit?: () => void } };
  try {
    if (typeof host.SmartTvA_API?.exit === "function") {
      host.SmartTvA_API.exit();
      return;
    }
  } catch {
    // Fall through to window.close(), which a chromeless VIDAA app uses to leave.
  }
  window.close();
}

function leaveFullscreen() {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => void;
  };
  const active = document.fullscreenElement || doc.webkitFullscreenElement;
  if (!active) return false;
  if (document.exitFullscreen) void document.exitFullscreen();
  else doc.webkitExitFullscreen?.();
  return true;
}

function pressTransport(action: VidaaMediaAction) {
  const buttons = Array.from(
    document.querySelectorAll<HTMLElement>(
      "button[aria-label='Play'], button[aria-label='Pause'], button[aria-label='Play video']",
    ),
  );
  const play = buttons.find((button) => {
    const label = button.getAttribute("aria-label");
    return label === "Play" || label === "Play video";
  });
  const pause = buttons.find((button) => button.getAttribute("aria-label") === "Pause");
  const target = action === "pause" ? pause : action === "play" ? play : pause || play;
  if (!target) return false;
  target.click();
  return true;
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
      const vidaa = document.documentElement.classList.contains("vidaa-mode");

      if (vidaa) {
        const media = vidaaMediaAction(event);
        if (media) {
          if (event.repeat || pressTransport(media)) event.preventDefault();
          return;
        }
      }

      const back = vidaa ? isVidaaBackKey(event) : isTvBackKey(event);
      if (!back) return;
      if (vidaa && editingBackspace(event)) return;

      const now = Date.now();
      if (now - last < 400) {
        event.preventDefault();
        return;
      }

      if (vidaa && leaveFullscreen()) {
        last = now;
        event.preventDefault();
        return;
      }

      if (homePath(pathname)) {
        if (!vidaa) return;
        last = now;
        event.preventDefault();
        exitVidaa();
        return;
      }

      last = now;
      event.preventDefault();
      window.history.back();
    }

    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [pathname]);

  return null;
}
