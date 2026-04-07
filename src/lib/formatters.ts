import type { Locale } from "../types/app";

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
