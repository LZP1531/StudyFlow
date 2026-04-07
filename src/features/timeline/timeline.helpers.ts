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
