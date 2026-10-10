"use client";

import { applyTheme, THEMES, type ThemeId } from "@/lib/theme";

export function ThemeSwitcher() {
  return (
    <div className="theme-switcher" role="group" aria-label="Design">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          data-theme-choice={theme.id}
          onClick={() => applyTheme(theme.id as ThemeId)}
        >
          {theme.label}
        </button>
      ))}
    </div>
  );
}
