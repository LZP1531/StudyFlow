import { useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale, ThemeMode } from "../../types/app";
import { trackerBridge } from "../../lib/trackerBridge";
import type { SettingsMeta, TrackingConfig } from "../../types/study";
import { InlineInfoButton } from "../../components/InlineInfoButton";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
import { ToggleSwitch } from "../../components/ToggleSwitch";
import { buildIdleOptions, buildSettingsDiagnosticRows, buildSettingsStatusCards } from "./settings.helpers";

export function SettingsView(props: {
  config: TrackingConfig;
  meta: SettingsMeta;
  locale: Locale;
  themeMode: ThemeMode;
  text: Messages;
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

  const idleOptions = buildIdleOptions(locale);
  const statusCards = buildSettingsStatusCards(text, meta);
  const diagnosticsRows = buildSettingsDiagnosticRows(text, locale, meta);

  async function handleExport() {
    const result = await trackerBridge.exportLocalData();
    if (result.success) {
      showFeedback(text.settings.values.exported);
    }
  }

  return (
    <div className="page settings-page">
      <div className="settings-header-inline">
        <div><p className="eyebrow">{text.settings.eyebrow}</p></div>
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
                <SegmentedButtonGroup value={locale} options={[{ label: "中文", value: "zh" }, { label: "English", value: "en" }]} onChange={props.onLocaleChange} />
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
                    <InlineInfoButton tooltip={row.label === text.settings.fields.browserExtension ? text.settings.helpers.browserExtension : text.settings.helpers.lastSyncAt} />
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
                </div>
                <button className="secondary-button" disabled={!config.allowLocalExports} onClick={() => void handleExport()} type="button">
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
                <SegmentedButtonGroup value={String(config.idleThresholdMinutes)} options={idleOptions.map((option) => ({ label: option.label, value: String(option.value) }))} onChange={(next) => void props.onUpdateSettings({ idleThresholdMinutes: Number(next) })} />
              </div>
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.startup}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.startup} />
                </div>
                <ToggleSwitch checked={config.launchOnStartup} label={text.settings.fields.startup} onChange={(next) => void props.onUpdateSettings({ launchOnStartup: next })} />
              </div>
              <div className="setting-card setting-row">
                <div className="setting-title-inline">
                  <strong>{text.settings.fields.tray}</strong>
                  <InlineInfoButton tooltip={text.settings.helpers.tray} />
                </div>
                <ToggleSwitch checked={config.minimizeToTray} label={text.settings.fields.tray} onChange={(next) => void props.onUpdateSettings({ minimizeToTray: next })} />
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
                <ToggleSwitch checked={meta.trackingStatus === "active"} label={text.settings.fields.trackingStatus} onChange={(next) => {
                  void props.onTrackingStatusChange(next).then(() => {
                    showFeedback(next ? text.settings.values.active : text.settings.values.paused);
                  });
                }} />
              </div>
              {diagnosticsRows.slice(2).map((row) => (
                <div className="setting-card setting-row readonly-row" key={row.label}>
                  <div className="setting-title-inline">
                    <strong>{row.label}</strong>
                    <InlineInfoButton tooltip={row.label === text.settings.fields.databaseHealth ? text.settings.helpers.databaseHealth : text.settings.helpers.appVersion} />
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
