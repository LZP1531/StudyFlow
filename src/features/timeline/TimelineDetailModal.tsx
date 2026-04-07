import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import { formatDurationSeconds } from "../../lib/formatters";
import { CloseIcon } from "../../components/icons";
import { categoryLabel, classificationLabel } from "../shared/viewLabels";
import {
  formatTimelineDateTime,
  TimelineDetailSelection,
  timelineSessionTypeLabel,
  timelineSourceTypeLabel,
} from "./timeline.helpers";

export function TimelineDetailModal(props: {
  locale: Locale;
  selection: TimelineDetailSelection;
  text: Messages;
  onClose: () => void;
}) {
  const { locale, selection, text } = props;
  if (!selection) {
    return null;
  }

  const detailText = locale === "zh"
    ? {
        title: selection.mode === "sessions" ? "学习记录详情" : "详细记录详情",
        field: "字段",
        empty: "暂无",
        close: "关闭",
        labels: {
          startedAt: "开始时间",
          endedAt: "结束时间",
          durationSeconds: "时长",
          sourceLabel: "来源标签",
          classification: "分类",
          category: "类别",
          primaryAppName: "主要应用",
          primaryDomain: "主要域名",
          note: "说明",
          sessionType: "记录类型",
          createdAt: "创建时间",
          updatedAt: "更新时间",
          sourceType: "来源类型",
          appName: "应用名",
          windowTitle: "窗口标题",
          domain: "域名",
          url: "网址",
          browserName: "浏览器",
          matchedRuleId: "命中规则 ID",
          isIdle: "是否空闲",
          confidence: "可信度",
        },
      }
    : {
        title: selection.mode === "sessions" ? "Study Record Details" : "Detailed Record Details",
        field: "Field",
        empty: "Unavailable",
        close: "Close",
        labels: {
          startedAt: "Started at",
          endedAt: "Ended at",
          durationSeconds: "Duration",
          sourceLabel: "Source label",
          classification: "Classification",
          category: "Category",
          primaryAppName: "Primary app",
          primaryDomain: "Primary domain",
          note: "Note",
          sessionType: "Record type",
          createdAt: "Created at",
          updatedAt: "Updated at",
          sourceType: "Source type",
          appName: "App name",
          windowTitle: "Window title",
          domain: "Domain",
          url: "URL",
          browserName: "Browser",
          matchedRuleId: "Matched rule ID",
          isIdle: "Idle",
          confidence: "Confidence",
        },
      };

  const rows =
    selection.mode === "sessions"
      ? [
          { label: detailText.labels.startedAt, value: formatTimelineDateTime(selection.session.startedAt, locale) },
          { label: detailText.labels.endedAt, value: formatTimelineDateTime(selection.session.endedAt, locale) },
          { label: detailText.labels.durationSeconds, value: formatDurationSeconds(selection.session.durationSeconds, locale) },
          { label: detailText.labels.sourceLabel, value: selection.session.sourceLabel },
          { label: detailText.labels.classification, value: classificationLabel(selection.session.classification, text) },
          { label: detailText.labels.category, value: categoryLabel(selection.session.category, locale) },
          { label: detailText.labels.primaryAppName, value: selection.session.primaryAppName ?? detailText.empty },
          { label: detailText.labels.primaryDomain, value: selection.session.primaryDomain ?? detailText.empty },
          { label: detailText.labels.note, value: selection.session.note || detailText.empty },
          { label: detailText.labels.sessionType, value: timelineSessionTypeLabel(selection.session.sessionType, locale) },
          { label: detailText.labels.createdAt, value: formatTimelineDateTime(selection.session.createdAt, locale) },
          { label: detailText.labels.updatedAt, value: formatTimelineDateTime(selection.session.updatedAt, locale) },
        ]
      : [
          { label: detailText.labels.startedAt, value: formatTimelineDateTime(selection.event.startedAt, locale) },
          {
            label: detailText.labels.endedAt,
            value: selection.event.endedAt ? formatTimelineDateTime(selection.event.endedAt, locale) : detailText.empty,
          },
          { label: detailText.labels.durationSeconds, value: formatDurationSeconds(selection.event.durationSeconds, locale) },
          { label: detailText.labels.sourceType, value: timelineSourceTypeLabel(selection.event.sourceType, locale) },
          { label: detailText.labels.appName, value: selection.event.appName },
          { label: detailText.labels.windowTitle, value: selection.event.windowTitle },
          { label: detailText.labels.domain, value: selection.event.domain ?? detailText.empty },
          { label: detailText.labels.url, value: selection.event.url ?? detailText.empty },
          { label: detailText.labels.browserName, value: selection.event.browserName ?? detailText.empty },
          { label: detailText.labels.sourceLabel, value: selection.event.sourceLabel },
          { label: detailText.labels.classification, value: classificationLabel(selection.event.classification, text) },
          { label: detailText.labels.category, value: categoryLabel(selection.event.category, locale) },
          { label: detailText.labels.matchedRuleId, value: selection.event.matchedRuleId ?? detailText.empty },
          { label: detailText.labels.isIdle, value: selection.event.isIdle ? "true" : "false" },
          { label: detailText.labels.confidence, value: `${Math.round(selection.event.confidence * 100)}%` },
          { label: detailText.labels.createdAt, value: formatTimelineDateTime(selection.event.createdAt, locale) },
        ];

  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div className="modal-panel glass soft-panel timeline-detail-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{detailText.field}</p>
            <h2>{detailText.title}</h2>
          </div>
          <button className="icon-close" onClick={props.onClose} type="button">
            <CloseIcon />
          </button>
        </div>

        <div className="timeline-detail-grid">
          {rows.map((row) => (
            <div className="timeline-detail-row" key={row.label}>
              <strong>{row.label}</strong>
              <p>{row.value}</p>
            </div>
          ))}
        </div>

        <div className="rules-detail-actions">
          <button className="ghost-button" onClick={props.onClose} type="button">
            {detailText.close}
          </button>
        </div>
      </div>
    </div>
  );
}
