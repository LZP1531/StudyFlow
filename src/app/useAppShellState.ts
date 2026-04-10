import { useEffect, useMemo, useState } from "react";
import { messages } from "../i18n/messages";
import type { Locale, ThemeMode, ViewKey } from "../types/app";
import { trackerBridge } from "../lib/trackerBridge";
import { cycleTheme, getInitialLocale, getInitialThemeMode, resolveTheme, storageKeys } from "../lib/preferences";
import type {
  ActivityEvent,
  DailySummary,
  Rule,
  RuleInput,
  SettingsMeta,
  SourceBreakdown,
  StudySession,
  TrackingConfig,
  TrackingSnapshot,
} from "../types/study";

const refreshIntervals = {
  snapshotRefreshMs: 4_000,
  summaryRefreshMs: 20_000,
} as const;

export function useAppShellState() {
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
  const text = useMemo(() => messages[locale], [locale]);

  async function refreshSnapshot() {
    const nextSnapshot = await trackerBridge.getTrackingSnapshot();
    setSnapshot((current) => {
      if (
        current &&
        current.isTracking === nextSnapshot.isTracking &&
        current.currentSource === nextSnapshot.currentSource &&
        current.currentApp === nextSnapshot.currentApp &&
        current.startedAt === nextSnapshot.startedAt &&
        current.confidence === nextSnapshot.confidence &&
        current.sourceType === nextSnapshot.sourceType &&
        current.classification === nextSnapshot.classification
      ) {
        return current;
      }

      return nextSnapshot;
    });
  }

  async function refreshSummary(activeView: ViewKey) {
    const [nextDaily, nextWeekly, nextSources, nextSessions, nextEvents, nextRules, nextSettingsMeta] = await Promise.all([
      trackerBridge.getDailySummary(),
      trackerBridge.getWeeklySummary(),
      trackerBridge.listSourceBreakdown(),
      trackerBridge.listStudySessions(),
      activeView === "timeline" ? trackerBridge.listActivityEvents() : Promise.resolve<ActivityEvent[] | null>(null),
      activeView === "rules" ? trackerBridge.listRules() : Promise.resolve<Rule[] | null>(null),
      activeView === "settings" ? trackerBridge.getSettingsMeta() : Promise.resolve<SettingsMeta | null>(null),
    ]);

    setDaily(nextDaily);
    setWeekly(nextWeekly);
    setSources(nextSources);
    setSessions(nextSessions);

    if (nextEvents) {
      setEvents(nextEvents);
    }
    if (nextRules) {
      setRules(nextRules);
    }
    if (nextSettingsMeta) {
      setSettingsMeta(nextSettingsMeta);
    }
  }

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
    let isDisposed = false;

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

      if (isDisposed) {
        return;
      }

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

    return () => {
      isDisposed = true;
    };
  }, []);

  useEffect(() => {
    let isDisposed = false;
    let snapshotIntervalId: number | null = null;
    let summaryIntervalId: number | null = null;

    const runSnapshotRefresh = async () => {
      const nextSnapshot = await trackerBridge.getTrackingSnapshot();
      if (!isDisposed) {
        setSnapshot((current) => {
          if (
            current &&
            current.isTracking === nextSnapshot.isTracking &&
            current.currentSource === nextSnapshot.currentSource &&
            current.currentApp === nextSnapshot.currentApp &&
            current.startedAt === nextSnapshot.startedAt &&
            current.confidence === nextSnapshot.confidence &&
            current.sourceType === nextSnapshot.sourceType &&
            current.classification === nextSnapshot.classification
          ) {
            return current;
          }

          return nextSnapshot;
        });
      }
    };

    const runSummaryRefresh = async () => {
      const [nextDaily, nextWeekly, nextSources, nextSessions, nextEvents, nextRules, nextSettingsMeta] = await Promise.all([
        trackerBridge.getDailySummary(),
        trackerBridge.getWeeklySummary(),
        trackerBridge.listSourceBreakdown(),
        trackerBridge.listStudySessions(),
        activeView === "timeline" ? trackerBridge.listActivityEvents() : Promise.resolve<ActivityEvent[] | null>(null),
        activeView === "rules" ? trackerBridge.listRules() : Promise.resolve<Rule[] | null>(null),
        activeView === "settings" ? trackerBridge.getSettingsMeta() : Promise.resolve<SettingsMeta | null>(null),
      ]);

      if (isDisposed) {
        return;
      }

      setDaily(nextDaily);
      setWeekly(nextWeekly);
      setSources(nextSources);
      setSessions(nextSessions);

      if (nextEvents) {
        setEvents(nextEvents);
      }
      if (nextRules) {
        setRules(nextRules);
      }
      if (nextSettingsMeta) {
        setSettingsMeta(nextSettingsMeta);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runSnapshotRefresh();
        void runSummaryRefresh();
      }
    };

    void runSnapshotRefresh();
    void runSummaryRefresh();

    snapshotIntervalId = window.setInterval(() => {
      void runSnapshotRefresh();
    }, refreshIntervals.snapshotRefreshMs);

    summaryIntervalId = window.setInterval(() => {
      void runSummaryRefresh();
    }, refreshIntervals.summaryRefreshMs);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isDisposed = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (snapshotIntervalId !== null) {
        window.clearInterval(snapshotIntervalId);
      }
      if (summaryIntervalId !== null) {
        window.clearInterval(summaryIntervalId);
      }
    };
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
    await refreshSummary("timeline");
  }

  async function handleTrackingStatusChange(enabled: boolean) {
    const updatedMeta = await trackerBridge.setTrackingEnabled(enabled);
    setSettingsMeta(updatedMeta);
    await refreshSnapshot();
    await refreshSummary(activeView);
  }

  return {
    activeView,
    config,
    currentTimeMs,
    daily,
    events,
    isMaximized,
    locale,
    rules,
    sessions,
    settingsMeta,
    snapshot,
    sources,
    text,
    themeMode,
    weekly,
    actions: {
      closeWindow: () => void trackerBridge.closeWindow(),
      createRule: handleCreateRule,
      deleteRule: handleDeleteRule,
      deleteStudySession: handleDeleteStudySession,
      maximizeWindow: handleToggleMaximize,
      minimizeWindow: () => void trackerBridge.minimizeWindow(),
      setActiveView,
      setLocale,
      setThemeMode,
      toggleTheme: () => setThemeMode((current) => cycleTheme(current)),
      toggleLocale: () => setLocale((current) => (current === "zh" ? "en" : "zh")),
      toggleTimerStyle: handleToggleTimerStyle,
      trackingStatusChange: handleTrackingStatusChange,
      updateRule: handleUpdateRule,
      updateSettings: handleUpdateSettings,
    },
  };
}
