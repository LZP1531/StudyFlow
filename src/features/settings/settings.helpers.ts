import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import type { SettingsMeta } from "../../types/study";

export function buildIdleOptions(locale: Locale) {
  return [
    { value: 1, label: locale === "zh" ? "1 分钟" : "1 min" },
    { value: 5, label: locale === "zh" ? "5 分钟" : "5 min" },
    { value: 10, label: locale === "zh" ? "10 分钟" : "10 min" },
    { value: 20, label: locale === "zh" ? "20 分钟" : "20 min" },
  ];
}

export function buildSettingsStatusCards(text: Messages, meta: SettingsMeta) {
  return [
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
}

export function buildSettingsDiagnosticRows(text: Messages, locale: Locale, meta: SettingsMeta) {
  return [
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
}
