import { useEffect, useMemo, useState } from "react";
import { copy } from "./copy";
import { useRef } from "react";
import type { Copy, Locale, ThemeMode, ViewKey } from "./copy";
import { trackerBridge } from "./lib/trackerBridge";
import {
  cycleTheme,
  formatDurationSeconds,
  formatMinutes,
  formatTimeRange,
  formatWeekday,
  getInitialLocale,
  getInitialThemeMode,
  resolveTheme,
  storageKeys,
} from "./theme";
import type {
  ActivityEvent,
  Classification,
  DailySummary,
  Rule,
  RuleClassification,
  RuleInput,
  RuleType,
  SettingsMeta,
  SourceBreakdown,
  StudyCategory,
  StudySession,
  TrackingConfig,
  TrackingSnapshot,
} from "./types/study";

const navOrder: ViewKey[] = ["dashboard", "timeline", "rules", "settings"];

function classificationLabel(classification: Classification, text: Copy) {
  return text.classification[classification];
}

function AppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity="0.18" />
      <path d="M8.4 7.8h7.2l-1.1 2.1h-5L8.4 7.8Zm1.1 3.5h4.8v4.9H9.5v-4.9Z" fill="currentColor" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M4.5 6.5h15v11h-15z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 19.5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M12 3.2a8.8 8.8 0 1 0 8.6 10.7 7.1 7.1 0 0 1-8.5-8.5c0-.8.1-1.5.3-2.2A2.6 2.6 0 0 0 12 3.2Z" fill="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M12 5.2 4.6 11v7.2h5.1v-4.5h4.6v4.5h5.1V11L12 5.2Z" fill="currentColor" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M6 7.5h3.5v3.5H6V7.5Zm4.25 0h7.75v1.8h-7.75V7.5Zm0 3.7h5.5V13h-5.5v-1.8ZM6 13.2h3.5v3.5H6v-3.5Zm4.25 0H18V15h-7.75v-1.8Zm0 3.7h6.2v1.8h-6.2v-1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RulesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M7 6.5h10a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 17 17.5H7A1.5 1.5 0 0 1 5.5 16V8A1.5 1.5 0 0 1 7 6.5Zm1.4 3.1h7.2v1.8H8.4V9.6Zm0 3.2h4.4v1.8H8.4v-1.8Zm6.2-.4 1.1 1.1 2.1-2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="m12 5.4 1 .3.6 1.6 1.5.6 1.4-.6 1 .9-.5 1.4.6 1.5 1.6.6.3 1-.3 1-1.6.6-.6 1.5.5 1.4-1 .9-1.4-.6-1.5.6-.6 1.6-1 .3-1-.3-.6-1.6-1.5-.6-1.4.6-1-.9.5-1.4-.6-1.5-1.6-.6-.3-1 .3-1 1.6-.6.6-1.5-.5-1.4 1-.9 1.4.6 1.5-.6.6-1.6 1-.3Zm0 4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z" fill="currentColor" />
    </svg>
  );
}

function TimerStyleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <rect x="4.5" y="5.8" width="15" height="12.4" rx="2.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.2 12h13.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 4.2h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M6 12.9h12v1.8H6z" fill="currentColor" />
    </svg>
  );
}

function MaximizeIcon(props: { isMaximized: boolean }) {
  return props.isMaximized ? (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M7 9h8v8H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M7 7h10v10H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="m8 8 8 8M16 8l-8 8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.6v5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

function navIcon(view: ViewKey) {
  switch (view) {
    case "dashboard":
      return <HomeIcon />;
    case "timeline":
      return <TimelineIcon />;
    case "rules":
      return <RulesIcon />;
    case "settings":
      return <SettingsIcon />;
  }
}

function ChromeButton(props: {
  tooltip: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`chrome-button no-drag ${props.className ?? ""}`.trim()}
      onClick={props.onClick}
      aria-label={props.tooltip}
      data-tooltip={props.tooltip}
      type="button"
    >
      {props.children}
    </button>
  );
}

function InlineInfoButton(props: { tooltip: string }) {
  return (
    <button
      className="inline-info-button"
      aria-label={props.tooltip}
      data-tooltip={props.tooltip}
      type="button"
    >
      <InfoIcon />
    </button>
  );
}

function WindowTitleBar(props: {
  locale: Locale;
  themeMode: ThemeMode;
  dashboardTimerStyle: TrackingConfig["dashboardTimerStyle"];
  isMaximized: boolean;
  onToggleTheme: () => void;
  onToggleTimerStyle: () => void;
  onToggleLocale: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}) {
  return (
    <header className="window-titlebar drag-region">
      <div className="titlebar-brand no-drag">
        <div className="brand-mark brand-mark-small">
          <AppIcon />
        </div>
        <strong>StudyFlow</strong>
      </div>

      <div className="titlebar-actions no-drag">
        <ChromeButton
          onClick={props.onToggleTheme}
          tooltip={
            props.locale === "zh"
              ? `主题：${props.themeMode === "dark" ? "深色" : props.themeMode === "light" ? "浅色" : "系统"}`
              : `Theme: ${props.themeMode}`
          }
        >
          {props.themeMode === "system" ? (
            <SystemIcon />
          ) : props.themeMode === "light" ? (
            <SunIcon />
          ) : (
            <ThemeIcon />
          )}
        </ChromeButton>
        <ChromeButton
          onClick={props.onToggleTimerStyle}
          tooltip={
            props.locale === "zh"
              ? `计时器：${props.dashboardTimerStyle === "dial" ? "表盘" : "翻页"}`
              : `Timer: ${props.dashboardTimerStyle === "dial" ? "Dial" : "Flip"}`
          }
        >
          <TimerStyleIcon />
        </ChromeButton>
        <ChromeButton
          onClick={props.onToggleLocale}
          tooltip={props.locale === "zh" ? "语言：中文" : "Language: English"}
        >
          <span className="chrome-button-text">{props.locale === "zh" ? "中" : "EN"}</span>
        </ChromeButton>
        <ChromeButton onClick={props.onMinimize} tooltip={props.locale === "zh" ? "最小化" : "Minimize"}>
          <MinimizeIcon />
        </ChromeButton>
        <ChromeButton onClick={props.onMaximize} tooltip={props.locale === "zh" ? "最大化" : "Maximize"}>
          <MaximizeIcon isMaximized={props.isMaximized} />
        </ChromeButton>
        <ChromeButton className="danger" onClick={props.onClose} tooltip={props.locale === "zh" ? "关闭" : "Close"}>
          <CloseIcon />
        </ChromeButton>
      </div>
    </header>
  );
}

type DashboardSourceKind = "app" | "site";

function dashboardSessionSourceKind(session: StudySession): DashboardSourceKind {
  return session.primaryDomain ? "site" : "app";
}

function dashboardSourceKindLabel(kind: DashboardSourceKind, locale: Locale) {
  return locale === "zh" ? (kind === "site" ? "网站" : "应用") : kind === "site" ? "Site" : "App";
}

function dashboardSnapshotStatusLabel(snapshot: TrackingSnapshot, locale: Locale, text: Copy) {
  if (snapshot.currentSource === "Idle") {
    return locale === "zh" ? "空闲" : "Idle";
  }
  return classificationLabel(snapshot.classification, text);
}

function dashboardBreakdownSourceKind(sourceLabel: string, sessions: StudySession[]): DashboardSourceKind {
  const matchedSession = sessions.find((session) => session.sourceLabel === sourceLabel);
  return matchedSession ? dashboardSessionSourceKind(matchedSession) : "app";
}

function DashboardClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.6v4.8l3.1 1.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DashboardPulseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M3.8 12h4l2-4.3 3.1 8 2.4-5.1h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardBreakIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M7.2 9.1h9.6v5.1a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8V9.1Zm9.6 1.1h1.4a1.7 1.7 0 0 1 0 3.4h-1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.7 5.5v1.8M12 4.9v2.4M15.3 5.5v1.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DashboardHistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.8 8.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 5.6v3.1h3.1M12 8.2v4.2l2.7 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
                  <text
                    key={`outer-label-${num}`}
                    x={x}
                    y={y}
                    dominantBaseline="central"
                    textAnchor="middle"
                    className="dashboard-live-stopwatch-label"
                  >
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
                  <text
                    key={`sub-label-${num}`}
                    x={x}
                    y={y}
                    dominantBaseline="central"
                    textAnchor="middle"
                    className="dashboard-live-stopwatch-sublabel"
                  >
                    {num === 30 ? "30" : num}
                  </text>
                );
              })}

              <g
                className="dashboard-live-stopwatch-subhand"
                style={{ transform: `rotate(${subMinuteAngle}deg)`, transformOrigin: "100px 64px" }}
              >
                <line x1="100" y1="64" x2="100" y2="47" />
                <line x1="100" y1="64" x2="100" y2="68" />
                <circle cx="100" cy="64" r="2.6" />
              </g>

              <g
                className="dashboard-live-stopwatch-sechand"
                style={{ transform: `rotate(${secAngle}deg)`, transformOrigin: "100px 100px" }}
              >
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

function dashboardFlipUnitLabel(unit: "hours" | "minutes", locale: Locale) {
  if (locale === "zh") {
    return unit === "hours" ? "时" : "分";
  }

  return unit === "hours" ? "Hour" : "Min";
}

function formatDashboardFlipDate(currentTimeMs: number) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "2-digit",
  })
    .format(new Date(currentTimeMs))
    .replace(", ", " • ")
    .toUpperCase();
}

function DashboardFlipDigit(props: { digit: string }) {
  const { digit } = props;
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const queuedDigitRef = useRef<string | null>(null);
  const currentRef = useRef(digit);
  const nextRef = useRef(digit);
  const isFlippingRef = useRef(false);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    isFlippingRef.current = isFlipping;
  }, [isFlipping]);

  useEffect(() => {
    if (digit === currentRef.current && !isFlippingRef.current) {
      queuedDigitRef.current = null;
      return;
    }

    if (isFlippingRef.current) {
      queuedDigitRef.current = digit;
      return;
    }

    nextRef.current = digit;
    setNext(digit);
    setIsFlipping(true);
  }, [digit]);

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.animationName !== "dashboard-flip-bottom-in") {
      return;
    }

    const resolvedDigit = nextRef.current;
    currentRef.current = resolvedDigit;
    setCurrent(resolvedDigit);
    setIsFlipping(false);

    const queuedDigit = queuedDigitRef.current;
    queuedDigitRef.current = null;

    if (queuedDigit && queuedDigit !== resolvedDigit) {
      nextRef.current = queuedDigit;
      setNext(queuedDigit);
      setIsFlipping(true);
    }
  }

  return (
    <div className="dashboard-flip-digit">
      {!isFlipping ? (
        <>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-top">{current}</div>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-bottom">{current}</div>
        </>
      ) : (
        <>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-top">{next}</div>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-bottom">{current}</div>
          <div className="dashboard-flip-half dashboard-flip-half-anim dashboard-flip-half-top dashboard-flip-half-top-anim">
            {current}
          </div>
          <div
            className="dashboard-flip-half dashboard-flip-half-anim dashboard-flip-half-bottom dashboard-flip-half-bottom-anim"
            onAnimationEnd={handleAnimationEnd}
          >
            {next}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardFlipDigitGroup(props: { value: number }) {
  const formatted = props.value.toString().padStart(2, "0");
  return (
    <div className="dashboard-flip-pair">
      <DashboardFlipDigit digit={formatted[0]} />
      <DashboardFlipDigit digit={formatted[1]} />
    </div>
  );
}

function DashboardFlipTimer(props: {
  elapsedSeconds: number;
  locale: Locale;
  currentTimeMs: number;
  currentTaskLabel: string;
}) {
  const safeSeconds = Math.max(0, props.elapsedSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const timeLabel = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const dateLabel = formatDashboardFlipDate(props.currentTimeMs);
  const taskLabel = props.currentTaskLabel.trim() || (props.locale === "zh" ? "当前专注" : "Current focus");

  return (
    <div className="dashboard-live-timer-wrap dashboard-live-timer-wrap-flip">
      <div className="dashboard-flip-timer" aria-label={timeLabel}>
        <div className="dashboard-flip-meta-top">{dateLabel}</div>
        <div className="dashboard-flip-timer-readout" aria-hidden="true">
          <DashboardFlipDigitGroup value={hours} />
          <div className="dashboard-flip-unit-label">{dashboardFlipUnitLabel("hours", props.locale)}</div>
          <DashboardFlipDigitGroup value={minutes} />
          <div className="dashboard-flip-unit-label">{dashboardFlipUnitLabel("minutes", props.locale)}</div>
          <DashboardFlipDigitGroup value={seconds} />
        </div>
        <div className="dashboard-flip-meta-bottom">
          <span className="dashboard-flip-task-pill">
            <span className="dashboard-flip-task-icon" aria-hidden="true">
              <DashboardPulseIcon />
            </span>
            <span className="dashboard-flip-task-label">
              {props.locale === "zh" ? "当前任务" : "Current task"}
            </span>
            <strong>{taskLabel}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

function dashboardSessionSecondaryText(session: StudySession, locale: Locale) {
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

function buildRecentSevenDays(summary: DailySummary[], endDate: Date) {
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

function DashboardView(props: {
  dailySummary: DailySummary;
  weeklySummary: DailySummary[];
  sourceBreakdown: SourceBreakdown[];
  snapshot: TrackingSnapshot;
  sessions: StudySession[];
  locale: Locale;
  currentTimeMs: number;
  timerStyle: TrackingConfig["dashboardTimerStyle"];
  text: Copy;
  onOpenTimeline: () => void;
}) {
  const { dailySummary, weeklySummary, sourceBreakdown, snapshot, sessions, locale, currentTimeMs, timerStyle, text, onOpenTimeline } = props;
  const dashboardText = locale === "zh"
      ? {
        currentTitle: "实时追踪",
        currentTimer: "已持续",
        confidence: "可信度",
        weeklyTrendTitle: "最近 7 天学习趋势",
        weeklyTrendTotal: "7 天累计",
        sourcesTitle: "今日来源分布",
        sourcesEmpty: "今天还没有可展示的学习来源。",
        recentTitle: "最近记录",
        recentAction: "查看全部",
        recentEmpty: "今天还没有生成学习记录。",
        topSource: "最高频",
        details: "详情",
      }
      : {
        currentTitle: "Tracking live",
        currentTimer: "Elapsed",
        confidence: "Confidence",
        weeklyTrendTitle: "Last 7 days",
        weeklyTrendTotal: "7-day total",
        sourcesTitle: "Today's source mix",
        sourcesEmpty: "No study sources available for today.",
        recentTitle: "Recent logs",
        recentAction: "View all",
        recentEmpty: "No study records yet today.",
        topSource: "Top source",
        details: "Details",
      };
  const weeklyTotal = weeklySummary.reduce((sum, day) => sum + day.totalStudyMinutes, 0);
  const trendDays = useMemo(
    () => buildRecentSevenDays(weeklySummary, new Date(currentTimeMs)),
    [currentTimeMs, weeklySummary],
  );
  const maxMinutes = Math.max(...trendDays.map((day) => day.totalStudyMinutes), 1);
  const bestDay = trendDays.length > 0
    ? trendDays.reduce((current, day) => (day.totalStudyMinutes > current.totalStudyMinutes ? day : current))
    : dailySummary;
  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5),
    [sessions],
  );
  const isIdleSnapshot = snapshot.currentSource === "Idle";
  const elapsedSeconds = isIdleSnapshot ? 0 : Math.max(0, Math.floor((currentTimeMs - new Date(snapshot.startedAt).getTime()) / 1000));
  const snapshotSourceKind = snapshot.sourceType === "browser" ? "site" : "app";
  const metricCards = [
    {
      label: text.stats.today.label,
      value: formatMinutes(dailySummary.totalStudyMinutes, locale),
      icon: <DashboardClockIcon />,
      tone: "blue",
    },
    {
      label: text.stats.focused.label,
      value: String(dailySummary.focusedSessions),
      icon: <DashboardPulseIcon />,
      tone: "indigo",
    },
    {
      label: text.stats.distraction.label,
      value: formatMinutes(dailySummary.distractionsMinutes, locale),
      icon: <DashboardBreakIcon />,
      tone: "orange",
    },
    {
      label: dashboardText.topSource,
      value: dailySummary.topSource,
      icon: <SystemIcon />,
      tone: "emerald",
    },
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
              <span
                className={`dashboard-live-dot ${snapshot.classification} ${isIdleSnapshot ? "idle" : "live"}`.trim()}
              />
              <p className="eyebrow dashboard-live-eyebrow">TRACKING LIVE</p>
              <span className={`classification ${snapshot.classification}`}>
                {dashboardSnapshotStatusLabel(snapshot, locale, text)}
              </span>
            </div>

            <h1>{snapshot.currentSource}</h1>

            <div className="dashboard-live-source-row">
              <span className="dashboard-live-source-pill">
                <SystemIcon />
                {snapshot.currentApp}
              </span>
              <span className="muted-tag">{dashboardSourceKindLabel(snapshotSourceKind, locale)}</span>
              <span className="muted-tag">
                {dashboardText.confidence}: {Math.round(snapshot.confidence * 100)}%
              </span>
            </div>
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
              <DashboardFlipTimer
                currentTaskLabel={snapshot.currentSource}
                currentTimeMs={currentTimeMs}
                elapsedSeconds={elapsedSeconds}
                locale={locale}
              />
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
                <span className="muted-tag">
                  {dashboardText.weeklyTrendTotal} {formatMinutes(weeklyTotal, locale)}
                </span>
              </div>
              <div className="week-chart dashboard-week-chart">
                {trendDays.map((day) => (
                  <div className="week-column" key={day.date}>
                    <span className="week-hours">{Math.max(0, Math.round(day.totalStudyMinutes / 60))}h</span>
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
                  <span className="dashboard-inline-icon">
                    <DashboardHistoryIcon />
                  </span>
                  <h2>{dashboardText.recentTitle}</h2>
                </div>
                <button className="ghost-button" onClick={onOpenTimeline} type="button">
                  {dashboardText.recentAction}
                </button>
              </div>
              <div className="dashboard-recent-list">
                {recentSessions.length === 0 ? (
                  <p className="dashboard-empty-copy">{dashboardText.recentEmpty}</p>
                ) : (
                  recentSessions.map((session) => (
                    <article className="dashboard-recent-row" key={session.id}>
                      <div className="dashboard-recent-time">
                        <strong>{formatTimeRange(session.startedAt, session.endedAt, locale)}</strong>
                      </div>
                      <div className="dashboard-recent-main">
                        <strong>{session.sourceLabel}</strong>
                        <p>{dashboardSessionSecondaryText(session, locale)}</p>
                      </div>
                      <div className="dashboard-recent-side">
                        <span className="dashboard-recent-source">
                          {session.primaryAppName ?? session.primaryDomain ?? dashboardSourceKindLabel(dashboardSessionSourceKind(session), locale)}
                        </span>
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
                <button className="ghost-button" onClick={onOpenTimeline} type="button">
                  {dashboardText.details}
                </button>
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
                            {source.kind === "site" ? <GlobeIcon /> : <AppIcon />}
                          </div>
                          <div>
                            <strong>{source.sourceLabel}</strong>
                            <p>
                              {source.session
                                ? source.session.primaryDomain ?? source.session.primaryAppName ?? dashboardSourceKindLabel(source.kind, locale)
                                : dashboardSourceKindLabel(source.kind, locale)}
                            </p>
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

type TimelineViewMode = "sessions" | "events";
type TimelineSourceFilter = "all" | "app" | "site";
type TimelineClassificationFilter = "all" | Classification;
type TimelineIconKind = "app" | "site" | "system";

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.9 12h16.2M12 3.8a12.7 12.7 0 0 1 0 16.4M12 3.8a12.7 12.7 0 0 0 0 16.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <ellipse cx="12" cy="6.6" rx="6.5" ry="2.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 6.8v9.6c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8V6.8M5.5 11.6c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function TimelineRecordIcon(props: { kind: TimelineIconKind }) {
  return (
    <div className={`timeline-record-icon ${props.kind}`}>
      {props.kind === "site" ? <GlobeIcon /> : props.kind === "system" ? <DatabaseIcon /> : <AppIcon />}
    </div>
  );
}

function timelineSessionTypeLabel(sessionType: StudySession["sessionType"], locale: Locale) {
  if (locale === "zh") {
    return sessionType === "manual" ? "手动" : "自动";
  }
  return sessionType === "manual" ? "Manual" : "Auto";
}

function timelineSourceTypeLabel(sourceType: ActivityEvent["sourceType"], locale: Locale) {
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

function timelineIconKindForSession(session: StudySession): TimelineIconKind {
  return session.primaryDomain ? "site" : "app";
}

function timelineIconKindForEvent(event: ActivityEvent): TimelineIconKind {
  if (event.isIdle || event.sourceType === "system") {
    return "system";
  }
  return event.sourceType === "browser" || Boolean(event.domain) || Boolean(event.url) ? "site" : "app";
}

function matchesTimelineSourceFilterForSession(session: StudySession, filter: TimelineSourceFilter) {
  if (filter === "all") {
    return true;
  }
  return filter === "site" ? Boolean(session.primaryDomain) : !session.primaryDomain;
}

function matchesTimelineSourceFilterForEvent(event: ActivityEvent, filter: TimelineSourceFilter) {
  if (filter === "all") {
    return true;
  }
  const isSite = event.sourceType === "browser" || Boolean(event.domain) || Boolean(event.url);
  return filter === "site" ? isSite : !isSite;
}

function simplifyUrl(url: string) {
  try {
    const parsed = new URL(url);
    const simplified = `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
    return simplified.length > 42 ? `${simplified.slice(0, 39)}...` : simplified;
  } catch {
    return url.length > 42 ? `${url.slice(0, 39)}...` : url;
  }
}

function formatTimelineDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

type TimelineDetailSelection =
  | { mode: "sessions"; session: StudySession }
  | { mode: "events"; event: ActivityEvent }
  | null;

function TimelineDetailModal(props: {
  locale: Locale;
  selection: TimelineDetailSelection;
  text: Copy;
  onClose: () => void;
}) {
  const { locale, selection, text } = props;
  if (!selection) {
    return null;
  }

  const detailText = locale === "zh"
    ? {
        title: selection.mode === "sessions" ? "学习记录详情" : "详细记录详情",
        field: "字段",
        value: "内容",
        empty: "暂无",
        close: "关闭",
        labels: {
          startedAt: "开始时间",
          endedAt: "结束时间",
          durationSeconds: "时长",
          sourceLabel: "来源标签",
          classification: "分类",
          category: "类别",
          primaryAppName: "主要应用",
          primaryDomain: "主要域名",
          note: "说明",
          sessionType: "记录类型",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          sourceType: "来源类型",
          appName: "应用名",
          windowTitle: "窗口标题",
          domain: "域名",
          url: "网址",
          browserName: "浏览器",
          matchedRuleId: "命中规则 ID",
          isIdle: "是否空闲",
          confidence: "可信度",
        },
      }
    : {
        title: selection.mode === "sessions" ? "Study Record Details" : "Detailed Record Details",
        field: "Field",
        value: "Value",
        empty: "Unavailable",
        close: "Close",
        labels: {
          startedAt: "Started at",
          endedAt: "Ended at",
          durationSeconds: "Duration",
          sourceLabel: "Source label",
          classification: "Classification",
          category: "Category",
          primaryAppName: "Primary app",
          primaryDomain: "Primary domain",
          note: "Note",
          sessionType: "Record type",
          createdAt: "Created at",
          updatedAt: "Updated at",
          sourceType: "Source type",
          appName: "App name",
          windowTitle: "Window title",
          domain: "Domain",
          url: "URL",
          browserName: "Browser",
          matchedRuleId: "Matched rule ID",
          isIdle: "Idle",
          confidence: "Confidence",
        },
      };

  const rows =
    selection.mode === "sessions"
      ? [
          { label: detailText.labels.startedAt, value: formatTimelineDateTime(selection.session.startedAt, locale) },
          { label: detailText.labels.endedAt, value: formatTimelineDateTime(selection.session.endedAt, locale) },
          {
            label: detailText.labels.durationSeconds,
            value: formatDurationSeconds(selection.session.durationSeconds, locale),
          },
          { label: detailText.labels.sourceLabel, value: selection.session.sourceLabel },
          {
            label: detailText.labels.classification,
            value: classificationLabel(selection.session.classification, text),
          },
          { label: detailText.labels.category, value: categoryLabel(selection.session.category, locale) },
          { label: detailText.labels.primaryAppName, value: selection.session.primaryAppName ?? detailText.empty },
          { label: detailText.labels.primaryDomain, value: selection.session.primaryDomain ?? detailText.empty },
          { label: detailText.labels.note, value: selection.session.note || detailText.empty },
          {
            label: detailText.labels.sessionType,
            value: timelineSessionTypeLabel(selection.session.sessionType, locale),
          },
          { label: detailText.labels.createdAt, value: formatTimelineDateTime(selection.session.createdAt, locale) },
          { label: detailText.labels.updatedAt, value: formatTimelineDateTime(selection.session.updatedAt, locale) },
        ]
      : [
          { label: detailText.labels.startedAt, value: formatTimelineDateTime(selection.event.startedAt, locale) },
          {
            label: detailText.labels.endedAt,
            value: selection.event.endedAt ? formatTimelineDateTime(selection.event.endedAt, locale) : detailText.empty,
          },
          { label: detailText.labels.durationSeconds, value: formatDurationSeconds(selection.event.durationSeconds, locale) },
          { label: detailText.labels.sourceType, value: timelineSourceTypeLabel(selection.event.sourceType, locale) },
          { label: detailText.labels.appName, value: selection.event.appName },
          { label: detailText.labels.windowTitle, value: selection.event.windowTitle },
          { label: detailText.labels.domain, value: selection.event.domain ?? detailText.empty },
          { label: detailText.labels.url, value: selection.event.url ?? detailText.empty },
          { label: detailText.labels.browserName, value: selection.event.browserName ?? detailText.empty },
          { label: detailText.labels.sourceLabel, value: selection.event.sourceLabel },
          { label: detailText.labels.classification, value: classificationLabel(selection.event.classification, text) },
          { label: detailText.labels.category, value: categoryLabel(selection.event.category, locale) },
          { label: detailText.labels.matchedRuleId, value: selection.event.matchedRuleId ?? detailText.empty },
          { label: detailText.labels.isIdle, value: selection.event.isIdle ? "true" : "false" },
          { label: detailText.labels.confidence, value: `${Math.round(selection.event.confidence * 100)}%` },
          { label: detailText.labels.createdAt, value: formatTimelineDateTime(selection.event.createdAt, locale) },
        ];

  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div
        className="modal-panel glass soft-panel timeline-detail-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="panel-head">
          <div>
            <p className="eyebrow">{detailText.field}</p>
            <h2>{detailText.title}</h2>
          </div>
          <button className="icon-close" onClick={props.onClose} type="button">
            <CloseIcon />
          </button>
        </div>

        <div className="timeline-detail-grid">
          {rows.map((row) => (
            <div className="timeline-detail-row" key={row.label}>
              <strong>{row.label}</strong>
              <p>{row.value}</p>
            </div>
          ))}
        </div>

        <div className="rules-detail-actions">
          <button className="ghost-button" onClick={props.onClose} type="button">
            {detailText.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineView(props: {
  sessions: StudySession[];
  events: ActivityEvent[];
  locale: Locale;
  text: Copy;
  onDeleteStudySession: (id: string) => Promise<void>;
}) {
  const { sessions, events, locale, text } = props;
  const [viewMode, setViewMode] = useState<TimelineViewMode>("sessions");
  const [classificationFilter, setClassificationFilter] = useState<TimelineClassificationFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<TimelineSourceFilter>("all");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<TimelineDetailSelection>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StudySession | null>(null);

  const timelineText = locale === "zh"
    ? {
        sessions: "学习记录",
        events: "详细记录",
        all: "全部",
        app: "应用",
        site: "网站",
        searchPlaceholder:
          viewMode === "sessions"
            ? "搜索来源、应用、域名或备注"
            : "搜索来源、应用、域名、标题或网址",
        count:
          viewMode === "sessions"
            ? `${sessions.length} 条学习记录`
            : `${events.length} 条详细记录`,
        emptyTitle: "今天还没有追踪到记录",
        emptyDescription: "开始一次学习后，StudyFlow 会在这里显示完整片段和原始记录。",
        filteredTitle: "没有匹配当前筛选条件的记录",
        filteredDescription: "试试调整视图、分类、来源或搜索关键词。",
        details: "详情",
        delete: "删除",
        deleteTitle: "删除这条学习记录？",
        deleteDescription: "这会同时删除对应的学习记录和原始记录，且无法恢复。",
        deleteConfirm: "确认删除",
        deleteCancel: "取消",
        backToTop: "回到顶部",
        sourceType: "来源类型",
        confidence: "可信度",
      }
    : {
        sessions: "Study Log",
        events: "Detailed Log",
        all: "All",
        app: "App",
        site: "Site",
        searchPlaceholder:
          viewMode === "sessions"
            ? "Search source, app, domain, or note"
            : "Search source, app, domain, title, or URL",
        count:
          viewMode === "sessions"
            ? `${sessions.length} study records`
            : `${events.length} detailed records`,
        emptyTitle: "No records tracked today",
        emptyDescription: "Once you start studying, StudyFlow will show complete sessions and raw records here.",
        filteredTitle: "No records match the current filters",
        filteredDescription: "Try adjusting the view, classification, source, or search keyword.",
        details: "Details",
        delete: "Delete",
        deleteTitle: "Delete this study record?",
        deleteDescription: "This will also delete the linked raw activity record and cannot be undone.",
        deleteConfirm: "Delete",
        deleteCancel: "Cancel",
        backToTop: "Back to top",
        sourceType: "Source type",
        confidence: "Confidence",
      };

  const classificationOptions: Array<{ value: TimelineClassificationFilter; label: string }> =
    viewMode === "sessions"
      ? [{ value: "all", label: timelineText.all }, { value: "study", label: text.classification.study }]
      : [
          { value: "all", label: timelineText.all },
          { value: "study", label: text.classification.study },
          { value: "distraction", label: text.classification.distraction },
          { value: "neutral", label: text.classification.neutral },
        ];

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesClassification = classificationFilter === "all" || classificationFilter === "study";
      const matchesSource = matchesTimelineSourceFilterForSession(session, sourceFilter);
      const matchesSearch =
        !normalizedSearch ||
        session.sourceLabel.toLowerCase().includes(normalizedSearch) ||
        (session.primaryAppName ?? "").toLowerCase().includes(normalizedSearch) ||
        (session.primaryDomain ?? "").toLowerCase().includes(normalizedSearch) ||
        session.note.toLowerCase().includes(normalizedSearch);
      return matchesClassification && matchesSource && matchesSearch;
    });
  }, [classificationFilter, normalizedSearch, sessions, sourceFilter]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesClassification =
        classificationFilter === "all" || event.classification === classificationFilter;
      const matchesSource = matchesTimelineSourceFilterForEvent(event, sourceFilter);
      const matchesSearch =
        !normalizedSearch ||
        event.sourceLabel.toLowerCase().includes(normalizedSearch) ||
        event.appName.toLowerCase().includes(normalizedSearch) ||
        (event.domain ?? "").toLowerCase().includes(normalizedSearch) ||
        event.windowTitle.toLowerCase().includes(normalizedSearch) ||
        (event.url ?? "").toLowerCase().includes(normalizedSearch);
      return matchesClassification && matchesSource && matchesSearch;
    });
  }, [classificationFilter, events, normalizedSearch, sourceFilter]);

  const hasAnyData = viewMode === "sessions" ? sessions.length > 0 : events.length > 0;
  const isFilteredEmpty = viewMode === "sessions" ? filteredSessions.length === 0 : filteredEvents.length === 0;

  useEffect(() => {
    const scrollArea = document.querySelector<HTMLDivElement>(".timeline-scroll-area");
    if (!scrollArea) {
      return;
    }

    const handleScroll = () => {
      setShowScrollTop(scrollArea.scrollTop > 240);
    };

    handleScroll();
    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

  return (
    <div className="page timeline-page">
      <section className="timeline-workspace">
        <div className="timeline-toolbar-shell">
          <div className="timeline-toolbar">
            <div className="timeline-toolbar-row">
              <div className="timeline-search-block">
                <p className="eyebrow timeline-eyebrow">TIMELINE</p>
                <label className="rule-search-shell timeline-search-shell">
                  <span className="rule-search-icon" aria-hidden="true">
                    <SearchIcon />
                  </span>
                  <input
                    className="rule-search-input"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={timelineText.searchPlaceholder}
                    value={search}
                  />
                </label>
              </div>

              <div className="timeline-filter-groups">
                <div className="timeline-filter-row">
                  <SegmentedButtonGroup
                    value={viewMode}
                    options={[
                      { value: "sessions", label: timelineText.sessions },
                      { value: "events", label: timelineText.events },
                    ]}
                    onChange={(next) => {
                      setViewMode(next);
                      setClassificationFilter("all");
                    }}
                  />
                  <SegmentedButtonGroup
                    value={classificationFilter}
                    options={classificationOptions}
                    onChange={setClassificationFilter}
                  />
                </div>
                <div className="timeline-filter-row timeline-filter-row-secondary">
                  <SegmentedButtonGroup
                    value={sourceFilter}
                    options={[
                      { value: "all", label: timelineText.all },
                      { value: "app", label: timelineText.app },
                      { value: "site", label: timelineText.site },
                    ]}
                    onChange={setSourceFilter}
                  />
                  <span className="muted-tag">{timelineText.count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-scroll-area">
          <section className="timeline-record-list">
            {!hasAnyData ? (
              <article className="timeline-empty-state">
                <strong>{timelineText.emptyTitle}</strong>
                <p>{timelineText.emptyDescription}</p>
              </article>
            ) : isFilteredEmpty ? (
              <article className="timeline-empty-state">
                <strong>{timelineText.filteredTitle}</strong>
                <p>{timelineText.filteredDescription}</p>
              </article>
            ) : null}

            {viewMode === "sessions"
              ? filteredSessions.map((session) => (
                  <article key={session.id} className="timeline-record-row">
                    <div className="timeline-record-time">
                      <strong>{formatTimeRange(session.startedAt, session.endedAt, locale)}</strong>
                      <span>{formatDurationSeconds(session.durationSeconds, locale)}</span>
                    </div>

                    <div className="timeline-record-icon-column">
                      <TimelineRecordIcon kind={timelineIconKindForSession(session)} />
                    </div>

                    <div className="timeline-record-label">
                      <strong>{session.sourceLabel}</strong>
                    </div>

                    <div className="timeline-record-app">
                      <span>
                        {session.primaryAppName ?? (locale === "zh" ? "未知应用" : "Unknown app")}
                        {session.primaryDomain ? ` · ${session.primaryDomain}` : ""}
                      </span>
                    </div>

                    <div className="timeline-record-tags">
                      <span className={`classification ${session.classification}`}>
                        {classificationLabel(session.classification, text)}
                      </span>
                      <span className="timeline-tag-chip">{categoryLabel(session.category, locale)}</span>
                    </div>

                    <div className="timeline-record-actions">
                      <button
                        className="ghost-button timeline-detail-button"
                        onClick={() => setSelection({ mode: "sessions", session })}
                        type="button"
                      >
                        {timelineText.details}
                      </button>
                      <button
                        className="ghost-button timeline-delete-button"
                        onClick={() => setPendingDelete(session)}
                        type="button"
                      >
                        {timelineText.delete}
                      </button>
                    </div>
                  </article>
            ))
              : filteredEvents.map((event) => (
                  <article key={event.id} className="timeline-record-row">
                    <div className="timeline-record-time">
                      <strong>{formatTimeRange(event.startedAt, event.endedAt, locale)}</strong>
                      <span>{formatDurationSeconds(event.durationSeconds, locale)}</span>
                    </div>

                    <div className="timeline-record-icon-column">
                      <TimelineRecordIcon kind={timelineIconKindForEvent(event)} />
                    </div>

                    <div className="timeline-record-label">
                      <strong>{event.sourceLabel}</strong>
                    </div>

                    <div className="timeline-record-app">
                      <span>
                        {event.sourceType === "browser"
                          ? `${event.browserName ?? event.appName}${event.domain ? ` · ${event.domain}` : ""}`
                          : event.appName}
                      </span>
                    </div>

                    <div className="timeline-record-tags">
                      <span className={`classification ${event.classification}`}>
                        {classificationLabel(event.classification, text)}
                      </span>
                      <span className="timeline-tag-chip">{categoryLabel(event.category, locale)}</span>
                    </div>

                    <div className="timeline-record-actions">
                      <button
                        className="ghost-button timeline-detail-button"
                        onClick={() => setSelection({ mode: "events", event })}
                        type="button"
                      >
                        {timelineText.details}
                      </button>
                    </div>
                  </article>
                ))}
          </section>
        </div>

        {showScrollTop ? (
          <button
            className="timeline-scroll-top"
            onClick={() =>
              document
                .querySelector<HTMLDivElement>(".timeline-scroll-area")
                ?.scrollTo({ top: 0, behavior: "smooth" })
            }
            type="button"
          >
            {timelineText.backToTop}
          </button>
        ) : null}
      </section>

      <TimelineDetailModal locale={locale} onClose={() => setSelection(null)} selection={selection} text={text} />
      {pendingDelete ? (
        <ConfirmDialog
          cancelLabel={timelineText.deleteCancel}
          confirmLabel={timelineText.deleteConfirm}
          description={timelineText.deleteDescription}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            void props.onDeleteStudySession(pendingDelete.id).then(() => setPendingDelete(null));
          }}
          title={timelineText.deleteTitle}
          tone="danger"
        />
      ) : null}
    </div>
  );
}

type RuleObjectKind = "app" | "site";

function ruleObjectKind(ruleType: RuleType): RuleObjectKind {
  switch (ruleType) {
    case "domain_equals":
    case "url_prefix":
    case "url_contains":
      return "site";
    default:
      return "app";
  }
}

function objectKindLabel(kind: RuleObjectKind, locale: Locale) {
  if (locale === "zh") {
    return kind === "app" ? "应用" : "网站";
  }
  return kind === "app" ? "App" : "Site";
}

function nextRuleTypeForKind(kind: RuleObjectKind, currentType?: RuleType): RuleType {
  if (kind === "site") {
    return currentType === "url_prefix" || currentType === "url_contains" || currentType === "domain_equals"
      ? currentType
      : "domain_equals";
  }

  return currentType === "window_title_contains" || currentType === "app_name_equals"
    ? currentType
    : "app_name_equals";
}

function ruleTypeDetailLabel(type: RuleType, locale: Locale) {
  const labelsZh: Record<RuleType, string> = {
    app_name_equals: "应用名",
    window_title_contains: "标题关键词",
    domain_equals: "域名规则",
    url_prefix: "网址前缀",
    url_contains: "网址包含",
  };
  const labelsEn: Record<RuleType, string> = {
    app_name_equals: "App name",
    window_title_contains: "Title keyword",
    domain_equals: "Domain",
    url_prefix: "URL prefix",
    url_contains: "URL contains",
  };
  return locale === "zh" ? labelsZh[type] : labelsEn[type];
}

function categoryLabel(category: StudyCategory, locale: Locale) {
  const labelsZh: Record<StudyCategory, string> = {
    flashcard: "刷卡",
    note: "笔记",
    reading: "阅读",
    course: "课程",
    video_course: "视频课程",
    coding: "编码",
    general: "通用",
  };
  const labelsEn: Record<StudyCategory, string> = {
    flashcard: "Flashcard",
    note: "Notes",
    reading: "Reading",
    course: "Course",
    video_course: "Video course",
    coding: "Coding",
    general: "General",
  };
  return locale === "zh" ? labelsZh[category] : labelsEn[category];
}

const presetRuleInputs: Record<"coding" | "language" | "notes", RuleInput> = {
  coding: {
    name: "编程学习包",
    type: "domain_equals",
    pattern: "leetcode.cn",
    classification: "study",
    category: "coding",
    sourceLabel: "算法刷题",
    priority: 95,
    presetKey: "coding",
    enabled: true,
  },
  language: {
    name: "英语学习包",
    type: "app_name_equals",
    pattern: "Anki",
    classification: "study",
    category: "flashcard",
    sourceLabel: "英语 Anki",
    priority: 90,
    presetKey: "language",
    enabled: true,
  },
  notes: {
    name: "笔记整理包",
    type: "app_name_equals",
    pattern: "Obsidian",
    classification: "study",
    category: "note",
    sourceLabel: "Obsidian 笔记",
    priority: 90,
    presetKey: "notes",
    enabled: true,
  },
};

function defaultRuleInputForKind(kind: RuleObjectKind, locale: Locale): RuleInput {
  if (kind === "app") {
    return {
      name: locale === "zh" ? "新的应用规则" : "New app rule",
      type: "app_name_equals",
      pattern: "",
      classification: "study",
      category: "general",
      sourceLabel: locale === "zh" ? "应用学习" : "App study",
      priority: 90,
      enabled: true,
      presetKey: "custom",
    };
  }

  if (kind === "site") {
    return {
      name: locale === "zh" ? "新的网站规则" : "New site rule",
      type: "domain_equals",
      pattern: "",
      classification: "study",
      category: "course",
      sourceLabel: locale === "zh" ? "课程网站" : "Course site",
      priority: 95,
      enabled: true,
      presetKey: "custom",
    };
  }

  return {
    name: locale === "zh" ? "新的应用规则" : "New app rule",
    type: "window_title_contains",
    pattern: "",
    classification: "neutral",
    category: "general",
    sourceLabel: locale === "zh" ? "应用规则" : "App rule",
    priority: 80,
    enabled: true,
    presetKey: "custom",
  };
}

function RuleCreateModal(props: {
  locale: Locale;
  text: Copy;
  onClose: () => void;
  onCreate: (input: RuleInput) => Promise<void>;
}) {
  const [kind, setKind] = useState<RuleObjectKind>("app");
  const [draft, setDraft] = useState<RuleInput>(() => defaultRuleInputForKind("app", props.locale));

  useEffect(() => {
    setDraft(defaultRuleInputForKind(kind, props.locale));
  }, [kind, props.locale]);

  const categoryOptions: Array<{ value: StudyCategory; label: string }> = [
    { value: "flashcard", label: categoryLabel("flashcard", props.locale) },
    { value: "note", label: categoryLabel("note", props.locale) },
    { value: "reading", label: categoryLabel("reading", props.locale) },
    { value: "course", label: categoryLabel("course", props.locale) },
    { value: "coding", label: categoryLabel("coding", props.locale) },
    { value: "general", label: categoryLabel("general", props.locale) },
  ];

  async function handleSubmit() {
    if (!draft.name.trim() || !draft.pattern.trim() || !draft.sourceLabel.trim()) {
      return;
    }

    await props.onCreate({
      ...draft,
      name: draft.name.trim(),
      pattern: draft.pattern.trim(),
      sourceLabel: draft.sourceLabel.trim(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div className="modal-panel glass soft-panel rules-modal-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{props.text.rules.presetsEyebrow}</p>
            <h2>{props.text.rules.add}</h2>
          </div>
          <button className="icon-close" onClick={props.onClose} type="button">
            <CloseIcon />
          </button>
        </div>

        <div className="rules-preset-grid">
          {props.text.rules.defaults.map((item, index) => {
            const presetKey = (["coding", "language", "notes"] as const)[index];
            return (
              <button
                className="modal-option rule-preset-option"
                key={item.title}
                onClick={() => void props.onCreate(presetRuleInputs[presetKey])}
                type="button"
              >
                <span className="preset-badge">{item.badge}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </button>
            );
          })}
        </div>

        <section className="rule-editor-section">
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{props.locale === "zh" ? "对象类型" : "Object type"}</span>
              <DropdownSelect
                value={kind}
                options={[
                  { value: "app", label: objectKindLabel("app", props.locale) },
                  { value: "site", label: objectKindLabel("site", props.locale) },
                ]}
                onChange={setKind}
              />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "规则名称" : "Rule name"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} value={draft.name} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "匹配内容" : "Pattern"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, pattern: event.target.value }))} value={draft.pattern} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "匹配方式" : "Match mode"}</span>
              <SegmentedButtonGroup
                value={draft.type}
                options={
                  kind === "site"
                    ? [
                        { value: "domain_equals", label: props.locale === "zh" ? "域名" : "Domain" },
                        { value: "url_prefix", label: props.locale === "zh" ? "网址前缀" : "URL prefix" },
                        { value: "url_contains", label: props.locale === "zh" ? "网址包含" : "URL contains" },
                      ]
                    : [
                        { value: "app_name_equals", label: props.locale === "zh" ? "应用名" : "App name" },
                        { value: "window_title_contains", label: props.locale === "zh" ? "标题关键词" : "Title keyword" },
                      ]
                }
                onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
              />
            </label>

            {kind === "site" ? (
              <label className="rule-field">
                <span>{props.locale === "zh" ? "网址建议" : "URL tip"}</span>
                <input
                  className="rule-input"
                  readOnly
                  value={props.locale === "zh" ? "域名用于整个网站，网址规则用于更具体页面。" : "Use domain for a whole site, URL rules for specific pages."}
                />
              </label>
            ) : null}

            <label className="rule-field">
              <span>{props.locale === "zh" ? "判定结果" : "Classification"}</span>
              <SegmentedButtonGroup
                value={draft.classification}
                options={[
                  { value: "study", label: props.locale === "zh" ? "学习" : "Study" },
                  { value: "distraction", label: props.locale === "zh" ? "娱乐" : "Distraction" },
                  { value: "neutral", label: props.locale === "zh" ? "中性" : "Neutral" },
                ]}
                onChange={(next) => setDraft((current) => ({ ...current, classification: next }))}
              />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "学习类型" : "Study category"}</span>
              <DropdownSelect
                value={draft.category}
                options={categoryOptions}
                onChange={(next) => setDraft((current) => ({ ...current, category: next }))}
              />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "展示标签" : "Source label"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, sourceLabel: event.target.value }))} value={draft.sourceLabel} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "优先级" : "Priority"}</span>
              <input
                className="rule-input"
                min={1}
                max={100}
                onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) || current.priority }))}
                type="number"
                value={draft.priority}
              />
            </label>
          </div>
        </section>

        <div className="rules-detail-actions">
          <button className="ghost-button" onClick={props.onClose} type="button">
            {props.locale === "zh" ? "取消" : "Cancel"}
          </button>
          <button className="primary-button" onClick={() => void handleSubmit()} type="button">
            {props.locale === "zh" ? "保存规则" : "Save rule"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="m14.2 14.2 4.1 4.1" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function ConfirmDialog(props: {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="confirm-overlay" role="presentation">
      <div className="modal-panel glass soft-panel confirm-modal-panel" role="dialog" aria-modal="true" aria-label={props.title}>
        <div className="confirm-modal-body">
          <p className="eyebrow">{props.title}</p>
          <p className="confirm-modal-description">{props.description}</p>
        </div>
        <div className="confirm-modal-actions">
          <button className="ghost-button action-button" onClick={props.onCancel} type="button">
            {props.cancelLabel}
          </button>
          <button
            className={`primary-button action-button ${props.tone === "danger" ? "danger-button" : ""}`.trim()}
            onClick={props.onConfirm}
            type="button"
          >
            {props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DropdownSelect<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = props.options.find((option) => option.value === props.value) ?? props.options[0];

  return (
    <div
      className={`dropdown-select ${open ? "open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        aria-expanded={open}
        className="dropdown-select-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{selected?.label}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <div className="dropdown-select-menu" role="listbox">
          {props.options.map((option) => (
            <button
              className={`dropdown-select-option ${option.value === props.value ? "active" : ""}`}
              key={option.value}
              onClick={() => {
                props.onChange(option.value);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChoiceChipGroup<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="choice-chip-group">
      {props.options.map((option) => (
        <button
          key={option.value}
          className={`choice-chip ${props.value === option.value ? "active" : ""}`}
          onClick={() => props.onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function RuleDetailPanel(props: {
  rule: Rule;
  locale: Locale;
  text: Copy;
  onUpdate: (id: string, input: Partial<RuleInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const { locale, rule, text } = props;
  const [draft, setDraft] = useState<Rule>(rule);
  const [pendingAction, setPendingAction] = useState<null | "delete">(null);

  useEffect(() => {
    setDraft(rule);
  }, [rule]);

  const objectKind = ruleObjectKind(draft.type);
  const isDirty =
    draft.name !== rule.name ||
    draft.type !== rule.type ||
    draft.pattern !== rule.pattern ||
    draft.classification !== rule.classification ||
    draft.category !== rule.category ||
    draft.sourceLabel !== rule.sourceLabel ||
    draft.priority !== rule.priority ||
    draft.enabled !== rule.enabled;

  const categoryOptions: Array<{ value: StudyCategory; label: string }> = [
    { value: "flashcard", label: categoryLabel("flashcard", locale) },
    { value: "note", label: categoryLabel("note", locale) },
    { value: "reading", label: categoryLabel("reading", locale) },
    { value: "course", label: categoryLabel("course", locale) },
    { value: "coding", label: categoryLabel("coding", locale) },
    { value: "general", label: categoryLabel("general", locale) },
  ];

  const objectKindOptions: Array<{ value: RuleObjectKind; label: string }> = [
    { value: "app", label: objectKindLabel("app", locale) },
    { value: "site", label: objectKindLabel("site", locale) },
  ];

  async function confirmDelete() {
    await props.onDelete(rule.id);
    props.onNotice(locale === "zh" ? "规则已删除" : "Rule deleted");
  }

  function confirmReset() {
    setDraft(rule);
    props.onNotice(locale === "zh" ? "已取消改动" : "Changes discarded");
  }

  async function confirmSave() {
    await props.onUpdate(rule.id, {
      name: draft.name,
      type: draft.type,
      pattern: draft.pattern,
      classification: draft.classification,
      category: draft.category,
      sourceLabel: draft.sourceLabel,
      priority: draft.priority,
      enabled: draft.enabled,
      presetKey: draft.presetKey,
    });
    props.onNotice(locale === "zh" ? "规则已保存" : "Rule saved");
  }

  return (
    <div className="rules-detail">
      <div className="panel-head rules-detail-head">
        <div>
          <p className="eyebrow">{locale === "zh" ? "规则详情" : "Rule details"}</p>
          <h2>{draft.name}</h2>
        </div>
        <ToggleSwitch checked={draft.enabled} label={locale === "zh" ? "启用规则" : "Enable rule"} onChange={(next) => setDraft((current) => ({ ...current, enabled: next }))} />
      </div>

      <section className="rule-editor-section">
        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "基础信息" : "Basics"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "规则名称" : "Rule name"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} value={draft.name} />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "对象类型" : "Object type"}</span>
              <DropdownSelect
                value={objectKind}
                options={objectKindOptions}
                onChange={(next) =>
                  setDraft((current) => ({
                    ...current,
                    type: nextRuleTypeForKind(next, current.type),
                  }))
                }
              />
            </label>
          </div>
        </div>

        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "匹配条件" : "Match conditions"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "匹配方式" : "Match mode"}</span>
              {objectKind === "site" ? (
                <SegmentedButtonGroup
                  value={draft.type}
                  options={[
                    { value: "domain_equals", label: locale === "zh" ? "域名" : "Domain" },
                    { value: "url_prefix", label: locale === "zh" ? "网址前缀" : "URL prefix" },
                    { value: "url_contains", label: locale === "zh" ? "网址包含" : "URL contains" },
                  ]}
                  onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
                />
              ) : (
                <SegmentedButtonGroup
                  value={draft.type}
                  options={[
                    { value: "app_name_equals", label: locale === "zh" ? "应用名" : "App name" },
                    { value: "window_title_contains", label: locale === "zh" ? "标题关键词" : "Title keyword" },
                  ]}
                  onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
                />
              )}
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "匹配内容" : "Pattern"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, pattern: event.target.value }))} value={draft.pattern} />
            </label>
          </div>
        </div>

        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "识别结果" : "Recognition result"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "判定结果" : "Classification"}</span>
              <SegmentedButtonGroup
                value={draft.classification === "ignore" ? "neutral" : draft.classification}
                options={[
                  { value: "study", label: locale === "zh" ? "学习" : "Study" },
                  { value: "distraction", label: locale === "zh" ? "娱乐" : "Distraction" },
                  { value: "neutral", label: locale === "zh" ? "中性" : "Neutral" },
                ]}
                onChange={(next) => setDraft((current) => ({ ...current, classification: next as RuleClassification }))}
              />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "学习类型" : "Study category"}</span>
              <DropdownSelect
                value={draft.category}
                options={categoryOptions}
                onChange={(next) => setDraft((current) => ({ ...current, category: next }))}
              />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "展示标签" : "Source label"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, sourceLabel: event.target.value }))} value={draft.sourceLabel} />
            </label>
          </div>
        </div>

        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "优先级与命中" : "Priority and hits"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "优先级" : "Priority"}</span>
              <input className="rule-input" min={1} max={100} onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) || current.priority }))} type="number" value={draft.priority} />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "今日命中" : "Hits today"}</span>
              <input className="rule-input" readOnly value={String(draft.hitsToday)} />
            </label>
          </div>
        </div>
      </section>

      <div className="rules-detail-actions">
        <button className="ghost-button danger action-button" onClick={() => setPendingAction("delete")} type="button">
          {locale === "zh" ? "删除" : "Delete"}
        </button>
        <div className="rules-detail-actions-right">
          <button
            className="ghost-button action-button"
            onClick={() => {
              if (!isDirty) {
                setDraft(rule);
                return;
              }
              confirmReset();
            }}
            type="button"
          >
            {locale === "zh" ? "取消改动" : "Cancel"}
          </button>
          <button
            className="primary-button action-button"
            disabled={!isDirty}
            onClick={() => void confirmSave()}
            type="button"
          >
            {locale === "zh" ? "保存" : "Save"}
          </button>
        </div>
      </div>

      {pendingAction === "delete" ? (
        <ConfirmDialog
          cancelLabel={locale === "zh" ? "取消" : "Cancel"}
          confirmLabel={locale === "zh" ? "删除规则" : "Delete rule"}
          description={locale === "zh" ? "删除后这条规则将不再参与识别，且无法恢复。" : "This rule will stop participating in recognition and cannot be restored."}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            setPendingAction(null);
            void confirmDelete();
          }}
          title={locale === "zh" ? "删除这条规则？" : "Delete this rule?"}
          tone="danger"
        />
      ) : null}
    </div>
  );
}

function RulesView(props: {
  locale: Locale;
  rules: Rule[];
  text: Copy;
  onCreateRule: (input: RuleInput) => Promise<Rule>;
  onUpdateRule: (id: string, input: Partial<RuleInput>) => Promise<Rule>;
  onDeleteRule: (id: string) => Promise<void>;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localRules, setLocalRules] = useState(props.rules);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(props.rules[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<"all" | Classification>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | RuleObjectKind>("all");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { locale, text } = props;

  useEffect(() => {
    setLocalRules(props.rules);
    setSelectedRuleId((current) => current ?? props.rules[0]?.id ?? null);
  }, [props.rules]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filteredRules = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return localRules.filter((rule) => {
      const matchesSearch =
        !searchValue ||
        rule.name.toLowerCase().includes(searchValue) ||
        rule.pattern.toLowerCase().includes(searchValue) ||
        rule.sourceLabel.toLowerCase().includes(searchValue);
      const matchesClassification = classificationFilter === "all" || rule.classification === classificationFilter;
      const matchesSource = sourceFilter === "all" || ruleObjectKind(rule.type) === sourceFilter;
      return matchesSearch && matchesClassification && matchesSource;
    });
  }, [classificationFilter, localRules, search, sourceFilter]);

  const selectedRule =
    filteredRules.find((rule) => rule.id === selectedRuleId) ??
    localRules.find((rule) => rule.id === selectedRuleId) ??
    filteredRules[0] ??
    null;

  useEffect(() => {
    if (selectedRule && selectedRule.id !== selectedRuleId) {
      setSelectedRuleId(selectedRule.id);
    }
  }, [selectedRule, selectedRuleId]);

  async function handleCreateRule(input: RuleInput) {
    const created = await props.onCreateRule(input);
    setLocalRules((current) => [created, ...current]);
    setSelectedRuleId(created.id);
    setIsCreateOpen(false);
    setFeedback(locale === "zh" ? "规则已创建" : "Rule created");
  }

  async function handleUpdateRule(id: string, input: Partial<RuleInput>) {
    const updated = await props.onUpdateRule(id, input);
    setLocalRules((current) => current.map((rule) => (rule.id === id ? updated : rule)));
  }

  async function handleDeleteRule(id: string) {
    await props.onDeleteRule(id);
    setLocalRules((current) => current.filter((rule) => rule.id !== id));
    setSelectedRuleId((current) => (current === id ? null : current));
  }

  return (
    <div className="page rules-page">
      <section className="rules-workspace">
        <div className="rules-list-panel glass soft-panel">
          <div className="rules-toolbar">
            <div className="rules-search-row">
              <label className="rule-search-shell">
                <span className="rule-search-icon" aria-hidden="true">
                  <SearchIcon />
                </span>
                <input
                  className="rule-search-input"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={locale === "zh" ? "搜索规则名称、匹配内容、展示标签" : "Search name, pattern, or label"}
                  value={search}
                />
              </label>
              <button className="primary-button" onClick={() => setIsCreateOpen(true)} type="button">
                + {text.rules.add}
              </button>
            </div>
            <SegmentedButtonGroup
              value={sourceFilter}
              options={[
                { value: "all", label: locale === "zh" ? "全部" : "All" },
                { value: "app", label: objectKindLabel("app", locale) },
                { value: "site", label: objectKindLabel("site", locale) },
              ]}
              onChange={setSourceFilter}
            />
            <SegmentedButtonGroup
              value={classificationFilter}
              options={[
                { value: "all", label: locale === "zh" ? "全部" : "All" },
                { value: "study", label: locale === "zh" ? "学习" : "Study" },
                { value: "distraction", label: locale === "zh" ? "娱乐" : "Distraction" },
                { value: "neutral", label: locale === "zh" ? "中性" : "Neutral" },
              ]}
              onChange={setClassificationFilter}
            />
          </div>

          <div className="rules-list">
            {filteredRules.map((rule) => {
              const objectKind = ruleObjectKind(rule.type);
              const displayClassification = rule.classification === "ignore" ? "neutral" : rule.classification;
              return (
                <button
                  className={`rule-list-item ${selectedRule?.id === rule.id ? "active" : ""}`}
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  type="button"
                >
                  <div className="rule-list-head">
                    <strong>{rule.name}</strong>
                    <span className={`toggle ${rule.enabled ? "on" : ""}`}>
                      {rule.enabled ? text.rules.enabled : text.rules.disabled}
                    </span>
                  </div>
                  <div className="rule-list-line compact">
                    <span className="rule-object-pill">{objectKindLabel(objectKind, locale)}</span>
                    <span className="rule-list-pattern">{rule.pattern}</span>
                  </div>
                  <div className="rule-list-meta">
                    <span className={`classification ${displayClassification}`}>
                      {classificationLabel(displayClassification, text)}
                    </span>
                    <span>{categoryLabel(rule.category, locale)}</span>
                    <span>{locale === "zh" ? `今日命中 ${rule.hitsToday}` : `Hits ${rule.hitsToday}`}</span>
                    <span>P{rule.priority}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rules-detail-panel glass soft-panel">
          {selectedRule ? (
            <RuleDetailPanel
              locale={locale}
              onDelete={handleDeleteRule}
              onNotice={setFeedback}
              onUpdate={handleUpdateRule}
              rule={selectedRule}
              text={text}
            />
          ) : (
            <div className="rules-empty-state">
              <strong>{locale === "zh" ? "没有匹配的规则" : "No matching rules"}</strong>
              <p>{locale === "zh" ? "试试调整筛选条件，或新建一条规则。" : "Try changing filters or create a new rule."}</p>
            </div>
          )}
          {feedback ? <div className="rules-feedback">{feedback}</div> : null}
        </div>
      </section>

      {isCreateOpen ? <RuleCreateModal locale={locale} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateRule} text={text} /> : null}
    </div>
  );
}

function SegmentedButtonGroup<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented-control">
      {props.options.map((option) => (
        <button
          key={option.value}
          className={`segmented-option ${props.value === option.value ? "active" : ""}`}
          onClick={() => props.onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ToggleSwitch(props: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      aria-label={props.label}
      aria-pressed={props.checked}
      className={`switch ${props.checked ? "on" : ""}`}
      onClick={() => props.onChange(!props.checked)}
      type="button"
    >
      <span className="switch-thumb" />
    </button>
  );
}

function SettingsView(props: {
  config: TrackingConfig;
  meta: SettingsMeta;
  locale: Locale;
  themeMode: ThemeMode;
  text: Copy;
  onLocaleChange: (locale: Locale) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onUpdateSettings: (input: Partial<TrackingConfig>) => Promise<void>;
  onTrackingStatusChange: (enabled: boolean) => Promise<void>;
}) {
  const { config, meta, locale, themeMode, text } = props;
  const [feedback, setFeedback] = useState<string | null>(null);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 1800);
  }

  const idleOptions = [
    { value: 1, label: locale === "zh" ? "1 分钟" : "1 min" },
    { value: 5, label: locale === "zh" ? "5 分钟" : "5 min" },
    { value: 10, label: locale === "zh" ? "10 分钟" : "10 min" },
    { value: 20, label: locale === "zh" ? "20 分钟" : "20 min" },
  ];

  const statusCards = [
    {
      label: text.settings.statusCards.tracking,
      value: meta.trackingStatus === "active" ? text.settings.values.active : text.settings.values.paused,
      helper: text.settings.helpers.trackingStatus,
    },
    {
      label: text.settings.statusCards.browserExtension,
      value: meta.browserExtensionConnected ? text.settings.values.connected : text.settings.values.disconnected,
      helper: text.settings.helpers.browserExtension,
    },
    {
      label: text.settings.statusCards.database,
      value: text.settings.values[meta.databaseStatus],
      helper: text.settings.helpers.databaseHealth,
    },
  ];

  const diagnosticsRows = [
    {
      label: text.settings.fields.browserExtension,
      value: meta.browserExtensionConnected ? text.settings.values.connected : text.settings.values.disconnected,
    },
    {
      label: text.settings.fields.lastSyncAt,
      value: meta.lastBrowserSyncAt
        ? new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(meta.lastBrowserSyncAt))
        : text.settings.values.unavailable,
    },
    {
      label: text.settings.fields.databaseHealth,
      value: text.settings.values[meta.databaseStatus],
    },
    {
      label: text.settings.fields.appVersion,
      value: meta.appVersion,
    },
  ];

  async function handleExport() {
    const result = await trackerBridge.exportLocalData();
    if (result.success) {
      showFeedback(text.settings.values.exported);
    }
  }

  return (
    <div className="page settings-page">
      <div className="settings-header-inline">
        <div>
          <p className="eyebrow">{text.settings.eyebrow}</p>
        </div>
        <span className="muted-tag">{text.settings.windows}</span>
      </div>

      <section className="status-card-grid">
        {statusCards.map((card) => (
          <article className="settings-status-card glass soft-panel" key={card.label}>
            <div className="setting-title-inline settings-status-title">
              <span className="settings-status-label">{card.label}</span>
              <InlineInfoButton tooltip={card.helper} />
            </div>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="settings-groups">
        <div className="settings-column">
          <article className="settings-section glass soft-panel">
            <div className="settings-section-head">
              <p className="eyebrow">{text.settings.sections.general}</p>
              <p className="settings-section-description">{text.settings.descriptions.general}</p>
            </div>
            <div className="settings-stack">
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.lang}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.language} />
                </div>
                <SegmentedButtonGroup
                  value={locale}
                  options={[
                    { label: "中文", value: "zh" },
                    { label: "English", value: "en" },
                  ]}
                  onChange={props.onLocaleChange}
                />
              </div>
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.theme}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.theme} />
                </div>
                <SegmentedButtonGroup
                  value={themeMode}
                  options={[
                    { label: text.themeModes.dark, value: "dark" },
                    { label: text.themeModes.light, value: "light" },
                    { label: text.themeModes.system, value: "system" },
                  ]}
                  onChange={props.onThemeChange}
                />
              </div>
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.timerStyle}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.timerStyle} />
                </div>
                <SegmentedButtonGroup
                  value={config.dashboardTimerStyle}
                  options={[
                    { label: text.settings.values.timerDial, value: "dial" },
                    { label: text.settings.values.timerFlip, value: "flip" },
                  ]}
                  onChange={(next) => void props.onUpdateSettings({ dashboardTimerStyle: next })}
                />
              </div>
            </div>
          </article>

          <article className="settings-section glass soft-panel">
            <div className="settings-section-head">
              <p className="eyebrow">{text.settings.sections.integrations}</p>
              <p className="settings-section-description">{text.settings.descriptions.integrations}</p>
            </div>
            <div className="settings-stack">
              {diagnosticsRows.slice(0, 2).map((row) => (
                <div className="setting-card setting-row readonly-row" key={row.label}>
                  <div className="setting-title-inline">
                    <strong>{row.label}</strong>
                    <InlineInfoButton
                      tooltip={
                        row.label === text.settings.fields.browserExtension
                          ? text.settings.helpers.browserExtension
                          : text.settings.helpers.lastSyncAt
                      }
                    />
                  </div>
                  <span className="setting-value">{row.value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="settings-section glass soft-panel data-section">
            <div className="settings-section-head">
              <p className="eyebrow">{text.settings.sections.data}</p>
              <p className="settings-section-description">{text.settings.descriptions.data}</p>
            </div>
            <div className="settings-stack">
              <div className="setting-card setting-row">
                <div>
                  <div className="setting-title-inline">
                    <strong>{text.settings.fields.export}</strong>
                    <InlineInfoButton tooltip={text.settings.helpers.export} />
                  </div>
                  <p className="setting-subtext">
                    {config.allowLocalExports ? text.settings.values.exportReady : text.settings.values.exportDisabled}
                  </p>
                </div>
                <button
                  className="secondary-button"
                  disabled={!config.allowLocalExports}
                  onClick={() => void handleExport()}
                  type="button"
                >
                  {text.settings.values.exportAction}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div className="settings-column">
          <article className="settings-section glass soft-panel">
            <div className="settings-section-head">
              <p className="eyebrow">{text.settings.sections.tracking}</p>
              <p className="settings-section-description">{text.settings.descriptions.tracking}</p>
            </div>
            <div className="settings-stack">
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.idle}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.idle} />
                </div>
                <SegmentedButtonGroup
                  value={String(config.idleThresholdMinutes)}
                  options={idleOptions.map((option) => ({
                    label: option.label,
                    value: String(option.value),
                  }))}
                  onChange={(next) => void props.onUpdateSettings({ idleThresholdMinutes: Number(next) })}
                />
              </div>
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.startup}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.startup} />
                </div>
                <ToggleSwitch
                  checked={config.launchOnStartup}
                  label={text.settings.fields.startup}
                  onChange={(next) => void props.onUpdateSettings({ launchOnStartup: next })}
                />
              </div>
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.tray}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.tray} />
                </div>
                <ToggleSwitch
                  checked={config.minimizeToTray}
                  label={text.settings.fields.tray}
                  onChange={(next) => void props.onUpdateSettings({ minimizeToTray: next })}
                />
              </div>
            </div>
          </article>

        <article className="settings-section glass soft-panel diagnostics-section">
          <div className="settings-section-head">
            <p className="eyebrow">{text.settings.sections.diagnostics}</p>
            <p className="settings-section-description">{text.settings.descriptions.diagnostics}</p>
          </div>
          <div className="settings-stack">
            <div className="setting-card setting-row">
              <div className="setting-title-inline">
                <strong>{text.settings.fields.trackingStatus}</strong>
                <InlineInfoButton tooltip={text.settings.helpers.trackingStatus} />
              </div>
              <ToggleSwitch
                checked={meta.trackingStatus === "active"}
                label={text.settings.fields.trackingStatus}
                onChange={(next) => {
                  void props.onTrackingStatusChange(next).then(() => {
                    showFeedback(next ? text.settings.values.active : text.settings.values.paused);
                  });
                }}
              />
            </div>
            {diagnosticsRows.slice(2).map((row) => (
              <div className="setting-card setting-row readonly-row" key={row.label}>
                <div className="setting-title-inline">
                  <strong>{row.label}</strong>
                  <InlineInfoButton
                    tooltip={
                      row.label === text.settings.fields.databaseHealth
                        ? text.settings.helpers.databaseHealth
                        : text.settings.helpers.appVersion
                    }
                  />
                </div>
                <span className="setting-value">{row.value}</span>
              </div>
            ))}
          </div>
        </article>
        </div>
      </section>

      {feedback ? <div className="settings-feedback muted-tag">{feedback}</div> : null}
    </div>
  );
}

export default function AppShell() {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialThemeMode());
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => resolveTheme(getInitialThemeMode()));
  const [isMaximized, setIsMaximized] = useState(false);
  const [snapshot, setSnapshot] = useState<TrackingSnapshot | null>(null);
  const [daily, setDaily] = useState<DailySummary | null>(null);
  const [weekly, setWeekly] = useState<DailySummary[]>([]);
  const [sources, setSources] = useState<SourceBreakdown[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [settingsMeta, setSettingsMeta] = useState<SettingsMeta | null>(null);
  const text = useMemo(() => copy[locale], [locale]);

  useEffect(() => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const startAlignedClock = () => {
      setCurrentTimeMs(Date.now());

      const delayToNextSecond = Math.max(0, 1000 - (Date.now() % 1000));
      timeoutId = window.setTimeout(() => {
        setCurrentTimeMs(Date.now());
        intervalId = window.setInterval(() => {
          setCurrentTimeMs(Date.now());
        }, 1000);
      }, delayToNextSecond);
    };

    startAlignedClock();

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    async function load() {
      const results = await Promise.all([
        trackerBridge.getTrackingSnapshot(),
        trackerBridge.getDailySummary(),
        trackerBridge.getWeeklySummary(),
        trackerBridge.listSourceBreakdown(),
        trackerBridge.listActivityEvents(),
        trackerBridge.listStudySessions(),
        trackerBridge.listRules(),
        trackerBridge.getSettings(),
        trackerBridge.getWindowState(),
        trackerBridge.getSettingsMeta(),
      ]);

      setSnapshot(results[0]);
      setDaily(results[1]);
      setWeekly(results[2]);
      setSources(results[3]);
      setEvents(results[4]);
      setSessions(results[5]);
      setRules(results[6]);
      setConfig(results[7]);
      setLocale(results[7].locale);
      setThemeMode(results[7].themeMode);
      setIsMaximized(results[8].isMaximized);
      setSettingsMeta(results[9]);
    }

    void load();
  }, []);

  useEffect(() => {
    if (activeView !== "settings") {
      return;
    }

    void trackerBridge.getSettingsMeta().then(setSettingsMeta);
  }, [activeView, config]);

  useEffect(() => {
    localStorage.setItem(storageKeys.locale, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    if (config && config.locale !== locale) {
      void trackerBridge.updateSettings({ locale }).then(setConfig);
    }
  }, [config, locale]);

  useEffect(() => {
    localStorage.setItem(storageKeys.theme, themeMode);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setResolvedTheme(resolveTheme(themeMode));
    apply();
    mediaQuery.addEventListener("change", apply);
    if (config && config.themeMode !== themeMode) {
      void trackerBridge.updateSettings({ themeMode }).then(setConfig);
    }
    return () => mediaQuery.removeEventListener("change", apply);
  }, [config, themeMode]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    void trackerBridge.setWindowTheme(resolvedTheme);
  }, [resolvedTheme]);

  async function syncWindowState() {
    const state = await trackerBridge.getWindowState();
    setIsMaximized(state.isMaximized);
  }

  async function handleToggleMaximize() {
    await trackerBridge.maximizeWindow();
    await syncWindowState();
  }

  async function handleUpdateSettings(input: Partial<TrackingConfig>) {
    setConfig((current) => (current ? { ...current, ...input } : current));
    const updated = await trackerBridge.updateSettings(input);
    setConfig(updated);
  }

  function handleToggleTimerStyle() {
    const current = config?.dashboardTimerStyle ?? "dial";
    const next = current === "dial" ? "flip" : "dial";
    void handleUpdateSettings({ dashboardTimerStyle: next });
  }

  async function handleCreateRule(input: RuleInput) {
    const created = await trackerBridge.createRule(input);
    setRules((current) => [created, ...current]);
    return created;
  }

  async function handleUpdateRule(id: string, input: Partial<RuleInput>) {
    const updated = await trackerBridge.updateRule(id, input);
    setRules((current) => current.map((rule) => (rule.id === id ? updated : rule)));
    return updated;
  }

  async function handleDeleteRule(id: string) {
    await trackerBridge.deleteRule(id);
    setRules((current) => current.filter((rule) => rule.id !== id));
  }

  async function handleDeleteStudySession(id: string) {
    await trackerBridge.deleteStudySession(id);
    setSessions((current) => current.filter((session) => session.id !== id));
    setEvents((current) => current.filter((event) => event.id !== id));
  }

  async function handleTrackingStatusChange(enabled: boolean) {
    const updatedMeta = await trackerBridge.setTrackingEnabled(enabled);
    setSettingsMeta(updatedMeta);
  }

  if (!snapshot || !daily || !config || !settingsMeta) {
    return <div className="loading-screen">{text.loading}</div>;
  }

  return (
    <div className="desktop-shell">
      <WindowTitleBar
        dashboardTimerStyle={config?.dashboardTimerStyle ?? "dial"}
        isMaximized={isMaximized}
        locale={locale}
        onClose={() => void trackerBridge.closeWindow()}
        onMaximize={() => void handleToggleMaximize()}
        onMinimize={() => void trackerBridge.minimizeWindow()}
        onToggleLocale={() => setLocale((current) => (current === "zh" ? "en" : "zh"))}
        onToggleTimerStyle={handleToggleTimerStyle}
        onToggleTheme={() => setThemeMode((current) => cycleTheme(current))}
        themeMode={themeMode}
      />

      <div className="app-frame">
        <aside className="sidebar-shell">
          <nav className="nav nav-vertical">
            {navOrder.map((view) => (
              <button
                key={view}
                className={`nav-item nav-tile ${activeView === view ? "active" : ""}`}
                onClick={() => setActiveView(view)}
                type="button"
              >
                <span className="nav-icon nav-icon-large" aria-hidden="true">
                  {navIcon(view)}
                </span>
                <span className="nav-label">{text.nav[view].label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="workspace-shell">
          <div className="workspace-scroll">
            <div className="workspace-panel">
                {activeView === "dashboard" ? (
                  <DashboardView
                    currentTimeMs={currentTimeMs}
                    dailySummary={daily}
                    locale={locale}
                    onOpenTimeline={() => setActiveView("timeline")}
                    sessions={sessions}
                    snapshot={snapshot}
                    sourceBreakdown={sources}
                    timerStyle={config?.dashboardTimerStyle ?? "dial"}
                    text={text}
                    weeklySummary={weekly}
                  />
                ) : null}
                {activeView === "timeline" ? (
                  <TimelineView
                    events={events}
                    locale={locale}
                    onDeleteStudySession={handleDeleteStudySession}
                    sessions={sessions}
                    text={text}
                  />
                ) : null}
                {activeView === "rules" ? (
                  <RulesView
                    locale={locale}
                    onCreateRule={handleCreateRule}
                    onDeleteRule={handleDeleteRule}
                    onUpdateRule={handleUpdateRule}
                    rules={rules}
                    text={text}
                  />
                ) : null}
                {activeView === "settings" ? (
                  <SettingsView
                    config={config}
                    locale={locale}
                    meta={settingsMeta}
                    onLocaleChange={setLocale}
                    onThemeChange={setThemeMode}
                    onTrackingStatusChange={handleTrackingStatusChange}
                    onUpdateSettings={handleUpdateSettings}
                    text={text}
                    themeMode={themeMode}
                  />
                ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
