export type SourceType = "desktop" | "browser" | "system";
export type Classification = "study" | "distraction" | "neutral";
export type RuleClassification = Classification | "ignore";
export type StudyCategory =
  | "flashcard"
  | "note"
  | "reading"
  | "course"
  | "video_course"
  | "coding"
  | "general";
export type RuleType =
  | "app_name_equals"
  | "window_title_contains"
  | "domain_equals"
  | "url_prefix"
  | "url_contains";
export type RulePreset = "coding" | "language" | "notes" | "custom";
export type SessionType = "auto" | "manual";

export interface ActivityEvent {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  sourceType: SourceType;
  appName: string;
  windowTitle: string;
  domain?: string | null;
  url?: string | null;
  browserName?: string | null;
  classification: Classification;
  category: StudyCategory;
  sourceLabel: string;
  matchedRuleId?: string | null;
  isIdle: boolean;
  confidence: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  classification: "study";
  category: StudyCategory;
  sourceLabel: string;
  primaryAppName?: string | null;
  primaryDomain?: string | null;
  note: string;
  sessionType: SessionType;
  createdAt: string;
  updatedAt: string;
}

export interface Rule {
  id: string;
  name: string;
  type: RuleType;
  pattern: string;
  classification: RuleClassification;
  category: StudyCategory;
  sourceLabel: string;
  priority: number;
  enabled: boolean;
  presetKey?: RulePreset | null;
  createdAt: string;
  updatedAt: string;
  hitsToday: number;
}

export interface DailySummary {
  date: string;
  totalStudyMinutes: number;
  focusedSessions: number;
  distractionsMinutes: number;
  topSource: string;
}

export interface SourceBreakdown {
  sourceLabel: string;
  minutes: number;
  share: number;
  accent: string;
}

export interface TrackingSnapshot {
  isTracking: boolean;
  currentSource: string;
  currentApp: string;
  startedAt: string;
  confidence: number;
  sourceType: SourceType;
  classification: Classification;
}

export interface TrackingConfig {
  themeMode: "dark" | "light" | "system";
  locale: "zh" | "en";
  idleThresholdMinutes: number;
  launchOnStartup: boolean;
  minimizeToTray: boolean;
  allowLocalExports: boolean;
}

export interface SettingsMeta {
  trackingStatus: "active" | "paused";
  browserExtensionConnected: boolean;
  lastBrowserSyncAt: string | null;
  databaseStatus: "healthy" | "warning" | "error";
  appVersion: string;
}

export interface RuleInput {
  name: string;
  type: RuleType;
  pattern: string;
  classification: RuleClassification;
  category: StudyCategory;
  sourceLabel: string;
  priority: number;
  presetKey?: RulePreset | null;
  enabled?: boolean;
}

export interface SettingsUpdate {
  themeMode?: TrackingConfig["themeMode"];
  locale?: TrackingConfig["locale"];
  idleThresholdMinutes?: number;
  launchOnStartup?: boolean;
  minimizeToTray?: boolean;
  allowLocalExports?: boolean;
}

export interface StudyflowApi {
  getTrackingSnapshot(): Promise<TrackingSnapshot>;
  getDailySummary(): Promise<DailySummary>;
  getWeeklySummary(): Promise<DailySummary[]>;
  listSourceBreakdown(): Promise<SourceBreakdown[]>;
  listActivityEvents(): Promise<ActivityEvent[]>;
  listStudySessions(): Promise<StudySession[]>;
  listRules(): Promise<Rule[]>;
  createRule(input: RuleInput): Promise<Rule>;
  updateRule(id: string, input: Partial<RuleInput>): Promise<Rule>;
  deleteRule(id: string): Promise<void>;
  deleteStudySession(id: string): Promise<void>;
  getSettings(): Promise<TrackingConfig>;
  updateSettings(input: SettingsUpdate): Promise<TrackingConfig>;
  getSettingsMeta(): Promise<SettingsMeta>;
  exportLocalData(): Promise<{ success: boolean; filePath?: string }>;
  copyDebugInfo(): Promise<void>;
  setTrackingEnabled(enabled: boolean): Promise<SettingsMeta>;
  setWindowTheme(theme: "light" | "dark"): Promise<void>;
  minimizeWindow(): Promise<void>;
  maximizeWindow(): Promise<void>;
  closeWindow(): Promise<void>;
  getWindowState(): Promise<{ isMaximized: boolean }>;
}
