import type { Locale } from "../../types/app";
import type { ActivityEvent, Classification, StudySession } from "../../types/study";

export type TimelineViewMode = "sessions" | "events";
export type TimelineSourceFilter = "all" | "app" | "site";
export type TimelineClassificationFilter = "all" | Classification;
export type TimelineIconKind = "app" | "site" | "system";
export type TimelineDetailSelection =
  | { mode: "sessions"; session: StudySession }
  | { mode: "events"; event: ActivityEvent }
  | null;

export function timelineSessionTypeLabel(sessionType: StudySession["sessionType"], locale: Locale) {
  if (locale === "zh") {
    return sessionType === "manual" ? "手动" : "自动";
  }
  return sessionType === "manual" ? "Manual" : "Auto";
}

export function timelineSourceTypeLabel(sourceType: ActivityEvent["sourceType"], locale: Locale) {
  const zh: Record<ActivityEvent["sourceType"], string> = {
    browser: "网站",
    desktop: "应用",
    system: "系统",
  };
  const en: Record<ActivityEvent["sourceType"], string> = {
    browser: "Site",
    desktop: "App",
    system: "System",
  };
  return locale === "zh" ? zh[sourceType] : en[sourceType];
}

export function timelineIconKindForSession(session: StudySession): TimelineIconKind {
  return session.primaryDomain ? "site" : "app";
}

export function timelineIconKindForEvent(event: ActivityEvent): TimelineIconKind {
  if (event.isIdle || event.sourceType === "system") {
    return "system";
  }
  return event.sourceType === "browser" || Boolean(event.domain) || Boolean(event.url) ? "site" : "app";
}

export function matchesTimelineSourceFilterForSession(session: StudySession, filter: TimelineSourceFilter) {
  if (filter === "all") {
    return true;
  }
  return filter === "site" ? Boolean(session.primaryDomain) : !session.primaryDomain;
}

export function matchesTimelineSourceFilterForEvent(event: ActivityEvent, filter: TimelineSourceFilter) {
  if (filter === "all") {
    return true;
  }
  const isSite = event.sourceType === "browser" || Boolean(event.domain) || Boolean(event.url);
  return filter === "site" ? isSite : !isSite;
}

export function formatTimelineDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayOffset(target: Date, base: Date) {
  const targetStart = startOfDay(target).getTime();
  const baseStart = startOfDay(base).getTime();
  return Math.round((targetStart - baseStart) / 86_400_000);
}

function timelineDatePrefix(value: Date, locale: Locale, now: Date) {
  const offset = dayOffset(value, now);
  if (offset === 0) {
    return locale === "zh" ? "今天" : "Today";
  }
  if (offset === -1) {
    return locale === "zh" ? "昨天" : "Yesterday";
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatTimelineRecordRange(startedAt: string, endedAt: string | null, locale: Locale, now = new Date()) {
  const startDate = new Date(startedAt);
  const endDate = endedAt ? new Date(endedAt) : null;
  const timeFormatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const startPrefix = timelineDatePrefix(startDate, locale, now);
  const startTime = timeFormatter.format(startDate);

  if (!endDate) {
    return `${startPrefix} ${startTime} - ${locale === "zh" ? "进行中" : "Live"}`;
  }

  const endPrefix = timelineDatePrefix(endDate, locale, now);
  const endTime = timeFormatter.format(endDate);

  if (startPrefix === endPrefix) {
    return `${startPrefix} ${startTime} - ${endTime}`;
  }

  return `${startPrefix} ${startTime} - ${endPrefix} ${endTime}`;
}
