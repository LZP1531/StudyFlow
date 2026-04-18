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
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;

  if (locale === "zh") {
    if (minutes === 0) {
      return `${restSeconds} 秒`;
    }

    return `${minutes} 分 ${restSeconds.toString().padStart(2, "0")} 秒`;
  }

  if (minutes === 0) {
    return `${restSeconds}s`;
  }

  return `${minutes}m ${restSeconds.toString().padStart(2, "0")}s`;
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

export function formatDateTimeRange(startedAt: string, endedAt: string | null, locale: Locale) {
  const language = locale === "zh" ? "zh-CN" : "en-US";
  const startDate = new Date(startedAt);
  const endDate = endedAt ? new Date(endedAt) : null;
  const dateFormatter = new Intl.DateTimeFormat(language, {
    month: "2-digit",
    day: "2-digit",
  });
  const timeFormatter = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const startDateLabel = dateFormatter.format(startDate);
  const startTimeLabel = timeFormatter.format(startDate);

  if (!endDate) {
    return `${startDateLabel} ${startTimeLabel} - ${locale === "zh" ? "进行中" : "Live"}`;
  }

  const endDateLabel = dateFormatter.format(endDate);
  const endTimeLabel = timeFormatter.format(endDate);

  if (startDateLabel === endDateLabel) {
    return `${startDateLabel} ${startTimeLabel} - ${endTimeLabel}`;
  }

  return `${startDateLabel} ${startTimeLabel} - ${endDateLabel} ${endTimeLabel}`;
}

export function formatWeekday(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    weekday: "short",
  }).format(new Date(date));
}

export function formatCompactMinutes(minutes: number, locale: Locale) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const rest = safeMinutes % 60;

  if (locale === "zh") {
    if (hours === 0) {
      return `${rest}分`;
    }

    return rest === 0 ? `${hours}小时` : `${hours}小时${rest}分`;
  }

  if (hours === 0) {
    return `${rest}m`;
  }

  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
