import { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import { formatDurationSeconds } from "../../lib/formatters";
import type { ActivityEvent, StudySession } from "../../types/study";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SearchIcon, TimelineIcon } from "../../components/icons";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
import { SourceIdentityIcon } from "../shared/SourceIdentityIcon";
import { categoryLabel, classificationLabel } from "../shared/viewLabels";
import { TimelineDetailModal } from "./TimelineDetailModal";
import {
  matchesTimelineSourceFilterForEvent,
  matchesTimelineSourceFilterForSession,
  TimelineClassificationFilter,
  TimelineDetailSelection,
  TimelineIconKind,
  TimelineSourceFilter,
  TimelineViewMode,
  formatTimelineRecordRange,
  timelineIconKindForEvent,
  timelineIconKindForSession,
} from "./timeline.helpers";

type TimelineRangePreset = "today" | "last7days" | "last30days" | "all";
type TimelineSortOrder = "desc" | "asc";

function TimelineRecordIcon(props: {
  kind: TimelineIconKind;
  sourceLabel?: string | null;
  appName?: string | null;
  domain?: string | null;
  browserName?: string | null;
  url?: string | null;
}) {
  return (
    <div className={`timeline-record-icon ${props.kind}`}>
      <SourceIdentityIcon
        appName={props.appName}
        browserName={props.browserName}
        className="timeline-source-identity"
        domain={props.domain}
        sourceKind={props.kind === "system" ? "system" : props.kind === "site" ? "site" : "app"}
        sourceLabel={props.sourceLabel}
        url={props.url}
      />
    </div>
  );
}

function TimelineEmptyState(props: {
  title: string;
  description: string;
  mode: "empty" | "filtered";
}) {
  const { title, description, mode } = props;
  return (
    <article className={`timeline-empty-state ${mode}`}>
      <div className="timeline-empty-art" aria-hidden="true">
        <svg viewBox="0 0 1024 1024" className="timeline-empty-illustration">
          <path d="M109.381818 658.618182a397.381818 73.890909 0 1 0 794.763637 0 397.381818 73.890909 0 1 0-794.763637 0Z" fill="#CFE0E3" />
          <path d="M158.254545 51.204655h11.636364V140.8H158.254545z" fill="#2186AB" />
          <path d="M119.272727 90.186473h89.595346v11.636363H119.272727zM863.204073 685.391127h5.669236v43.631709h-5.669236z" fill="#2186AB" />
          <path d="M844.218182 704.372364h43.636363v5.673891h-43.636363z" fill="#2186AB" />
          <path d="M793.018182 155.927273H473.6v-29.961309a28.797673 28.797673 0 0 0-28.797673-28.797673H295.2704a28.797673 28.797673 0 0 0-28.797673 28.797673V155.927273h-36.654545a21.527273 21.527273 0 0 0-21.527273 21.527272v134.981819a21.527273 21.527273 0 0 0 21.527273 21.527272h563.2A21.527273 21.527273 0 0 0 814.545455 312.436364v-134.981819a21.527273 21.527273 0 0 0-21.527273-21.527272z" fill="#CCE1E7" />
          <path d="M793.018182 338.618182h-563.2a26.205091 26.205091 0 0 1-26.181818-26.181818v-134.981819a26.205091 26.205091 0 0 1 26.181818-26.181818h32v-25.306763c0-18.445964 15.006255-33.452218 33.452218-33.452219h149.531927c18.445964 0 33.452218 15.006255 33.452218 33.452219V151.272727h314.763637A26.205091 26.205091 0 0 1 819.2 177.454545v134.981819a26.205091 26.205091 0 0 1-26.181818 26.181818z m-563.2-178.036364a16.891345 16.891345 0 0 0-16.872727 16.872727v134.981819a16.891345 16.891345 0 0 0 16.872727 16.872727h563.2A16.891345 16.891345 0 0 0 809.890909 312.436364v-134.981819a16.891345 16.891345 0 0 0-16.872727-16.872727H468.945455v-34.615854a24.171055 24.171055 0 0 0-24.143128-24.143128H295.2704a24.171055 24.171055 0 0 0-24.143127 24.143128V160.581818h-41.309091z" fill="#2186AB" />
          <path d="M821.904291 633.488291c-1.498764 13.935709-13.856582 25.129891-27.615418 25.129891H233.197382c-13.754182 0-26.107345-11.194182-27.610764-25.129891l-41.453382-384.958836c-1.950255-18.1248 9.341673-32.963491 25.246255-32.963491h648.731927c15.909236 0 27.201164 14.838691 25.250909 32.963491l-41.458036 384.958836z" fill="#E8F3F9" />
          <path d="M794.288873 663.272727H233.197382c-16.034909 0-30.496582-13.135127-32.237382-29.2864l-41.453382-384.963491c-1.168291-10.845091 1.903709-21.234036 8.429382-28.499781a28.509091 28.509091 0 0 1 21.443491-9.616291h648.731927a28.485818 28.485818 0 0 1 21.443491 9.616291c6.525673 7.265745 9.602327 17.650036 8.434036 28.499781l-41.453381 384.963491c-1.7408 16.151273-16.202473 29.2864-32.246691 29.2864zM189.379491 220.220509c-5.664582 0-10.682182 2.257455-14.517527 6.525673-4.7616 5.301527-6.986473 13.060655-6.102109 21.280582l41.453381 384.958836c1.247418 11.566545 11.557236 20.978036 22.984146 20.978036h561.096145c11.426909 0 21.741382-9.406836 22.984146-20.978036l41.453382-384.958836c0.884364-8.224582-1.340509-15.983709-6.10211-21.280582-3.835345-4.268218-8.8576-6.525673-14.522181-6.525673H189.379491z" fill="#2186AB" />
          <path d="M645.971782 370.743855c-49.412655 0-61.449309-41.439418-61.574982-41.909528a6.981818 6.981818 0 0 1 13.456291-3.732945c0.498036 1.731491 12.227491 40.136145 65.266036 29.933382a6.981818 6.981818 0 0 1 2.639128 13.712291 104.694691 104.694691 0 0 1-19.786473 1.9968zM362.109673 371.213964c-3.970327 0-8.098909-0.162909-12.3904-0.493382a6.981818 6.981818 0 1 1 1.065891-13.921746c24.431709 1.875782 43.012655-2.234182 53.732072-11.892363C413.733236 336.602764 414.254545 326.884073 414.254545 326.786327a6.981818 6.981818 0 0 1 13.958982 0.386328c-0.018618 0.633018-0.586473 15.709091-14.349963 28.104145-11.757382 10.593745-29.1328 15.937164-51.753891 15.937164zM512.186182 562.455273c-33.563927 0-56.878545-20.521891-57.222982-20.8384a6.981818 6.981818 0 0 1 9.346327-10.370328c1.885091 1.680291 44.367127 38.488436 95.8464-0.381672a6.986473 6.986473 0 0 1 8.420073 11.147636c-20.298473 15.318109-39.624145 20.442764-56.389818 20.442764z" fill="#2186AB" />
          <path d="M601.6 423.563636m-26.181818 0a26.181818 26.181818 0 1 0 52.363636 0 26.181818 26.181818 0 1 0-52.363636 0Z" fill="#2186AB" />
          <path d="M411.927273 423.563636m-26.181818 0a26.181818 26.181818 0 1 0 52.363636 0 26.181818 26.181818 0 1 0-52.363636 0Z" fill="#2186AB" />
        </svg>
      </div>
      <div className="timeline-empty-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </article>
  );
}

const timelineRenderConfig = {
  initialVisibleCount: 120,
  loadMoreStep: 80,
  loadMoreThresholdPx: 320,
  smoothScrollRecordThreshold: 200,
} as const;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function shiftDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getPresetRange(preset: TimelineRangePreset) {
  const now = new Date();
  if (preset === "all") {
    return null;
  }

  if (preset === "today") {
    return {
      start: startOfDay(now).getTime(),
      end: endOfDay(now).getTime(),
    };
  }

  if (preset === "last7days") {
    return {
      start: startOfDay(shiftDays(now, -6)).getTime(),
      end: endOfDay(now).getTime(),
    };
  }

  return {
    start: startOfDay(shiftDays(now, -29)).getTime(),
    end: endOfDay(now).getTime(),
  };
}

function recordMatchesPreset(startedAt: string, preset: TimelineRangePreset) {
  const range = getPresetRange(preset);
  if (!range) {
    return true;
  }

  const startedAtMs = new Date(startedAt).getTime();
  return startedAtMs >= range.start && startedAtMs <= range.end;
}

function compareTimelineStartedAt(startedAtA: string, startedAtB: string, sortOrder: TimelineSortOrder) {
  const timeA = new Date(startedAtA).getTime();
  const timeB = new Date(startedAtB).getTime();
  return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
}

export function TimelineView(props: {
  sessions: StudySession[];
  events: ActivityEvent[];
  locale: Locale;
  text: Messages;
  onDeleteStudySession: (id: string) => Promise<void>;
}) {
  const { sessions, events, locale, text } = props;
  const [viewMode, setViewMode] = useState<TimelineViewMode>("sessions");
  const [rangePreset, setRangePreset] = useState<TimelineRangePreset>("today");
  const [classificationFilter, setClassificationFilter] = useState<TimelineClassificationFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<TimelineSourceFilter>("all");
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>("desc");
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<TimelineDetailSelection>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<StudySession | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(timelineRenderConfig.initialVisibleCount);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  const timelineText = locale === "zh"
    ? {
        sessions: "学习记录",
        events: "详细记录",
        all: "全部",
        app: "应用",
        site: "网站",
        today: "今天",
        last7days: "近7天",
        last30days: "近一个月",
        allRange: "全部",
        descending: "倒序",
        ascending: "正序",
        rangeLabel: "当前窗口",
        rangeSummary: "学习 {minutes} / {sessions} 条学习记录 / {events} 条详细记录",
        searchPlaceholder: "搜索来源 / 应用 / 域名",
        count: viewMode === "sessions" ? "{count} 条学习记录" : "{count} 条详细记录",
        emptyTitle: "这里暂时还安安静静的",
        emptyDescription: "",
        filteredTitle: "这一轮筛选后，还没有找到合适的记录",
        filteredDescription: "可以试着放宽时间范围、切换视图，或者换个关键词看看。我们想找的内容，也许就在下一次轻轻一翻里。",
        details: "详情",
        delete: "删除",
        deleteTitle: "删除这条学习记录？",
        deleteDescription: "这会同时删除对应的学习记录和原始活动记录，且无法恢复。",
        deleteConfirm: "确认删除",
        deleteCancel: "取消",
        backToTop: "回到顶部",
      }
    : {
        sessions: "Study Log",
        events: "Detailed Log",
        all: "All",
        app: "App",
        site: "Site",
        today: "Today",
        last7days: "Last 7 days",
        last30days: "Last 30 days",
        allRange: "All",
        descending: "Descending",
        ascending: "Ascending",
        rangeLabel: "Window",
        rangeSummary: "Study {minutes} / {sessions} study records / {events} detailed records",
        searchPlaceholder: "Search source / app / domain",
        count: viewMode === "sessions" ? "{count} study records" : "{count} detailed records",
        emptyTitle: "The timeline is still resting for now",
        emptyDescription: "Once a study session begins, your focus will gently gather here and form a clearer rhythm over time.",
        filteredTitle: "Nothing matched this view just yet",
        filteredDescription: "Try widening the range, switching views, or using a softer keyword. The record you want may be one small step away.",
        details: "Details",
        delete: "Delete",
        deleteTitle: "Delete this study record?",
        deleteDescription: "This will also delete the linked raw activity record and cannot be undone.",
        deleteConfirm: "Delete",
        deleteCancel: "Cancel",
        backToTop: "Back to top",
      };

  const classificationOptions: Array<{ value: TimelineClassificationFilter; label: string }> =
    viewMode === "sessions"
      ? []
      : [
          { value: "all", label: timelineText.all },
          { value: "study", label: text.classification.study },
          { value: "distraction", label: text.classification.distraction },
          { value: "neutral", label: text.classification.neutral },
        ];

  const rangePresetOptions: Array<{ value: TimelineRangePreset; label: string }> = [
    { value: "today", label: timelineText.today },
    { value: "last7days", label: timelineText.last7days },
    { value: "last30days", label: timelineText.last30days },
    { value: "all", label: timelineText.allRange },
  ];

  const normalizedSearch = search.trim().toLowerCase();

  const rangeFilteredSessions = useMemo(
    () => sessions.filter((session) => recordMatchesPreset(session.startedAt, rangePreset)),
    [rangePreset, sessions],
  );
  const rangeFilteredEvents = useMemo(
    () => events.filter((event) => recordMatchesPreset(event.startedAt, rangePreset)),
    [events, rangePreset],
  );

  const filteredSessions = useMemo(
    () =>
      rangeFilteredSessions.filter((session) => {
        const matchesClassification = classificationFilter === "all" || classificationFilter === "study";
        const matchesSource = matchesTimelineSourceFilterForSession(session, sourceFilter);
        const matchesSearch =
          !normalizedSearch ||
          session.sourceLabel.toLowerCase().includes(normalizedSearch) ||
          (session.primaryAppName ?? "").toLowerCase().includes(normalizedSearch) ||
          (session.primaryDomain ?? "").toLowerCase().includes(normalizedSearch) ||
          session.note.toLowerCase().includes(normalizedSearch);
        return matchesClassification && matchesSource && matchesSearch;
      }),
    [classificationFilter, normalizedSearch, rangeFilteredSessions, sourceFilter],
  );
  const filteredEvents = useMemo(
    () =>
      rangeFilteredEvents.filter((event) => {
        const matchesClassification = classificationFilter === "all" || event.classification === classificationFilter;
        const matchesSource = matchesTimelineSourceFilterForEvent(event, sourceFilter);
        const matchesSearch =
          !normalizedSearch ||
          event.sourceLabel.toLowerCase().includes(normalizedSearch) ||
          event.appName.toLowerCase().includes(normalizedSearch) ||
          (event.domain ?? "").toLowerCase().includes(normalizedSearch) ||
          event.windowTitle.toLowerCase().includes(normalizedSearch) ||
          (event.url ?? "").toLowerCase().includes(normalizedSearch);
        return matchesClassification && matchesSource && matchesSearch;
      }),
    [classificationFilter, normalizedSearch, rangeFilteredEvents, sourceFilter],
  );

  const sortedSessions = useMemo(
    () => [...filteredSessions].sort((left, right) => compareTimelineStartedAt(left.startedAt, right.startedAt, sortOrder)),
    [filteredSessions, sortOrder],
  );
  const sortedEvents = useMemo(
    () => [...filteredEvents].sort((left, right) => compareTimelineStartedAt(left.startedAt, right.startedAt, sortOrder)),
    [filteredEvents, sortOrder],
  );

  const visibleSessions = useMemo(() => sortedSessions.slice(0, visibleCount), [sortedSessions, visibleCount]);
  const visibleEvents = useMemo(() => sortedEvents.slice(0, visibleCount), [sortedEvents, visibleCount]);
  const hasAnyData = viewMode === "sessions" ? rangeFilteredSessions.length > 0 : rangeFilteredEvents.length > 0;
  const isFilteredEmpty = viewMode === "sessions" ? filteredSessions.length === 0 : filteredEvents.length === 0;
  const hasMoreRecords = viewMode === "sessions" ? visibleSessions.length < filteredSessions.length : visibleEvents.length < filteredEvents.length;
  const rangeStudySeconds = useMemo(
    () => rangeFilteredSessions.reduce((sum, session) => sum + session.durationSeconds, 0),
    [rangeFilteredSessions],
  );
  const countText = timelineText.count.replace("{count}", String(viewMode === "sessions" ? filteredSessions.length : filteredEvents.length));

  useEffect(() => {
    setVisibleCount(timelineRenderConfig.initialVisibleCount);
  }, [viewMode, classificationFilter, sourceFilter, normalizedSearch, rangePreset, sortOrder]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    const handleScroll = () => {
      if (scrollRafRef.current !== null) {
        return;
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const nextShowScrollTop = scrollArea.scrollTop > 240;
        setShowScrollTop((current) => (current === nextShowScrollTop ? current : nextShowScrollTop));

        const distanceToBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;
        if (distanceToBottom <= timelineRenderConfig.loadMoreThresholdPx) {
          setVisibleCount((current) => {
            const totalCount = viewMode === "sessions" ? filteredSessions.length : filteredEvents.length;
            return current >= totalCount ? current : Math.min(totalCount, current + timelineRenderConfig.loadMoreStep);
          });
        }
      });
    };

    handleScroll();
    scrollArea.addEventListener("scroll", handleScroll);
    return () => {
      scrollArea.removeEventListener("scroll", handleScroll);
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [filteredEvents.length, filteredSessions.length, viewMode]);

  function handleScrollToTop() {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }

    const totalVisibleRecords = viewMode === "sessions" ? visibleSessions.length : visibleEvents.length;
    scrollArea.scrollTo({
      top: 0,
      behavior: totalVisibleRecords <= timelineRenderConfig.smoothScrollRecordThreshold ? "smooth" : "auto",
    });
  }

  return (
    <div className="page timeline-page">
      <section className="timeline-workspace">
        <div className="timeline-toolbar-shell">
          <div className="timeline-toolbar">
            <div className="timeline-toolbar-head">
              <p className="eyebrow timeline-eyebrow">TIMELINE</p>
              <span className="muted-tag timeline-count-tag">{countText}</span>
            </div>

            <div className="timeline-toolbar-row timeline-toolbar-row-main">
              <div className="timeline-search-block timeline-search-block-compact">
                <label className="rule-search-shell timeline-search-shell">
                  <span className="rule-search-icon" aria-hidden="true"><SearchIcon /></span>
                  <input className="rule-search-input" onChange={(event) => setSearch(event.target.value)} placeholder={timelineText.searchPlaceholder} value={search} />
                </label>
              </div>

              <div className="timeline-inline-controls">
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
                  value={sourceFilter}
                  options={[
                    { value: "all", label: timelineText.all },
                    { value: "app", label: timelineText.app },
                    { value: "site", label: timelineText.site },
                  ]}
                  onChange={setSourceFilter}
                />
              </div>
            </div>

            <div className="timeline-toolbar-row timeline-toolbar-row-range">
              <div className="timeline-range-row">
                {viewMode === "events" ? (
                  <div className="timeline-inline-controls timeline-inline-controls-left">
                    <SegmentedButtonGroup value={classificationFilter} options={classificationOptions} onChange={setClassificationFilter} />
                  </div>
                ) : (
                  <div />
                )}
                <div className="timeline-inline-controls timeline-inline-controls-right">
                  <SegmentedButtonGroup value={rangePreset} options={rangePresetOptions} onChange={setRangePreset} />
                  <button
                    className="timeline-sort-toggle"
                    onClick={() => setSortOrder((current) => (current === "desc" ? "asc" : "desc"))}
                    type="button"
                  >
                    {sortOrder === "desc" ? timelineText.descending : timelineText.ascending}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-scroll-area" ref={scrollAreaRef}>
          <section className="timeline-record-list">
            {!hasAnyData ? (
              <TimelineEmptyState description={timelineText.emptyDescription} mode="empty" title={timelineText.emptyTitle} />
            ) : isFilteredEmpty ? (
              <TimelineEmptyState description={timelineText.filteredDescription} mode="filtered" title={timelineText.filteredTitle} />
            ) : null}

            {viewMode === "sessions"
              ? visibleSessions.map((session) => (
                  <article key={session.id} className="timeline-record-row">
                    <div className="timeline-record-time">
                      <strong>{formatTimelineRecordRange(session.startedAt, session.endedAt, locale)}</strong>
                      <span>{formatDurationSeconds(session.durationSeconds, locale)}</span>
                    </div>
                    <div className="timeline-record-icon-column"><TimelineRecordIcon kind={timelineIconKindForSession(session)} sourceLabel={session.sourceLabel} appName={session.primaryAppName} domain={session.primaryDomain} /></div>
                    <div className="timeline-record-label"><strong>{session.sourceLabel}</strong></div>
                    <div className="timeline-record-app">
                      <span>
                        {session.primaryAppName ?? (locale === "zh" ? "未知应用" : "Unknown app")}
                        {session.primaryDomain ? ` · ${session.primaryDomain}` : ""}
                      </span>
                    </div>
                    <div className="timeline-record-tags">
                      <span className={`classification ${session.classification}`}>{classificationLabel(session.classification, text)}</span>
                      <span className="timeline-tag-chip">{categoryLabel(session.category, locale)}</span>
                    </div>
                    <div className="timeline-record-actions">
                      <button className="ghost-button timeline-detail-button" onClick={() => setSelection({ mode: "sessions", session })} type="button">{timelineText.details}</button>
                      <button className="ghost-button timeline-delete-button" onClick={() => setPendingDelete(session)} type="button">{timelineText.delete}</button>
                    </div>
                  </article>
                ))
              : visibleEvents.map((event) => (
                  <article key={event.id} className="timeline-record-row">
                    <div className="timeline-record-time">
                      <strong>{formatTimelineRecordRange(event.startedAt, event.endedAt, locale)}</strong>
                      <span>{formatDurationSeconds(event.durationSeconds, locale)}</span>
                    </div>
                    <div className="timeline-record-icon-column"><TimelineRecordIcon kind={timelineIconKindForEvent(event)} sourceLabel={event.sourceLabel} appName={event.appName} domain={event.domain} browserName={event.browserName} url={event.url} /></div>
                    <div className="timeline-record-label"><strong>{event.sourceLabel}</strong></div>
                    <div className="timeline-record-app"><span>{event.sourceType === "browser" ? `${event.browserName ?? event.appName}${event.domain ? ` · ${event.domain}` : ""}` : event.appName}</span></div>
                    <div className="timeline-record-tags">
                      <span className={`classification ${event.classification}`}>{classificationLabel(event.classification, text)}</span>
                      <span className="timeline-tag-chip">{categoryLabel(event.category, locale)}</span>
                    </div>
                    <div className="timeline-record-actions">
                      <button className="ghost-button timeline-detail-button" onClick={() => setSelection({ mode: "events", event })} type="button">{timelineText.details}</button>
                    </div>
                  </article>
                ))}

            {hasMoreRecords ? (
              <div className="timeline-load-more-shell">
                <button
                  className="ghost-button timeline-load-more-button"
                  onClick={() => setVisibleCount((current) => current + timelineRenderConfig.loadMoreStep)}
                  type="button"
                >
                  {locale === "zh" ? "加载更多" : "Load more"}
                </button>
              </div>
            ) : null}
          </section>
        </div>

        {showScrollTop ? (
          <button className="timeline-scroll-top" onClick={handleScrollToTop} type="button">
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
