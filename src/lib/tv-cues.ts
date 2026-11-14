export type Cue = {
  start: number;
  end: number;
  text: string;
};

export const CUE_SIZES = [
  { id: "sm", label: "Small", font: "4.8vh" },
  { id: "md", label: "Medium", font: "6.2vh" },
  { id: "lg", label: "Large", font: "8vh" },
  { id: "xl", label: "Extra large", font: "10vh" },
] as const;

export type CueSize = (typeof CUE_SIZES)[number]["id"];

const CUE_KEY = "strain-tv-cue";

export function cueFont(size: CueSize) {
  return CUE_SIZES.find((item) => item.id === size)?.font ?? CUE_SIZES[2].font;
}

export function readCueSize(): CueSize {
  if (typeof window === "undefined") return "lg";
  try {
    const stored = window.sessionStorage.getItem(CUE_KEY);
    if (stored === "sm" || stored === "md" || stored === "lg" || stored === "xl") return stored;
  } catch {
    // sessionStorage can be blocked in a webview.
  }
  return "lg";
}

export function writeCueSize(size: CueSize) {
  try {
    window.sessionStorage.setItem(CUE_KEY, size);
  } catch {
    // The in-memory choice still applies for this view.
  }
  window.dispatchEvent(new Event("strain-cue-size"));
}

function stamp(value: string): number | null {
  const match = value.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})[.](\d{1,3})$/);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const millis = Number(match[4].padEnd(3, "0"));
  return hours * 3600 + minutes * 60 + seconds + millis / 1000;
}

/** Read WebVTT (or SRT already converted to dot timestamps) into cues. */
export function parseVttCues(input: string): Cue[] {
  const body = input.replace(/^\uFEFF/, "").replace(/\r/g, "").trim();
  const cues: Cue[] = [];
  for (const block of body.split(/\n{2,}/)) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const timing = lines.findIndex((line) => line.includes("-->"));
    if (timing < 0) continue;
    const [rawStart, rawEnd = ""] = lines[timing].split("-->");
    const start = stamp(rawStart ?? "");
    const end = stamp(rawEnd.trim().split(/\s/)[0] ?? "");
    if (start == null || end == null || end <= start) continue;
    const text = lines
      .slice(timing + 1)
      .join("\n")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!text) continue;
    cues.push({ start, end, text });
  }
  return cues;
}

export function cueTextAt(cues: readonly Cue[], time: number) {
  const hit = cues.find((cue) => time >= cue.start && time < cue.end);
  return hit?.text ?? "";
}
