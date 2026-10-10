export const THEME_KEY = "strain-theme";

export const THEMES = [
  { id: "ink", label: "Ink" },
  { id: "editorial", label: "Editorial" },
  { id: "glass", label: "Glass" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string | null): value is ThemeId {
  return value === "ink" || value === "editorial" || value === "glass";
}

export function readTheme(): ThemeId {
  if (typeof window === "undefined") return "ink";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return isThemeId(stored) ? stored : "ink";
  } catch {
    return "ink";
  }
}

export function applyTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode can block storage; the page still switches for this visit.
  }
}
