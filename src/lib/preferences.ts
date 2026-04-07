import type { Locale, ThemeMode } from "../types/app";

export const storageKeys = {
  locale: "studyflow-locale",
  theme: "studyflow-theme",
};

export function getInitialLocale(): Locale {
  const saved = localStorage.getItem(storageKeys.locale);
  if (saved === "zh" || saved === "en") {
    return saved;
  }

  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function getInitialThemeMode(): ThemeMode {
  const saved = localStorage.getItem(storageKeys.theme);
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }

  return "dark";
}

export function resolveTheme(mode: ThemeMode) {
  if (mode !== "system") {
    return mode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function cycleTheme(mode: ThemeMode): ThemeMode {
  if (mode === "dark") {
    return "light";
  }
  if (mode === "light") {
    return "system";
  }
  return "dark";
}
