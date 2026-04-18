import { useMemo } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import { formatCompactMinutes, formatDateTimeRange, formatMinutes, formatWeekday } from "../../lib/formatters";
import type { DailySummary, SourceBreakdown, StudySession, TrackingConfig, TrackingSnapshot } from "../../types/study";
import { DashboardBreakIcon, DashboardClockIcon, DashboardHistoryIcon, DashboardPulseIcon, RuleSparkIcon, SystemIcon } from "../../components/icons";
import { SourceIdentityIcon } from "../shared/SourceIdentityIcon";
import { categoryLabel } from "../shared/viewLabels";
import {
  buildRecentSevenDays,
  dashboardBreakdownSourceKind,
  dashboardSessionSecondaryText,
  dashboardSessionSourceKind,
  dashboardSnapshotStatusLabel,
  dashboardSourceKindLabel,
} from "./dashboard.helpers";
import { DashboardFlipTimer } from "./DashboardFlipTimer";

function DashboardLiveDial(props: { elapsedSeconds: number }) {
  const { elapsedSeconds } = props;
  const safeSeconds = Math.max(0, elapsedSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const primaryDisplay = [hours, minutes].map((value) => value.toString().padStart(2, "0")).join(":");
  const secondDisplay = seconds.toString().padStart(2, "0");
  const secAngle = safeSeconds * 6;
  const subMinuteAngle = (safeSeconds % 1800) / 5;

  return (
    <div className="dashboard-live-timer-wrap dashboard-live-timer-wrap-dial">
      <div className="dashboard-live-stopwatch" aria-label={`${primaryDisplay}:${secondDisplay}`}>
        <div className="dashboard-live-stopwatch-shell">
          <div className="dashboard-live-stopwatch-dial">
            <div className="dashboard-live-stopwatch-readout">
              <div className="dashboard-live-stopwatch-readout-inner">
                <span>{primaryDisplay}</span>
                <span className="dashboard-live-stopwatch-readout-seconds">.{secondDisplay}</span>
              </div>
            </div>

            <svg viewBox="0 0 200 200" className="dashboard-live-stopwatch-svg" aria-hidden="true">
              <circle className="dashboard-live-stopwatch-rim" cx="100" cy="100" r="96" />
              <circle className="dashboard-live-stopwatch-face" cx="100" cy="100" r="88" />
              {Array.from({ length: 60 }).map((_, index) => {
                const isMajor = index % 5 === 0;
                const angle = (index * 360) / 60;
                return (
                  <line
                    key={`outer-tick-${index}`}
                    x1="100"
                    y1="12"
                    x2="100"
                    y2={isMajor ? "24" : "18"}
                    className={`dashboard-live-stopwatch-tick ${isMajor ? "major" : "minor"}`}
                    transform={`rotate(${angle} 100 100)`}
                    strokeLinecap="round"
                  />
                );
              })}
              {[5, 10, 15, 20, 40, 45, 50, 55, 60].map((num) => {
                const angle = num * 6 * (Math.PI / 180);
                const x = 100 + 70 * Math.sin(angle);
                const y = 100 - 70 * Math.cos(angle);
                return (
                  <text key={`outer-label-${num}`} x={x} y={y} dominantBaseline="central" textAnchor="middle" className="dashboard-live-stopwatch-label">
                    {num === 60 ? "60" : num}
                  </text>
                );
              })}
              <circle className="dashboard-live-stopwatch-subdial" cx="100" cy="64" r="22" />
              {Array.from({ length: 30 }).map((_, index) => {
                const isMajor = index % 5 === 0;
                const angle = (index * 360) / 30;
                return (
                  <line
                    key={`sub-tick-${index}`}
                    x1="100"
                    y1="42"
                    x2="100"
                    y2={isMajor ? "47" : "45"}
                    className={`dashboard-live-stopwatch-subtick ${isMajor ? "major" : "minor"}`}
                    transform={`rotate(${angle} 100 64)`}
                    strokeLinecap="round"
                  />
                );
              })}
              {[5, 10, 15, 20, 25, 30].map((num) => {
                const angle = num * 12 * (Math.PI / 180);
                const x = 100 + 13 * Math.sin(angle);
                const y = 64 - 13 * Math.cos(angle);
                return (
                  <text key={`sub-label-${num}`} x={x} y={y} dominantBaseline="central" textAnchor="middle" className="dashboard-live-stopwatch-sublabel">
                    {num === 30 ? "30" : num}
                  </text>
                );
              })}
              <g className="dashboard-live-stopwatch-subhand" style={{ transform: `rotate(${subMinuteAngle}deg)`, transformOrigin: "100px 64px" }}>
                <line x1="100" y1="64" x2="100" y2="47" />
                <line x1="100" y1="64" x2="100" y2="68" />
                <circle cx="100" cy="64" r="2.6" />
              </g>
              <g className="dashboard-live-stopwatch-sechand" style={{ transform: `rotate(${secAngle}deg)`, transformOrigin: "100px 100px" }}>
                <line x1="100" y1="100" x2="100" y2="121" />
                <line x1="100" y1="100" x2="100" y2="24" />
                <circle cx="100" cy="100" r="4.6" className="dashboard-live-stopwatch-sechand-ring" />
              </g>
              <circle className="dashboard-live-stopwatch-center-dot" cx="100" cy="100" r="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardView(props: {
  dailySummary: DailySummary;
  weeklySummary: DailySummary[];
  sourceBreakdown: SourceBreakdown[];
  snapshot: TrackingSnapshot;
  sessions: StudySession[];
  locale: Locale;
  currentTimeMs: number;
  timerStyle: TrackingConfig["dashboardTimerStyle"];
  text: Messages;
  onOpenTimeline: () => void;
  onQuickCreateRule: () => void;
}) {
  const { dailySummary, weeklySummary, sourceBreakdown, snapshot, sessions, locale, currentTimeMs, timerStyle, text, onOpenTimeline, onQuickCreateRule } = props;
  const dashboardText = locale === "zh"
    ? {
        confidence: "可信度",
        weeklyTrendTitle: "最近 7 天学习趋势",
        weeklyTrendTotal: "7 天累计",
        sourcesTitle: "今日学习来源分布",
        sourcesEmpty: "今天还没有可展示的学习来源。",
        recentTitle: "最近记录",
        recentAction: "查看全部",
        recentEmpty: "今天还没有生成学习记录。",
        topSource: "最高频",
        details: "详情",
      }
    : {
        confidence: "Confidence",
        weeklyTrendTitle: "Last 7 days",
        weeklyTrendTotal: "7-day total",
        sourcesTitle: "Today's study source mix",
        sourcesEmpty: "No study sources available for today.",
        recentTitle: "Recent logs",
        recentAction: "View all",
        recentEmpty: "No study records yet today.",
        topSource: "Top source",
        details: "Details",
      };
  const quickRuleText = locale === "zh" 
    ? {
        badge: "ADD RULE LINK",
        title: "创建规则草稿",
        action: "DRAFT",
      }
    : {
        badge: "ADD RULE LINK",
        title: "Create rule draft",
        action: "DRAFT",
      };
  const trendDays = useMemo(() => buildRecentSevenDays(weeklySummary, new Date(currentTimeMs)), [currentTimeMs, weeklySummary]);
  const weeklyTotal = trendDays.reduce((sum, day) => sum + day.totalStudyMinutes, 0);
  const maxMinutes = Math.max(...trendDays.map((day) => day.totalStudyMinutes), 1);
  const bestDay = trendDays.length > 0 ? trendDays.reduce((current, day) => (day.totalStudyMinutes > current.totalStudyMinutes ? day : current)) : dailySummary;
  const recentSessions = useMemo(() => [...sessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5), [sessions]);
  const isIdleSnapshot = snapshot.currentSource === "Idle";
  const elapsedSeconds = isIdleSnapshot ? 0 : Math.max(0, Math.floor((currentTimeMs - new Date(snapshot.startedAt).getTime()) / 1000));
  const snapshotSourceKind = snapshot.sourceType === "browser" ? "site" : "app";
  const metricCards = [
    { label: text.stats.today.label, value: formatMinutes(dailySummary.totalStudyMinutes, locale), icon: <DashboardClockIcon />, tone: "blue" },
    { label: text.stats.focused.label, value: String(dailySummary.focusedSessions), icon: <DashboardPulseIcon />, tone: "indigo" },
    { label: text.stats.distraction.label, value: formatMinutes(dailySummary.distractionsMinutes, locale), icon: <DashboardBreakIcon />, tone: "orange" },
    { label: dashboardText.topSource, value: dailySummary.topSource, icon: <SystemIcon />, tone: "emerald" },
  ] as const;
  const sourceRows = useMemo(
    () =>
      sourceBreakdown.map((source) => ({
        ...source,
        kind: dashboardBreakdownSourceKind(source.sourceLabel, sessions),
        session: sessions.find((session) => session.sourceLabel === source.sourceLabel) ?? null,
      })),
    [sessions, sourceBreakdown],
  );

  return (
    <div className="page dashboard-page">
      <section className="dashboard-board">
        <div className="dashboard-board-top">
          <section className="dashboard-live-panel">
            <div className="dashboard-live-row">
              <span className={`dashboard-live-dot ${snapshot.classification} ${isIdleSnapshot ? "idle" : "live"}`.trim()} />
              <p className="eyebrow dashboard-live-eyebrow">TRACKING LIVE</p>
              <span className={`classification ${snapshot.classification}`}>{dashboardSnapshotStatusLabel(snapshot, locale, text)}</span>
            </div>

            <h1>{snapshot.currentSource}</h1>

            <div className="dashboard-live-source-row">
              <span className="dashboard-live-source-pill">
                <SystemIcon />
                {snapshot.currentApp}
              </span>
              <span className="muted-tag">{dashboardSourceKindLabel(snapshotSourceKind, locale)}</span>
              <span className="muted-tag">{dashboardText.confidence}: {Math.round(snapshot.confidence * 100)}%</span>
            </div>

            <button className="dashboard-rule-shortcut-card" onClick={onQuickCreateRule} type="button">
              <span className="dashboard-rule-shortcut-icon" aria-hidden="true">
                <RuleSparkIcon />
              </span>
              <span className="dashboard-rule-shortcut-copy">
                <span className="dashboard-rule-shortcut-badge">{quickRuleText.badge}</span>
                <strong>{quickRuleText.title}</strong>
              </span>
              <span className="dashboard-rule-shortcut-meta">
                <span className="dashboard-rule-shortcut-pattern">{snapshot.currentApp}</span>
                <span className="dashboard-rule-shortcut-action">{quickRuleText.action}</span>
              </span>
            </button>
          </section>

          <section className="dashboard-metric-grid">
            {metricCards.map((metric) => (
              <article key={metric.label} className={`dashboard-metric-cell ${metric.tone}`}>
                <div className="dashboard-metric-head">
                  <span className={`dashboard-metric-icon ${metric.tone}`}>{metric.icon}</span>
                  <span className="dashboard-metric-label">{metric.label}</span>
                </div>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </section>

          <section className="dashboard-stopwatch-panel">
            {timerStyle === "flip" ? (
              <DashboardFlipTimer currentTaskLabel={snapshot.currentSource} currentTimeMs={currentTimeMs} elapsedSeconds={elapsedSeconds} locale={locale} />
            ) : (
              <DashboardLiveDial elapsedSeconds={elapsedSeconds} />
            )}
          </section>
        </div>

        <div className="dashboard-board-bottom">
          <section className="dashboard-left-column">
            <div className="dashboard-section dashboard-trend-section">
              <div className="dashboard-section-head">
                <h2>{dashboardText.weeklyTrendTitle}</h2>
                <span className="muted-tag">{dashboardText.weeklyTrendTotal} {formatMinutes(weeklyTotal, locale)}</span>
              </div>
              <div className="week-chart dashboard-week-chart">
                {trendDays.map((day) => (
                  <div className="week-column" key={day.date}>
                    <span className="week-hours">{formatCompactMinutes(day.totalStudyMinutes, locale)}</span>
                    <div className="week-track">
                      <div
                        className={`week-fill ${day.date === bestDay.date ? "is-best" : ""}`.trim()}
                        style={{ height: `${Math.max(4, (day.totalStudyMinutes / maxMinutes) * 100)}%` }}
                      />
                    </div>
                    <strong>{formatWeekday(day.date, locale)}</strong>
                    <span>{day.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section dashboard-recent-section">
              <div className="dashboard-section-head">
                <div className="dashboard-section-title-inline">
                  <span className="dashboard-inline-icon"><DashboardHistoryIcon /></span>
                  <h2>{dashboardText.recentTitle}</h2>
                </div>
                <button className="ghost-button" onClick={onOpenTimeline} type="button">{dashboardText.recentAction}</button>
              </div>
              <div className="dashboard-recent-list">
                {recentSessions.length === 0 ? (
                  <p className="dashboard-empty-copy">{dashboardText.recentEmpty}</p>
                ) : (
                  recentSessions.map((session) => (
                    <article className="dashboard-recent-row" key={session.id}>
                      <div className={`dashboard-recent-icon ${dashboardSessionSourceKind(session)}`}>
                        <SourceIdentityIcon
                          appName={session.primaryAppName}
                          className="dashboard-recent-identity"
                          domain={session.primaryDomain}
                          sourceKind={dashboardSessionSourceKind(session)}
                          sourceLabel={session.sourceLabel}
                        />
                      </div>
                      <div className="dashboard-recent-time"><strong>{formatDateTimeRange(session.startedAt, session.endedAt, locale)}</strong></div>
                      <div className="dashboard-recent-main">
                        <strong>{session.sourceLabel}</strong>
                        <p>{dashboardSessionSecondaryText(session, locale)}</p>
                      </div>
                      <div className="dashboard-recent-side">
                        <span className="dashboard-recent-source">{session.primaryAppName ?? session.primaryDomain ?? dashboardSourceKindLabel(dashboardSessionSourceKind(session), locale)}</span>
                        <span className="timeline-tag-chip">{categoryLabel(session.category, locale)}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-source-column">
            <div className="dashboard-section dashboard-source-section">
              <div className="dashboard-section-head">
                <h2>{dashboardText.sourcesTitle}</h2>
                <button className="ghost-button" onClick={onOpenTimeline} type="button">{dashboardText.details}</button>
              </div>
              <div className="dashboard-source-list">
                {sourceRows.length === 0 ? (
                  <p className="dashboard-empty-copy">{dashboardText.sourcesEmpty}</p>
                ) : (
                  sourceRows.map((source) => (
                    <article className="dashboard-source-row" key={source.sourceLabel}>
                      <div className="dashboard-source-topline">
                        <div className="dashboard-source-meta">
                          <div className={`dashboard-source-icon ${source.kind}`}>
                            <SourceIdentityIcon
                              appName={source.session?.primaryAppName}
                              className="dashboard-source-identity"
                              domain={source.session?.primaryDomain}
                              sourceKind={source.kind}
                              sourceLabel={source.sourceLabel}
                            />
                          </div>
                          <div>
                            <strong>{source.sourceLabel}</strong>
                            <p>{source.session ? source.session.primaryDomain ?? source.session.primaryAppName ?? dashboardSourceKindLabel(source.kind, locale) : dashboardSourceKindLabel(source.kind, locale)}</p>
                          </div>
                        </div>
                        <div className="dashboard-source-metrics">
                          <strong>{source.share}%</strong>
                          <span>{formatMinutes(source.minutes, locale)}</span>
                        </div>
                      </div>
                      <div className="dashboard-source-progress">
                        <span style={{ width: `${Math.max(6, source.share)}%`, background: source.accent }} />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}



