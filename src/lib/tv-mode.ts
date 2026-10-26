export const TV_STORAGE_KEY = "strain-tv";
export const VIDAA_STORAGE_KEY = "strain-vidaa";
export const TV_CHANGE_EVENT = "strain-tv-change";

const TV_UA = /Web0S|webOS/i;
const VIDAA_UA = /VIDAA/i;

type Flag = "1" | "0" | null;
type MemoryKey = "__STRAIN_TV__" | "__STRAIN_VIDAA__";

type TvWindow = Window & {
  __STRAIN_TV__?: string;
  __STRAIN_VIDAA__?: string;
};

function queryFlag(search: string, name: string): Flag {
  const value = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  ).get(name);
  if (value === "1" || value === "true") return "1";
  if (value === "0" || value === "false") return "0";
  return null;
}

function memoryFlag(key: MemoryKey): Flag {
  if (typeof window === "undefined") return null;
  const value = (window as TvWindow)[key];
  return value === "1" || value === "0" ? value : null;
}

function readFlag(storageKey: string, memoryKey: MemoryKey): Flag {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored === "1" || stored === "0") return stored;
  } catch {
    // Some embedded webviews block sessionStorage.
  }
  return memoryFlag(memoryKey);
}

export function readTvFlag(): Flag {
  return readFlag(TV_STORAGE_KEY, "__STRAIN_TV__");
}

export function readVidaaFlag(): Flag {
  return readFlag(VIDAA_STORAGE_KEY, "__STRAIN_VIDAA__");
}

function remember(storageKey: string, memoryKey: MemoryKey, flag: Flag) {
  if (typeof window === "undefined") return;
  (window as TvWindow)[memoryKey] = flag ?? "";
  try {
    if (flag) window.sessionStorage.setItem(storageKey, flag);
    else window.sessionStorage.removeItem(storageKey);
  } catch {
    // The in-memory flag still covers this document.
  }
}

/** Hisense VIDAA (and other VIDAA sets) get the TV layout plus their own remote map. */
export function resolveVidaaMode(
  search: string,
  userAgent: string,
  stored: Flag = null,
): boolean {
  const query = queryFlag(search, "vidaa");
  if (query === "1") return true;
  if (query === "0") return false;
  if (stored === "1") return true;
  if (stored === "0") return false;
  return VIDAA_UA.test(userAgent);
}

export function resolveTvMode(
  search: string,
  userAgent: string,
  stored: Flag = null,
  storedVidaa: Flag = null,
): boolean {
  const tv = queryFlag(search, "tv");
  const vidaa = queryFlag(search, "vidaa");
  if (tv === "1") return true;
  if (tv === "0") return false;
  if (vidaa === "1") return true;
  if (vidaa === "0") return false;
  if (stored === "1") return true;
  if (stored === "0") return false;
  if (storedVidaa === "1") return true;
  if (TV_UA.test(userAgent)) return true;
  if (storedVidaa === "0") return false;
  return VIDAA_UA.test(userAgent);
}

/** Apply the TV / VIDAA classes and persist the choice for this tab. */
export function applyTvMode(search: string, userAgent: string): boolean {
  const stored = readTvFlag();
  const storedVidaa = readVidaaFlag();
  const tvQuery = queryFlag(search, "tv");
  const vidaaQuery = queryFlag(search, "vidaa");
  const vidaaOn = resolveVidaaMode(search, userAgent, storedVidaa);
  const on = resolveTvMode(search, userAgent, stored, storedVidaa);

  const nextTv: Flag = tvQuery
    ? tvQuery
    : vidaaQuery === "1"
      ? "1"
      : vidaaQuery === "0"
        ? "0"
        : stored === "1" || stored === "0"
          ? stored
          : on
            ? "1"
            : null;
  if (nextTv) remember(TV_STORAGE_KEY, "__STRAIN_TV__", nextTv);

  const nextVidaa: Flag = vidaaQuery
    ? vidaaQuery
    : storedVidaa === "1" || storedVidaa === "0"
      ? storedVidaa
      : vidaaOn
        ? "1"
        : null;
  if (nextVidaa) remember(VIDAA_STORAGE_KEY, "__STRAIN_VIDAA__", nextVidaa);

  document.documentElement.classList.toggle("tv-mode", on);
  document.documentElement.classList.toggle("vidaa-mode", on && vidaaOn);
  window.dispatchEvent(new Event(TV_CHANGE_EVENT));
  return on;
}

export function isTvBackKey(event: KeyboardEvent): boolean {
  return (
    event.keyCode === 461 ||
    event.key === "Back" ||
    event.key === "XF86Back" ||
    event.key === "GoBack" ||
    event.key === "BrowserBack"
  );
}

/** VIDAA Back is Backspace (8). Some sets also send the webOS-style 461 code. */
export function isVidaaBackKey(event: KeyboardEvent): boolean {
  return event.keyCode === 8 || event.key === "Backspace" || isTvBackKey(event);
}

export type VidaaMediaAction = "play" | "pause" | "toggle";

export function vidaaMediaAction(event: KeyboardEvent): VidaaMediaAction | null {
  if (event.key === "MediaPlay" || event.keyCode === 415) return "play";
  if (event.key === "MediaPause" || event.keyCode === 19) return "pause";
  if (event.key === "MediaPlayPause" || event.keyCode === 179) return "toggle";
  return null;
}

/**
 * Runs from `<head>` before first paint. Keep this in sync with
 * `resolveTvMode` / `resolveVidaaMode` / `applyTvMode` — it cannot import them.
 */
export const TV_BOOT_SCRIPT = `(function(){try{var p=new URLSearchParams(location.search);function flag(name){var v=p.get(name);return v==="1"||v==="true"?"1":v==="0"||v==="false"?"0":""}var tv=flag("tv");var vidaa=flag("vidaa");var storedTv="";var storedVidaa="";try{storedTv=sessionStorage.getItem("strain-tv")||""}catch(e){}try{storedVidaa=sessionStorage.getItem("strain-vidaa")||""}catch(e){}if(storedTv!=="1"&&storedTv!=="0")storedTv="";if(storedVidaa!=="1"&&storedVidaa!=="0")storedVidaa="";var ua=navigator.userAgent||"";var webos=/Web0S|webOS/i.test(ua);var vidaaUa=/VIDAA/i.test(ua);var vidaaOn=vidaa==="1"||(!vidaa&&(storedVidaa==="1"||(!storedVidaa&&vidaaUa)));if(vidaa==="0")vidaaOn=false;var on;if(tv==="1")on=true;else if(tv==="0"||vidaa==="0")on=false;else if(vidaa==="1")on=true;else if(storedTv==="1")on=true;else if(storedTv==="0")on=false;else if(storedVidaa==="1")on=true;else if(webos)on=true;else if(storedVidaa==="0")on=false;else on=vidaaUa;var nextTv=tv||(vidaa==="1"?"1":vidaa==="0"?"0":storedTv)||(on?"1":"");if(nextTv==="1"||nextTv==="0"){try{sessionStorage.setItem("strain-tv",nextTv)}catch(e){}window.__STRAIN_TV__=nextTv}var nextVidaa=vidaa||storedVidaa||(vidaaOn?"1":"");if(nextVidaa==="1"||nextVidaa==="0"){try{sessionStorage.setItem("strain-vidaa",nextVidaa)}catch(e){}window.__STRAIN_VIDAA__=nextVidaa}document.documentElement.classList.toggle("tv-mode",on);document.documentElement.classList.toggle("vidaa-mode",on&&vidaaOn);if(on){try{window.focus()}catch(e){}}}catch(e){}})();`;
