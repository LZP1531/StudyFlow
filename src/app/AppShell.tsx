import type { ViewKey } from "../types/app";
import { DashboardView } from "../features/dashboard/DashboardView";
import { RulesView } from "../features/rules/RulesView";
import { SettingsView } from "../features/settings/SettingsView";
import { TimelineView } from "../features/timeline/TimelineView";
import { WindowTitleBar } from "../components/WindowTitleBar";
import { navIcon } from "../components/icons";
import { useAppShellState } from "./useAppShellState";

const navOrder: ViewKey[] = ["dashboard", "timeline", "rules", "settings"];

export default function AppShell() {
  const {
    activeView,
    config,
    currentTimeMs,
    daily,
    errorMessage,
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
    actions,
  } = useAppShellState();

  if (errorMessage) {
    return (
      <div className="loading-screen loading-screen-error">
        <div className="app-status-panel">
          <strong>{locale === "zh" ? "未连接到桌面服务" : "Desktop Bridge Unavailable"}</strong>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!snapshot || !daily || !config || !settingsMeta) {
    return <div className="loading-screen">{text.loading}</div>;
  }

  return (
    <div className="desktop-shell">
      <WindowTitleBar
        dashboardTimerStyle={config.dashboardTimerStyle}
        isMaximized={isMaximized}
        locale={locale}
        onClose={actions.closeWindow}
        onMaximize={() => void actions.maximizeWindow()}
        onMinimize={actions.minimizeWindow}
        onToggleLocale={actions.toggleLocale}
        onToggleTimerStyle={actions.toggleTimerStyle}
        onToggleTheme={actions.toggleTheme}
        themeMode={themeMode}
      />

      <div className="app-frame">
        <aside className="sidebar-shell">
          <nav className="nav nav-vertical">
            {navOrder.map((view) => (
              <button key={view} className={`nav-item nav-tile ${activeView === view ? "active" : ""}`} onClick={() => actions.setActiveView(view)} type="button">
                <span className="nav-icon nav-icon-large" aria-hidden="true">{navIcon(view)}</span>
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
                  onOpenTimeline={() => actions.setActiveView("timeline")}
                  sessions={sessions}
                  snapshot={snapshot}
                  sourceBreakdown={sources}
                  timerStyle={config.dashboardTimerStyle}
                  text={text}
                  weeklySummary={weekly}
                />
              ) : null}
              {activeView === "timeline" ? <TimelineView events={events} locale={locale} onDeleteStudySession={actions.deleteStudySession} sessions={sessions} text={text} /> : null}
              {activeView === "rules" ? <RulesView locale={locale} onCreateRule={actions.createRule} onDeleteRule={actions.deleteRule} onUpdateRule={actions.updateRule} rules={rules} text={text} /> : null}
              {activeView === "settings" ? (
                <SettingsView
                  config={config}
                  locale={locale}
                  meta={settingsMeta}
                  onLocaleChange={actions.setLocale}
                  onThemeChange={actions.setThemeMode}
                  onTrackingStatusChange={actions.trackingStatusChange}
                  onUpdateSettings={actions.updateSettings}
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
