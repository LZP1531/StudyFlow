import { useEffect, useMemo, useState } from "react";
import { copy } from "./copy";
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
  RuleInput,
  SettingsMeta,
  SourceBreakdown,
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
  isMaximized: boolean;
  onToggleTheme: () => void;
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

function DashboardView(props: {
  dailySummary: DailySummary;
  weeklySummary: DailySummary[];
  sourceBreakdown: SourceBreakdown[];
  snapshot: TrackingSnapshot;
  locale: Locale;
  text: Copy;
}) {
  const { dailySummary, weeklySummary, sourceBreakdown, snapshot, locale, text } = props;
  const weeklyTotal = weeklySummary.reduce((sum, day) => sum + day.totalStudyMinutes, 0);
  const maxMinutes = Math.max(...weeklySummary.map((day) => day.totalStudyMinutes), 1);
  const bestDay = weeklySummary.reduce((current, day) =>
    day.totalStudyMinutes > current.totalStudyMinutes ? day : current,
  );

  return (
    <div className="page dashboard-page">
      <section className="hero-card glass soft-panel">
        <div className="hero-main">
          <p className="eyebrow">{text.heroEyebrow}</p>
          <h1>{text.heroTitle}</h1>
          <div className="hero-metrics">
            <span className="muted-tag">{formatMinutes(weeklyTotal, locale)}</span>
            <span className="muted-tag">{dailySummary.topSource}</span>
          </div>
        </div>
        <div className="hero-status">
          <span className={`status-dot ${snapshot.isTracking ? "active" : ""}`} />
          <div>
            <p className="status-label">{text.currentFocus}</p>
            <strong>{snapshot.currentSource}</strong>
            <p>{snapshot.currentApp}</p>
          </div>
          <div className="confidence-pill">{Math.round(snapshot.confidence * 100)}%</div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card warm glass soft-panel">
          <span className="stat-label">{text.stats.today.label}</span>
          <strong>{formatMinutes(dailySummary.totalStudyMinutes, locale)}</strong>
        </article>
        <article className="stat-card teal glass soft-panel">
          <span className="stat-label">{text.stats.focused.label}</span>
          <strong>{dailySummary.focusedSessions}</strong>
        </article>
        <article className="stat-card sky glass soft-panel">
          <span className="stat-label">{text.stats.weekly.label}</span>
          <strong>{formatMinutes(weeklyTotal, locale)}</strong>
        </article>
        <article className="stat-card slate glass soft-panel">
          <span className="stat-label">{text.stats.distraction.label}</span>
          <strong>{formatMinutes(dailySummary.distractionsMinutes, locale)}</strong>
        </article>
      </section>

      <section className="split-grid dashboard-grid">
        <article className="panel glass soft-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">{text.weekly.eyebrow}</p>
              <h2>{text.weekly.title}</h2>
            </div>
            <div className="panel-summary">
              <span className="muted-tag">
                {text.weekly.total}: {formatMinutes(weeklyTotal, locale)}
              </span>
              <span className="muted-tag">
                {text.weekly.bestDay}: {formatWeekday(bestDay.date, locale)}
              </span>
            </div>
          </div>
          <div className="week-chart">
            {weeklySummary.map((day) => (
              <div className="week-column" key={day.date}>
                <span className="week-hours">{Math.max(0, Math.round(day.totalStudyMinutes / 60))}h</span>
                <div className="week-track">
                  <div
                    className="week-fill"
                    style={{ height: `${Math.max(18, (day.totalStudyMinutes / maxMinutes) * 100)}%` }}
                  />
                </div>
                <strong>{formatWeekday(day.date, locale)}</strong>
                <span>{day.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel glass soft-panel source-panel">
          <div className="panel-head compact-head">
            <div>
              <p className="eyebrow">{text.sources.eyebrow}</p>
              <h2>{text.sources.title}</h2>
            </div>
            <span className="muted-tag">{text.localOnly}</span>
          </div>
          <div className="source-list compact-source-list">
            {sourceBreakdown.map((source) => (
              <div key={source.sourceLabel} className="source-row compact-source-row">
                <div className="source-meta">
                  <span className="source-accent" style={{ background: source.accent }} />
                  <div>
                    <strong>{source.sourceLabel}</strong>
                    <p>{formatMinutes(source.minutes, locale)}</p>
                  </div>
                </div>
                <span>{source.share}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function TimelineView(props: {
  sessions: StudySession[];
  events: ActivityEvent[];
  locale: Locale;
  text: Copy;
}) {
  const { sessions, events, locale, text } = props;

  return (
    <div className="page timeline-page">
      <section className="panel glass soft-panel timeline-intro">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{text.timeline.eyebrow}</p>
            <h1>{text.timeline.title}</h1>
          </div>
          <span className="muted-tag">{text.timeline.compactLabel}</span>
        </div>
      </section>

      <section className="compact-session-list">
        {sessions.map((session) => {
          const relatedEvent = events.find(
            (event) => event.startedAt === session.startedAt && event.sourceLabel === session.sourceLabel,
          );

          return (
            <article key={session.id} className="compact-session-card glass soft-panel">
              <div className="compact-session-time">
                <strong>{formatTimeRange(session.startedAt, session.endedAt, locale)}</strong>
                <span>{formatDurationSeconds(session.durationSeconds, locale)}</span>
              </div>
              <div className="compact-session-main">
                <div className="session-title-row">
                  <h2>{session.sourceLabel}</h2>
                  <span className={`classification ${session.classification}`}>
                    {classificationLabel(session.classification, text)}
                  </span>
                </div>
                <p className="session-app">
                  {session.primaryAppName ?? "Unknown App"}
                  {session.primaryDomain ? ` · ${session.primaryDomain}` : ""}
                </p>
                {relatedEvent ? (
                  <div className="session-fields">
                    <span>{text.timeline.fields.title}: {relatedEvent.windowTitle}</span>
                    <span>{text.timeline.fields.source}: {relatedEvent.sourceType}</span>
                    <span>
                      {text.timeline.fields.classification}: {classificationLabel(relatedEvent.classification, text)}
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="compact-session-note">
                <p>{session.note}</p>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
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
  },
};

function RuleCreateModal(props: {
  locale: Locale;
  text: Copy;
  onClose: () => void;
  onCreate: (input: RuleInput) => Promise<void>;
}) {
  const customInput: RuleInput = {
    name: props.locale === "zh" ? "自定义规则" : "Custom rule",
    type: "window_title_contains",
    pattern: props.locale === "zh" ? "学习" : "study",
    classification: "study",
    category: "general",
    sourceLabel: props.locale === "zh" ? "自定义规则" : "Custom rule",
    priority: 60,
    presetKey: "custom",
  };

  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div
        className="modal-panel glass soft-panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="panel-head">
          <div>
            <p className="eyebrow">{props.text.rules.presetsEyebrow}</p>
            <h2>{props.text.rules.add}</h2>
          </div>
          <button className="icon-close" onClick={props.onClose} type="button">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-grid">
          {props.text.rules.defaults.map((item, index) => {
            const presetKey = (["coding", "language", "notes"] as const)[index];
            return (
              <button
                className="modal-option"
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
          <button className="modal-option" onClick={() => void props.onCreate(customInput)} type="button">
            <span className="preset-badge">Custom</span>
            <strong>{props.text.rules.add}</strong>
            <p>{props.text.rules.customDescription}</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function RulesView(props: { locale: Locale; rules: Rule[]; text: Copy }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localRules, setLocalRules] = useState(props.rules);
  const { locale, text } = props;

  useEffect(() => {
    setLocalRules(props.rules);
  }, [props.rules]);

  async function handleCreateRule(input: RuleInput) {
    const created = await trackerBridge.createRule(input);
    setLocalRules((current) => [...current, created]);
    setIsCreateOpen(false);
  }

  return (
    <div className="page rules-page">
      <section className="panel glass soft-panel page-toolbar">
        <div>
          <p className="eyebrow">{text.rules.eyebrow}</p>
          <h1>{text.rules.title}</h1>
        </div>
        <button className="primary-button" onClick={() => setIsCreateOpen(true)} type="button">
          + {text.rules.add}
        </button>
      </section>

      <section className="rules-grid rules-grid-full">
        {localRules.map((rule) => (
          <article key={rule.id} className="rule-card glass soft-panel rule-card-compact">
            <div className="rule-top">
              <div>
                <span className="rule-type">{rule.type}</span>
                <h2>{rule.name}</h2>
              </div>
              <span className={`toggle ${rule.enabled ? "on" : ""}`}>
                {rule.enabled ? text.rules.enabled : text.rules.disabled}
              </span>
            </div>
            <p className="rule-pattern">{rule.pattern}</p>
            <div className="rule-meta">
              <span className={`classification ${rule.classification === "ignore" ? "neutral" : rule.classification}`}>
                {rule.sourceLabel}
              </span>
              <span>p{rule.priority}</span>
              <span>
                {rule.hitsToday} {text.rules.hitsToday}
              </span>
            </div>
          </article>
        ))}
      </section>

      {isCreateOpen ? (
        <RuleCreateModal
          locale={locale}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateRule}
          text={text}
        />
      ) : null}
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
    const updated = await trackerBridge.updateSettings(input);
    setConfig(updated);
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
        isMaximized={isMaximized}
        locale={locale}
        onClose={() => void trackerBridge.closeWindow()}
        onMaximize={() => void handleToggleMaximize()}
        onMinimize={() => void trackerBridge.minimizeWindow()}
        onToggleLocale={() => setLocale((current) => (current === "zh" ? "en" : "zh"))}
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
                  dailySummary={daily}
                  locale={locale}
                  snapshot={snapshot}
                  sourceBreakdown={sources}
                  text={text}
                  weeklySummary={weekly}
                />
              ) : null}
              {activeView === "timeline" ? (
                <TimelineView events={events} locale={locale} sessions={sessions} text={text} />
              ) : null}
              {activeView === "rules" ? <RulesView locale={locale} rules={rules} text={text} /> : null}
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
