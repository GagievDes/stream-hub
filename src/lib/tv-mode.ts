export const TV_STORAGE_KEY = "strain-tv";
export const TV_CHANGE_EVENT = "strain-tv-change";

const TV_UA = /Web0S|webOS/i;

type Flag = "1" | "0" | null;

type TvWindow = Window & { __STRAIN_TV__?: string };

function queryFlag(search: string): Flag {
  const value = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  ).get("tv");
  if (value === "1" || value === "true") return "1";
  if (value === "0" || value === "false") return "0";
  return null;
}

function memoryFlag(): Flag {
  if (typeof window === "undefined") return null;
  const value = (window as TvWindow).__STRAIN_TV__;
  return value === "1" || value === "0" ? value : null;
}

export function readTvFlag(): Flag {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(TV_STORAGE_KEY);
    if (stored === "1" || stored === "0") return stored;
  } catch {
    // Some embedded webviews block sessionStorage.
  }
  return memoryFlag();
}

function remember(flag: Flag) {
  if (typeof window === "undefined") return;
  (window as TvWindow).__STRAIN_TV__ = flag ?? "";
  try {
    if (flag) window.sessionStorage.setItem(TV_STORAGE_KEY, flag);
    else window.sessionStorage.removeItem(TV_STORAGE_KEY);
  } catch {
    // The in-memory flag still covers this document.
  }
}

export function resolveTvMode(
  search: string,
  userAgent: string,
  stored: Flag = null,
): boolean {
  const query = queryFlag(search);
  if (query === "1") return true;
  if (query === "0") return false;
  if (stored === "1") return true;
  if (stored === "0") return false;
  return TV_UA.test(userAgent);
}

/** Apply the `tv-mode` class and persist the choice for this tab. */
export function applyTvMode(search: string, userAgent: string): boolean {
  const stored = readTvFlag();
  const query = queryFlag(search);
  const on = resolveTvMode(search, userAgent, stored);
  if (query) remember(query);
  else if (stored === "1" || stored === "0") remember(stored);
  else if (on) remember("1");

  document.documentElement.classList.toggle("tv-mode", on);
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

/**
 * Runs from `<head>` before first paint. Keep this in sync with
 * `resolveTvMode` / `applyTvMode` — it cannot import them.
 */
export const TV_BOOT_SCRIPT = `(function(){try{var p=new URLSearchParams(location.search);var q=p.get("tv");var query=q==="1"||q==="true"?"1":q==="0"||q==="false"?"0":"";var stored="";try{stored=sessionStorage.getItem("strain-tv")||""}catch(e){}if(stored!=="1"&&stored!=="0")stored="";var webos=/Web0S|webOS/i.test(navigator.userAgent||"");var on=query==="1"||(!query&&(stored==="1"||(!stored&&webos)));if(query==="0")on=false;var next=query||stored||(on?"1":"");if(next==="1"||next==="0"){try{sessionStorage.setItem("strain-tv",next)}catch(e){}window.__STRAIN_TV__=next}document.documentElement.classList.toggle("tv-mode",on)}catch(e){}})();`;
