import type { Locale, ThemeMode } from "./copy";

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

export function formatMinutes(minutes: number, locale: Locale) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (locale === "zh") {
    return hours === 0 ? `${rest} 分钟` : `${hours} 小时 ${rest.toString().padStart(2, "0")} 分`;
  }

  return hours === 0 ? `${rest} min` : `${hours}h ${rest.toString().padStart(2, "0")}m`;
}

export function formatDurationSeconds(seconds: number, locale: Locale) {
  return formatMinutes(Math.max(0, Math.round(seconds / 60)), locale);
}

export function formatTimeRange(startedAt: string, endedAt: string | null, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!endedAt) {
    return `${formatter.format(new Date(startedAt))} - ${locale === "zh" ? "进行中" : "Live"}`;
  }

  return `${formatter.format(new Date(startedAt))} - ${formatter.format(new Date(endedAt))}`;
}

export function formatWeekday(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
  }).format(new Date(date));
}
