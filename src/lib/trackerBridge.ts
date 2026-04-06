import {
  activityEvents,
  dailySummary,
  rules,
  sessions,
  sourceBreakdown,
  trackingConfig,
  trackingSnapshot,
  weeklySummary,
} from "../data/mockStudyData";
import type {
  Rule,
  RuleInput,
  SettingsMeta,
  SettingsUpdate,
  StudyflowApi,
} from "../types/study";

export interface TrackerBridge extends StudyflowApi {}

class MockTrackerBridge implements TrackerBridge {
  async getTrackingSnapshot() {
    return trackingSnapshot;
  }

  async getDailySummary() {
    return dailySummary;
  }

  async getWeeklySummary() {
    return weeklySummary;
  }

  async listSourceBreakdown() {
    return sourceBreakdown;
  }

  async listActivityEvents() {
    return activityEvents;
  }

  async listStudySessions() {
    return sessions;
  }

  async listRules() {
    return rules;
  }

  async createRule(input: RuleInput) {
    const timestamp = new Date().toISOString();
    const created: Rule = {
      id: `mock-${Date.now()}`,
      name: input.name,
      type: input.type,
      pattern: input.pattern,
      classification: input.classification,
      category: input.category,
      sourceLabel: input.sourceLabel,
      priority: input.priority,
      enabled: input.enabled ?? true,
      presetKey: input.presetKey ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
      hitsToday: 0,
    };

    rules.push(created);
    return created;
  }

  async updateRule(id: string, input: Partial<RuleInput>) {
    const current = rules.find((rule) => rule.id === id);
    const timestamp = new Date().toISOString();

    const updated: Rule = {
      ...(current ?? {
        id,
        name: "Updated Rule",
        type: "window_title_contains",
        pattern: "",
        classification: "neutral",
        category: "general",
        sourceLabel: "自定义规则",
        priority: 50,
        enabled: true,
        presetKey: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        hitsToday: 0,
      }),
      ...input,
      updatedAt: timestamp,
    };

    if (current) {
      Object.assign(current, updated);
    }

    return updated;
  }

  async deleteRule(id: string) {
    const index = rules.findIndex((rule) => rule.id === id);
    if (index >= 0) {
      rules.splice(index, 1);
    }
  }

  async deleteStudySession(id: string) {
    const sessionIndex = sessions.findIndex((session) => session.id === id);
    if (sessionIndex >= 0) {
      sessions.splice(sessionIndex, 1);
    }

    const eventIndex = activityEvents.findIndex((event) => event.id === id);
    if (eventIndex >= 0) {
      activityEvents.splice(eventIndex, 1);
    }
  }

  async getSettings() {
    return trackingConfig;
  }

  async updateSettings(input: SettingsUpdate) {
    Object.assign(trackingConfig, input);
    return trackingConfig;
  }

  async getSettingsMeta(): Promise<SettingsMeta> {
    return {
      trackingStatus: trackingSnapshot.isTracking ? "active" : "paused",
      browserExtensionConnected: false,
      lastBrowserSyncAt: null,
      databaseStatus: "healthy",
      appVersion: "0.1.0",
    };
  }

  async exportLocalData() {
    return { success: false };
  }

  async copyDebugInfo() {
    return;
  }

  async setTrackingEnabled(enabled: boolean) {
    trackingSnapshot.isTracking = enabled;
    const trackingStatus: "active" | "paused" = enabled ? "active" : "paused";
    return {
      trackingStatus,
      browserExtensionConnected: false,
      lastBrowserSyncAt: null,
      databaseStatus: "healthy" as const,
      appVersion: "0.1.0",
    };
  }

  async setWindowTheme() {
    return;
  }

  async minimizeWindow() {
    return;
  }

  async maximizeWindow() {
    return;
  }

  async closeWindow() {
    return;
  }

  async getWindowState() {
    return { isMaximized: false };
  }
}

const fallbackBridge: TrackerBridge = new MockTrackerBridge();

function getElectronBridge(): TrackerBridge | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.studyflow ?? null;
}

export const trackerBridge: TrackerBridge = new Proxy(fallbackBridge, {
  get(target, prop, receiver) {
    const bridge = getElectronBridge() ?? target;
    return Reflect.get(bridge, prop, receiver);
  },
});
