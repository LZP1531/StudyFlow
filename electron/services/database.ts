import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  ActivityEvent,
  Classification,
  DailySummary,
  Rule,
  RuleClassification,
  RuleInput,
  RuleType,
  SettingsUpdate,
  SourceBreakdown,
  StudyCategory,
  StudySession,
  TrackingConfig,
  TrackingSnapshot,
} from "../../src/types/study";
import type { ActiveWindowSnapshot } from "./tracking";

const sourceColors = ["#f97316", "#14b8a6", "#facc15", "#38bdf8", "#fb7185", "#a78bfa"];
const neutralTrackingSnapshot: TrackingSnapshot = {
  isTracking: false,
  currentSource: "Idle",
  currentApp: "StudyFlow",
  startedAt: new Date(0).toISOString(),
  confidence: 0,
  sourceType: "system",
  classification: "neutral",
};

const defaultTrackingConfig: TrackingConfig = {
  themeMode: "dark",
  locale: "zh",
  dashboardTimerStyle: "dial",
  idleThresholdMinutes: 5,
  launchOnStartup: true,
  minimizeToTray: true,
  allowLocalExports: true,
};

interface ResolvedRule {
  classification: RuleClassification;
  category: StudyCategory;
  sourceLabel: string;
  matchedRuleId: string | null;
  confidence: number;
}

interface ActivityEventRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  source_type: ActivityEvent["sourceType"];
  app_name: string;
  window_title: string;
  domain: string | null;
  url: string | null;
  browser_name: string | null;
  classification: Classification;
  category: StudyCategory;
  source_label: string;
  matched_rule_id: string | null;
  is_idle: number;
  confidence: number;
  created_at: string;
}

export class StudyflowDatabase {
  private db: InstanceType<typeof Database>;

  constructor(private readonly dbPath: string) {
    const directory = dirname(dbPath);
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.resetLegacySchemaIfNeeded();
    this.createSchema();
    this.ensureSettingsColumns();
    this.ensureDefaultSettings();
    this.pruneBrowserActivityCache();
  }

  getTrackingSnapshot(): TrackingSnapshot {
    const latest = this.db
      .prepare(
        `select
           source_label,
           app_name,
           started_at,
           confidence,
           source_type,
           classification
         from activity_events
         where ended_at is null
         order by started_at desc
         limit 1`,
      )
      .get() as
      | {
          source_label: string;
          app_name: string;
          started_at: string;
          confidence: number;
          source_type: ActivityEvent["sourceType"];
          classification: Classification;
        }
      | undefined;

    if (!latest) {
      return neutralTrackingSnapshot;
    }

    return {
      isTracking: latest.classification === "study",
      currentSource: latest.source_label,
      currentApp: latest.app_name,
      startedAt: latest.started_at,
      confidence: latest.confidence,
      sourceType: latest.source_type,
      classification: latest.classification,
    };
  }

  getDailySummary(): DailySummary {
    const referenceDate = this.getReferenceDate();
    if (!referenceDate) {
      return {
        date: this.getTodayDateKey(),
        totalStudyMinutes: 0,
        focusedSessions: 0,
        distractionsMinutes: 0,
        topSource: "Study",
      };
    }

    const result = this.db
      .prepare(
        `select
           coalesce(sum(case when classification = 'study' then duration_seconds else 0 end), 0) as total_study_seconds,
           coalesce(sum(case when classification = 'distraction' then duration_seconds else 0 end), 0) as distraction_seconds
         from activity_events
         where date(started_at) = ?`,
      )
      .get(referenceDate) as { total_study_seconds: number; distraction_seconds: number };

    const focused = this.db
      .prepare(
        `select count(*) as count
         from study_sessions
         where date(started_at) = ?`,
      )
      .get(referenceDate) as { count: number };

    const topSource = this.db
      .prepare(
        `select source_label
         from activity_events
         where date(started_at) = ? and classification = 'study'
         group by source_label
         order by sum(duration_seconds) desc
         limit 1`,
      )
      .get(referenceDate) as { source_label: string } | undefined;

    return {
      date: referenceDate,
      totalStudyMinutes: Math.round(result.total_study_seconds / 60),
      focusedSessions: focused.count,
      distractionsMinutes: Math.round(result.distraction_seconds / 60),
      topSource: topSource?.source_label ?? "Study",
    };
  }

  getWeeklySummary(): DailySummary[] {
    const rows = this.db
      .prepare(
        `select
           date(started_at) as date,
           coalesce(sum(case when classification = 'study' then duration_seconds else 0 end), 0) as total_study_seconds,
           coalesce(sum(case when classification = 'distraction' then duration_seconds else 0 end), 0) as distraction_seconds,
           count(case when classification = 'study' then 1 end) as study_event_count
         from activity_events
         group by date(started_at)
         order by date(started_at) desc
         limit 7`,
      )
      .all() as Array<{
      date: string;
      total_study_seconds: number;
      distraction_seconds: number;
      study_event_count: number;
    }>;

    if (rows.length === 0) {
      return [];
    }

    return rows
      .reverse()
      .map((row) => {
        const topSource = this.db
          .prepare(
            `select source_label
             from activity_events
             where date(started_at) = ? and classification = 'study'
             group by source_label
             order by sum(duration_seconds) desc
             limit 1`,
          )
          .get(row.date) as { source_label: string } | undefined;

        return {
          date: row.date,
          totalStudyMinutes: Math.round(row.total_study_seconds / 60),
          focusedSessions: row.study_event_count,
          distractionsMinutes: Math.round(row.distraction_seconds / 60),
          topSource: topSource?.source_label ?? "Study",
        };
      });
  }

  listSourceBreakdown(): SourceBreakdown[] {
    const referenceDate = this.getReferenceDate();
    if (!referenceDate) {
      return [];
    }

    const rows = this.db
      .prepare(
        `select source_label, sum(duration_seconds) as duration_seconds
         from activity_events
         where date(started_at) = ? and classification = 'study'
         group by source_label
         order by duration_seconds desc`,
      )
      .all(referenceDate) as Array<{ source_label: string; duration_seconds: number }>;

    if (rows.length === 0) {
      return [];
    }

    const total = rows.reduce((sum, row) => sum + row.duration_seconds, 0) || 1;
    return rows.map((row, index) => ({
      sourceLabel: row.source_label,
      minutes: Math.round(row.duration_seconds / 60),
      share: Math.round((row.duration_seconds / total) * 100),
      accent: sourceColors[index % sourceColors.length],
    }));
  }

  listActivityEvents(): ActivityEvent[] {
    const rows = this.db
      .prepare(
        `select
           id,
           started_at,
           ended_at,
           duration_seconds,
           source_type,
           app_name,
           window_title,
           domain,
           url,
           browser_name,
           classification,
           category,
           source_label,
           matched_rule_id,
           is_idle,
           confidence,
           created_at
         from activity_events
         order by started_at asc`,
      )
      .all() as ActivityEventRow[];

    return rows.map((row) => this.mapActivityEvent(row));
  }

  listStudySessions(): StudySession[] {
    const rows = this.db
      .prepare(
        `select
           id,
           started_at,
           ended_at,
           duration_seconds,
           classification,
           category,
           source_label,
           primary_app_name,
           primary_domain,
           note,
           session_type,
           created_at,
           updated_at
         from study_sessions
         order by started_at asc`,
      )
      .all() as Array<{
      id: string;
      started_at: string;
      ended_at: string;
      duration_seconds: number;
      classification: "study";
      category: StudyCategory;
      source_label: string;
      primary_app_name: string | null;
      primary_domain: string | null;
      note: string;
      session_type: StudySession["sessionType"];
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds,
      classification: row.classification,
      category: row.category,
      sourceLabel: row.source_label,
      primaryAppName: row.primary_app_name,
      primaryDomain: row.primary_domain,
      note: row.note,
      sessionType: row.session_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  listRules(): Rule[] {
    const rows = this.db
      .prepare(
        `select
           r.id,
           r.name,
           r.type,
           r.pattern,
           r.classification,
           r.category,
           r.source_label,
           r.priority,
           r.enabled,
           r.preset_key,
           r.created_at,
           r.updated_at,
           (
             select count(*)
             from activity_events ae
             where ae.matched_rule_id = r.id
               and date(ae.started_at) = ?
           ) as hits_today
         from rules r
         order by r.enabled desc, r.priority desc, r.name asc`,
      )
      .all(this.getReferenceDate() ?? this.getTodayDateKey()) as Array<{
      id: string;
      name: string;
      type: RuleType;
      pattern: string;
      classification: RuleClassification;
      category: StudyCategory;
      source_label: string;
      priority: number;
      enabled: number;
      preset_key: Rule["presetKey"];
      created_at: string;
      updated_at: string;
      hits_today: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      pattern: row.pattern,
      classification: row.classification,
      category: row.category,
      sourceLabel: row.source_label,
      priority: row.priority,
      enabled: Boolean(row.enabled),
      presetKey: row.preset_key,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      hitsToday: row.hits_today,
    }));
  }

  createRule(input: RuleInput): Rule {
    const now = new Date().toISOString();
    const rule: Rule = {
      id: randomUUID(),
      name: input.name,
      type: input.type,
      pattern: input.pattern,
      classification: input.classification,
      category: input.category,
      sourceLabel: input.sourceLabel,
      priority: input.priority,
      enabled: input.enabled ?? true,
      presetKey: input.presetKey ?? null,
      createdAt: now,
      updatedAt: now,
      hitsToday: 0,
    };

    this.db
      .prepare(
        `insert into rules (
           id,
           name,
           type,
           pattern,
           classification,
           category,
           source_label,
           priority,
           enabled,
           preset_key,
           created_at,
           updated_at
         ) values (
           @id,
           @name,
           @type,
           @pattern,
           @classification,
           @category,
           @sourceLabel,
           @priority,
           @enabled,
           @presetKey,
           @createdAt,
           @updatedAt
         )`,
      )
      .run({
        ...rule,
        enabled: rule.enabled ? 1 : 0,
      });

    return rule;
  }

  updateRule(id: string, input: Partial<RuleInput>): Rule {
    const current = this.listRules().find((rule) => rule.id === id);
    if (!current) {
      throw new Error(`Rule ${id} not found`);
    }

    const updated: Rule = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.db
      .prepare(
        `update rules
         set name = @name,
             type = @type,
             pattern = @pattern,
             classification = @classification,
             category = @category,
             source_label = @sourceLabel,
             priority = @priority,
             enabled = @enabled,
             preset_key = @presetKey,
             updated_at = @updatedAt
         where id = @id`,
      )
      .run({
        ...updated,
        enabled: updated.enabled ? 1 : 0,
      });

    return updated;
  }

  deleteRule(id: string) {
    this.db.prepare(`delete from rules where id = ?`).run(id);
  }

  deleteStudySession(id: string) {
    this.db.prepare(`delete from study_sessions where id = ?`).run(id);
    this.db.prepare(`delete from activity_events where id = ?`).run(id);
  }

  getSettings(): TrackingConfig {
    const row = this.db
      .prepare(
        `select
           theme_mode,
           locale,
           dashboard_timer_style,
           idle_threshold_minutes,
           launch_on_startup,
           minimize_to_tray,
           allow_local_exports
         from settings
         where id = 'default'`,
      )
      .get() as
      | {
          theme_mode: TrackingConfig["themeMode"];
          locale: TrackingConfig["locale"];
          dashboard_timer_style: TrackingConfig["dashboardTimerStyle"] | null;
          idle_threshold_minutes: number;
          launch_on_startup: number;
          minimize_to_tray: number;
          allow_local_exports: number;
        }
      | undefined;

    if (!row) {
      return defaultTrackingConfig;
    }

    return {
      themeMode: row.theme_mode,
      locale: row.locale,
      dashboardTimerStyle: row.dashboard_timer_style ?? "dial",
      idleThresholdMinutes: row.idle_threshold_minutes,
      launchOnStartup: Boolean(row.launch_on_startup),
      minimizeToTray: Boolean(row.minimize_to_tray),
      allowLocalExports: Boolean(row.allow_local_exports),
    };
  }

  updateSettings(input: SettingsUpdate): TrackingConfig {
    const next = {
      ...this.getSettings(),
      ...input,
    };

    this.db
      .prepare(
        `update settings
         set theme_mode = @themeMode,
             locale = @locale,
             dashboard_timer_style = @dashboardTimerStyle,
             idle_threshold_minutes = @idleThresholdMinutes,
             launch_on_startup = @launchOnStartup,
             minimize_to_tray = @minimizeToTray,
             allow_local_exports = @allowLocalExports,
             updated_at = @updatedAt
         where id = 'default'`,
      )
      .run({
        ...next,
        launchOnStartup: next.launchOnStartup ? 1 : 0,
        minimizeToTray: next.minimizeToTray ? 1 : 0,
        allowLocalExports: next.allowLocalExports ? 1 : 0,
        updatedAt: new Date().toISOString(),
      });

    return next;
  }

  recordSample(sample: ActiveWindowSnapshot) {
    const now = sample.capturedAt;
    const openEventRow = this.db
      .prepare(
        `select
           id,
           started_at,
           ended_at,
           duration_seconds,
           source_type,
           app_name,
           window_title,
           domain,
           url,
           browser_name,
           classification,
           category,
           source_label,
           matched_rule_id,
           is_idle,
           confidence,
           created_at
         from activity_events
         where ended_at is null
         order by started_at desc
         limit 1`,
      )
      .get() as ActivityEventRow | undefined;

    if (sample.sourceType === "browser" && sample.url) {
      this.cacheBrowserActivity(sample);
    }

    const resolved = this.resolveRule(sample);

    if (openEventRow && !this.canMerge(openEventRow, sample, resolved)) {
      this.closeActivityEvent(openEventRow.id, now);
    }

    if (resolved.classification === "ignore") {
      return;
    }

    const latestOpen = this.db
      .prepare(
        `select
           id,
           started_at,
           ended_at,
           duration_seconds,
           source_type,
           app_name,
           window_title,
           domain,
           url,
           browser_name,
           classification,
           category,
           source_label,
           matched_rule_id,
           is_idle,
           confidence,
           created_at
         from activity_events
         where ended_at is null
         order by started_at desc
         limit 1`,
      )
      .get() as ActivityEventRow | undefined;

    if (latestOpen && this.canMerge(latestOpen, sample, resolved)) {
      const durationSeconds = Math.max(
        0,
        Math.round((new Date(now).getTime() - new Date(latestOpen.started_at).getTime()) / 1000),
      );

      this.db
        .prepare(
          `update activity_events
           set duration_seconds = @durationSeconds,
               window_title = @windowTitle,
               domain = @domain,
               url = @url,
               browser_name = @browserName,
               confidence = @confidence,
               is_idle = @isIdle
           where id = @id`,
        )
        .run({
          id: latestOpen.id,
          durationSeconds,
          windowTitle: sample.windowTitle,
          domain: sample.domain ?? null,
          url: sample.url ?? null,
          browserName: sample.browserName ?? null,
          confidence: resolved.confidence,
          isIdle: sample.isIdle ? 1 : 0,
        });
      return;
    }

    const event: ActivityEvent = {
      id: randomUUID(),
      startedAt: now,
      endedAt: null,
      durationSeconds: 0,
      sourceType: sample.sourceType,
      appName: sample.appName,
      windowTitle: sample.windowTitle,
      domain: sample.domain ?? null,
      url: sample.url ?? null,
      browserName: sample.browserName ?? null,
      classification: resolved.classification,
      category: resolved.category,
      sourceLabel: resolved.sourceLabel,
      matchedRuleId: resolved.matchedRuleId,
      isIdle: sample.isIdle,
      confidence: resolved.confidence,
      createdAt: now,
    };

    this.insertActivityEvent(event);
  }

  close() {
    this.db.close();
  }

  closeOpenActivityEvent(endedAt = new Date().toISOString()) {
    const row = this.db
      .prepare(
        `select id
         from activity_events
         where ended_at is null
         order by started_at desc
         limit 1`,
      )
      .get() as { id: string } | undefined;

    if (!row) {
      return;
    }

    this.closeActivityEvent(row.id, endedAt);
  }

  getHealthStatus(): "healthy" | "warning" | "error" {
    try {
      this.db.prepare("select 1").get();
      return "healthy";
    } catch {
      return "error";
    }
  }

  getDatabasePath() {
    return this.dbPath;
  }

  private resetLegacySchemaIfNeeded() {
    const table = this.db
      .prepare(
        `select name
         from sqlite_master
         where type = 'table' and name = 'activity_events'`,
      )
      .get() as { name: string } | undefined;

    if (!table) {
      return;
    }

    const columns = this.db.prepare(`pragma table_info(activity_events)`).all() as Array<{ name: string }>;
    const hasNewShape = columns.some((column) => column.name === "source_type");

    if (hasNewShape) {
      return;
    }

    this.db.exec(`
      drop table if exists activity_events;
      drop table if exists study_sessions;
      drop table if exists rules;
      drop table if exists settings;
      drop table if exists browser_activity_cache;
    `);
  }

  private createSchema() {
    this.db.exec(`
      create table if not exists activity_events (
        id text primary key,
        started_at text not null,
        ended_at text,
        duration_seconds integer not null,
        source_type text not null,
        app_name text not null,
        window_title text not null,
        domain text,
        url text,
        browser_name text,
        classification text not null,
        category text not null,
        source_label text not null,
        matched_rule_id text,
        is_idle integer not null,
        confidence real not null,
        created_at text not null
      );

      create table if not exists study_sessions (
        id text primary key,
        started_at text not null,
        ended_at text not null,
        duration_seconds integer not null,
        classification text not null default 'study',
        category text not null,
        source_label text not null,
        primary_app_name text,
        primary_domain text,
        note text not null,
        session_type text not null default 'auto',
        created_at text not null,
        updated_at text not null
      );

      create table if not exists rules (
        id text primary key,
        name text not null,
        type text not null,
        pattern text not null,
        classification text not null,
        category text not null,
        source_label text not null,
        priority integer not null,
        enabled integer not null,
        preset_key text,
        created_at text not null,
        updated_at text not null
      );

      create table if not exists settings (
        id text primary key,
        theme_mode text not null,
        locale text not null,
        dashboard_timer_style text not null default 'dial',
        idle_threshold_minutes integer not null,
        launch_on_startup integer not null,
        minimize_to_tray integer not null,
        allow_local_exports integer not null,
        updated_at text not null
      );

      create table if not exists browser_activity_cache (
        id text primary key,
        browser text not null,
        tab_id integer,
        window_id integer,
        url text not null,
        domain text not null,
        title text not null,
        page_type text,
        is_active integer not null,
        captured_at text not null
      );

      create index if not exists idx_activity_events_started_at on activity_events(started_at);
      create index if not exists idx_activity_events_matched_rule_id on activity_events(matched_rule_id);
      create index if not exists idx_browser_cache_captured_at on browser_activity_cache(captured_at);
    `);
  }

  private ensureSettingsColumns() {
    const columns = this.db.prepare(`pragma table_info(settings)`).all() as Array<{ name: string }>;
    const hasTimerStyle = columns.some((column) => column.name === "dashboard_timer_style");

    if (!hasTimerStyle) {
      this.db.prepare(`alter table settings add column dashboard_timer_style text not null default 'dial'`).run();
    }
  }

  private getReferenceDate() {
    const row = this.db
      .prepare(`select date(max(started_at)) as date from activity_events`)
      .get() as { date: string | null };
    return row.date;
  }

  private getTodayDateKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private ensureDefaultSettings() {
    const row = this.db
      .prepare(`select id from settings where id = 'default'`)
      .get() as { id: string } | undefined;

    if (row) {
      return;
    }

    this.db
      .prepare(
        `insert into settings (
           id,
           theme_mode,
           locale,
           dashboard_timer_style,
           idle_threshold_minutes,
           launch_on_startup,
           minimize_to_tray,
           allow_local_exports,
           updated_at
         ) values (
           'default',
           @themeMode,
           @locale,
           @dashboardTimerStyle,
           @idleThresholdMinutes,
           @launchOnStartup,
           @minimizeToTray,
           @allowLocalExports,
           @updatedAt
         )`,
      )
      .run({
        ...defaultTrackingConfig,
        launchOnStartup: defaultTrackingConfig.launchOnStartup ? 1 : 0,
        minimizeToTray: defaultTrackingConfig.minimizeToTray ? 1 : 0,
        allowLocalExports: defaultTrackingConfig.allowLocalExports ? 1 : 0,
        updatedAt: new Date().toISOString(),
      });
  }

  private insertActivityEvent(event: ActivityEvent) {
    this.db
      .prepare(
        `insert into activity_events (
           id,
           started_at,
           ended_at,
           duration_seconds,
           source_type,
           app_name,
           window_title,
           domain,
           url,
           browser_name,
           classification,
           category,
           source_label,
           matched_rule_id,
           is_idle,
           confidence,
           created_at
         ) values (
           @id,
           @startedAt,
           @endedAt,
           @durationSeconds,
           @sourceType,
           @appName,
           @windowTitle,
           @domain,
           @url,
           @browserName,
           @classification,
           @category,
           @sourceLabel,
           @matchedRuleId,
           @isIdle,
           @confidence,
           @createdAt
         )`,
      )
      .run({
        ...event,
        isIdle: event.isIdle ? 1 : 0,
      });
  }

  private closeActivityEvent(id: string, endedAt: string) {
    const row = this.db
      .prepare(
        `select
           id,
           started_at,
           ended_at,
           duration_seconds,
           source_type,
           app_name,
           window_title,
           domain,
           url,
           browser_name,
           classification,
           category,
           source_label,
           matched_rule_id,
           is_idle,
           confidence,
           created_at
         from activity_events
         where id = ?`,
      )
      .get(id) as ActivityEventRow | undefined;

    if (!row || row.ended_at) {
      return;
    }

    const durationSeconds = Math.max(
      row.duration_seconds,
      Math.round((new Date(endedAt).getTime() - new Date(row.started_at).getTime()) / 1000),
    );

    this.db
      .prepare(
        `update activity_events
         set ended_at = ?,
             duration_seconds = ?
         where id = ?`,
      )
      .run(endedAt, durationSeconds, id);

    if (row.classification === "study") {
      this.db
        .prepare(
          `insert or replace into study_sessions (
             id,
             started_at,
             ended_at,
             duration_seconds,
             classification,
             category,
             source_label,
             primary_app_name,
             primary_domain,
             note,
             session_type,
             created_at,
             updated_at
           ) values (
             @id,
             @startedAt,
             @endedAt,
             @durationSeconds,
             'study',
             @category,
             @sourceLabel,
             @primaryAppName,
             @primaryDomain,
             @note,
             'auto',
             @createdAt,
             @updatedAt
           )`,
        )
        .run({
          id: row.id,
          startedAt: row.started_at,
          endedAt,
          durationSeconds,
          category: row.category,
          sourceLabel: row.source_label,
          primaryAppName: row.app_name,
          primaryDomain: row.domain,
          note: row.window_title,
          createdAt: row.created_at,
          updatedAt: endedAt,
        });
    }
  }

  private resolveRule(sample: ActiveWindowSnapshot): ResolvedRule {
    if (sample.isIdle) {
      return {
        classification: "neutral",
        category: "general",
        sourceLabel: "Idle",
        matchedRuleId: null,
        confidence: 0.25,
      };
    }

    if (sample.isInternalApp) {
      return {
        classification: "ignore",
        category: "general",
        sourceLabel: "StudyFlow",
        matchedRuleId: null,
        confidence: 1,
      };
    }

    const rules = this.listRules()
      .filter((rule) => rule.enabled)
      .sort((a, b) => {
        if (b.priority !== a.priority) {
          return b.priority - a.priority;
        }
        return this.ruleSpecificityWeight(b.type) - this.ruleSpecificityWeight(a.type);
      });

    for (const rule of rules) {
      if (this.ruleMatches(rule, sample)) {
        return {
          classification: rule.classification,
          category: rule.category,
          sourceLabel: rule.sourceLabel,
          matchedRuleId: rule.id,
          confidence: sample.sourceType === "browser" ? 0.94 : 0.86,
        };
      }
    }

    return {
      classification: "neutral",
      category: sample.sourceType === "browser" ? "course" : "general",
      sourceLabel: sample.domain ?? sample.appName,
      matchedRuleId: null,
      confidence: sample.sourceType === "browser" ? 0.66 : 0.58,
    };
  }

  private ruleSpecificityWeight(type: RuleType) {
    switch (type) {
      case "url_prefix":
        return 5;
      case "url_contains":
        return 4;
      case "domain_equals":
        return 3;
      case "window_title_contains":
        return 2;
      case "app_name_equals":
        return 1;
      default:
        return 0;
    }
  }

  private ruleMatches(rule: Rule, sample: ActiveWindowSnapshot) {
    const pattern = rule.pattern.toLowerCase();
    switch (rule.type) {
      case "app_name_equals":
        return sample.appName.toLowerCase() === pattern;
      case "window_title_contains":
        return sample.windowTitle.toLowerCase().includes(pattern);
      case "domain_equals":
        return (sample.domain ?? "").toLowerCase() === pattern;
      case "url_prefix":
        return (sample.url ?? "").toLowerCase().startsWith(pattern);
      case "url_contains":
        return (sample.url ?? "").toLowerCase().includes(pattern);
      default:
        return false;
    }
  }

  private canMerge(openRow: ActivityEventRow, sample: ActiveWindowSnapshot, resolved: ResolvedRule) {
    return (
      openRow.source_type === sample.sourceType &&
      openRow.app_name === sample.appName &&
      openRow.window_title === sample.windowTitle &&
      (openRow.domain ?? null) === (sample.domain ?? null) &&
      (openRow.url ?? null) === (sample.url ?? null) &&
      openRow.classification === resolved.classification &&
      openRow.category === resolved.category &&
      openRow.source_label === resolved.sourceLabel &&
      (openRow.matched_rule_id ?? null) === (resolved.matchedRuleId ?? null) &&
      Boolean(openRow.is_idle) === sample.isIdle
    );
  }

  private mapActivityEvent(row: ActivityEventRow): ActivityEvent {
    return {
      id: row.id,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds,
      sourceType: row.source_type,
      appName: row.app_name,
      windowTitle: row.window_title,
      domain: row.domain,
      url: row.url,
      browserName: row.browser_name,
      classification: row.classification,
      category: row.category,
      sourceLabel: row.source_label,
      matchedRuleId: row.matched_rule_id,
      isIdle: Boolean(row.is_idle),
      confidence: row.confidence,
      createdAt: row.created_at,
    };
  }

  private cacheBrowserActivity(sample: ActiveWindowSnapshot) {
    this.db
      .prepare(
        `insert into browser_activity_cache (
           id,
           browser,
           tab_id,
           window_id,
           url,
           domain,
           title,
           page_type,
           is_active,
           captured_at
         ) values (
           @id,
           @browser,
           null,
           null,
           @url,
           @domain,
           @title,
           @pageType,
           1,
           @capturedAt
         )`,
      )
      .run({
        id: randomUUID(),
        browser: sample.browserName ?? sample.appName,
        url: sample.url,
        domain: sample.domain,
        title: sample.windowTitle,
        pageType: sample.pageType ?? null,
        capturedAt: sample.capturedAt,
      });

    this.pruneBrowserActivityCache();
  }

  private pruneBrowserActivityCache() {
    this.db.prepare(`delete from browser_activity_cache where captured_at < datetime('now', '-3 day')`).run();
    this.db.prepare(
      `delete from browser_activity_cache
       where id not in (
         select id
         from browser_activity_cache
         order by captured_at desc
         limit 5000
       )`,
    ).run();
  }
}
