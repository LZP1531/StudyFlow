import { useEffect, useMemo, useRef, useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import { formatDurationSeconds, formatTimeRange } from "../../lib/formatters";
import type { ActivityEvent, StudySession } from "../../types/study";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AppIcon, DatabaseIcon, GlobeIcon, SearchIcon } from "../../components/icons";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
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
  timelineIconKindForEvent,
  timelineIconKindForSession,
} from "./timeline.helpers";

function TimelineRecordIcon(props: { kind: TimelineIconKind }) {
  return (
    <div className={`timeline-record-icon ${props.kind}`}>
      {props.kind === "site" ? <GlobeIcon /> : props.kind === "system" ? <DatabaseIcon /> : <AppIcon />}
    </div>
  );
}

const timelineRenderConfig = {
  initialVisibleCount: 120,
  loadMoreStep: 80,
  loadMoreThresholdPx: 320,
  smoothScrollRecordThreshold: 200,
} as const;

export function TimelineView(props: {
  sessions: StudySession[];
  events: ActivityEvent[];
  locale: Locale;
  text: Messages;
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
        searchPlaceholder: viewMode === "sessions" ? "搜索来源、应用、域名或备注" : "搜索来源、应用、域名、标题或网址",
        count: viewMode === "sessions" ? `${sessions.length} 条学习记录` : `${events.length} 条详细记录`,
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
      }
    : {
        sessions: "Study Log",
        events: "Detailed Log",
        all: "All",
        app: "App",
        site: "Site",
        searchPlaceholder: viewMode === "sessions" ? "Search source, app, domain, or note" : "Search source, app, domain, title, or URL",
        count: viewMode === "sessions" ? `${sessions.length} study records` : `${events.length} detailed records`,
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
  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
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
    [classificationFilter, normalizedSearch, sessions, sourceFilter],
  );
  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
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
    [classificationFilter, events, normalizedSearch, sourceFilter],
  );
  const visibleSessions = useMemo(
    () => filteredSessions.slice(0, visibleCount),
    [filteredSessions, visibleCount],
  );
  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount],
  );
  const hasAnyData = viewMode === "sessions" ? sessions.length > 0 : events.length > 0;
  const isFilteredEmpty = viewMode === "sessions" ? filteredSessions.length === 0 : filteredEvents.length === 0;
  const hasMoreRecords = viewMode === "sessions" ? visibleSessions.length < filteredSessions.length : visibleEvents.length < filteredEvents.length;

  useEffect(() => {
    setVisibleCount(timelineRenderConfig.initialVisibleCount);
  }, [viewMode, classificationFilter, sourceFilter, normalizedSearch]);

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
            <div className="timeline-toolbar-row">
              <div className="timeline-search-block">
                <p className="eyebrow timeline-eyebrow">TIMELINE</p>
                <label className="rule-search-shell timeline-search-shell">
                  <span className="rule-search-icon" aria-hidden="true"><SearchIcon /></span>
                  <input className="rule-search-input" onChange={(event) => setSearch(event.target.value)} placeholder={timelineText.searchPlaceholder} value={search} />
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
                  <SegmentedButtonGroup value={classificationFilter} options={classificationOptions} onChange={setClassificationFilter} />
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

        <div className="timeline-scroll-area" ref={scrollAreaRef}>
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
              ? visibleSessions.map((session) => (
                  <article key={session.id} className="timeline-record-row">
                    <div className="timeline-record-time">
                      <strong>{formatTimeRange(session.startedAt, session.endedAt, locale)}</strong>
                      <span>{formatDurationSeconds(session.durationSeconds, locale)}</span>
                    </div>
                    <div className="timeline-record-icon-column"><TimelineRecordIcon kind={timelineIconKindForSession(session)} /></div>
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
                      <strong>{formatTimeRange(event.startedAt, event.endedAt, locale)}</strong>
                      <span>{formatDurationSeconds(event.durationSeconds, locale)}</span>
                    </div>
                    <div className="timeline-record-icon-column"><TimelineRecordIcon kind={timelineIconKindForEvent(event)} /></div>
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
