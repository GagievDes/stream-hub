/** How long playback can sit still before a small buffering hint appears. */
export const STALL_HINT_MS = 2_500;
/** How long a stall lasts before the viewer may choose another host. Never automatic. */
export const STALL_OFFER_MS = 30_000;
export const NEXT_EPISODE_SECONDS = 5;

/**
 * The embed may run its own scripts, but it must not open windows or
 * navigate the page that contains it. allow-top-navigation and allow-popups
 * are intentionally absent. Descendants inherit the same limit.
 */
export const PLAYER_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation allow-fullscreen";

export type StallView = "hidden" | "buffering" | "offer";

export function stallView(
  idleMs: number,
  started: boolean,
  userPaused: boolean,
): StallView {
  if (!started || userPaused || idleMs < STALL_HINT_MS) return "hidden";
  if (idleMs >= STALL_OFFER_MS) return "offer";
  return "buffering";
}

/**
 * A host that has already played is not swapped because time stopped.
 * A new episode or an explicit retry is a new load and may still search.
 */
export function maySwapHost(started: boolean) {
  return !started;
}

/**
 * Ignore a jump back to the start while remembering a real position.
 * A deliberate rewind that stays above a few seconds is kept.
 */
export function isRestartGlitch(stableSeconds: number, currentSeconds: number) {
  return stableSeconds >= 15 && currentSeconds < 8;
}
