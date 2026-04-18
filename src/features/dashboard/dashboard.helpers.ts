import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import type { DailySummary, StudySession, TrackingSnapshot } from "../../types/study";
import { classificationLabel } from "../shared/viewLabels";

export type DashboardSourceKind = "app" | "site";

export function dashboardSessionSourceKind(session: StudySession): DashboardSourceKind {
  return session.primaryDomain ? "site" : "app";
}

export function dashboardSourceKindLabel(kind: DashboardSourceKind, locale: Locale) {
  return locale === "zh" ? (kind === "site" ? "网站" : "应用") : kind === "site" ? "Site" : "App";
}

export function dashboardSnapshotStatusLabel(snapshot: TrackingSnapshot, locale: Locale, text: Messages) {
  if (snapshot.currentSource === "Idle") {
    return locale === "zh" ? "空闲" : "Idle";
  }
  return classificationLabel(snapshot.classification, text);
}

export function dashboardBreakdownSourceKind(sourceLabel: string, sessions: StudySession[]): DashboardSourceKind {
  const matchedSession = sessions.find((session) => session.sourceLabel === sourceLabel);
  return matchedSession ? dashboardSessionSourceKind(matchedSession) : "app";
}

export function dashboardSessionSecondaryText(session: StudySession, locale: Locale) {
  if (session.primaryAppName && session.primaryDomain) {
    return `${session.primaryAppName} · ${session.primaryDomain}`;
  }
  return session.primaryAppName ?? session.primaryDomain ?? (locale === "zh" ? "未知来源" : "Unknown source");
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildRecentSevenDays(summary: DailySummary[], endDate: Date) {
  const byDate = new Map(summary.map((day) => [day.date, day]));
  const days: DailySummary[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(endDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = formatLocalDateKey(date);
    const existing = byDate.get(key);

    days.push(
      existing ?? {
        date: key,
        totalStudyMinutes: 0,
        focusedSessions: 0,
        distractionsMinutes: 0,
        topSource: "",
      },
    );
  }

  return days;
}
