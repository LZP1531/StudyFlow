import { useEffect, useMemo, useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import type { Classification, Rule, RuleInput, StudyCategory } from "../../types/study";
import { SearchIcon } from "../../components/icons";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
import { classificationLabel } from "../shared/viewLabels";
import { RuleCreateModal } from "./RuleCreateModal";
import { RuleDetailPanel } from "./RuleDetailPanel";
import { ruleObjectKind, type RuleObjectKind } from "./rules.helpers";
import type { RuleCreateSeed } from "../../app/useAppShellState";

function categoryLabel(category: StudyCategory, locale: Locale) {
  const zh: Record<StudyCategory, string> = {
    flashcard: "闪卡",
    note: "笔记",
    reading: "阅读",
    course: "课程",
    video_course: "视频课程",
    coding: "编程",
    general: "通用",
  };
  const en: Record<StudyCategory, string> = {
    flashcard: "Flashcard",
    note: "Notes",
    reading: "Reading",
    course: "Course",
    video_course: "Video course",
    coding: "Coding",
    general: "General",
  };

  return locale === "zh" ? zh[category] : en[category];
}

function objectKindLabel(kind: RuleObjectKind, locale: Locale) {
  if (locale === "zh") {
    return kind === "app" ? "应用" : "网站";
  }
  return kind === "app" ? "App" : "Site";
}

export function RulesView(props: {
  locale: Locale;
  rules: Rule[];
  text: Messages;
  onCreateRule: (input: RuleInput) => Promise<Rule>;
  onUpdateRule: (id: string, input: Partial<RuleInput>) => Promise<Rule>;
  onDeleteRule: (id: string) => Promise<void>;
  createSeed?: RuleCreateSeed | null;
  createSeedKey?: number;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [localRules, setLocalRules] = useState(props.rules);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(props.rules[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState<"all" | Classification>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | RuleObjectKind>("all");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { locale, text } = props;

  useEffect(() => {
    setLocalRules(props.rules);
    setSelectedRuleId((current) => current ?? props.rules[0]?.id ?? null);
  }, [props.rules]);

  useEffect(() => {
    if (!feedback) {
      return;
    }
    const timer = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!props.createSeed || props.createSeedKey === undefined) {
      return;
    }

    setIsCreateOpen(true);
  }, [props.createSeed, props.createSeedKey]);

  const filteredRules = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return localRules.filter((rule) => {
      const matchesSearch =
        !searchValue ||
        rule.name.toLowerCase().includes(searchValue) ||
        rule.pattern.toLowerCase().includes(searchValue) ||
        rule.sourceLabel.toLowerCase().includes(searchValue);
      const matchesClassification =
        classificationFilter === "all" || rule.classification === classificationFilter;
      const matchesSource =
        sourceFilter === "all" || ruleObjectKind(rule.type) === sourceFilter;
      return matchesSearch && matchesClassification && matchesSource;
    });
  }, [classificationFilter, localRules, search, sourceFilter]);

  const selectedRule =
    filteredRules.find((rule) => rule.id === selectedRuleId) ??
    localRules.find((rule) => rule.id === selectedRuleId) ??
    filteredRules[0] ??
    null;

  useEffect(() => {
    if (selectedRule && selectedRule.id !== selectedRuleId) {
      setSelectedRuleId(selectedRule.id);
    }
  }, [selectedRule, selectedRuleId]);

  async function handleCreateRule(input: RuleInput) {
    const created = await props.onCreateRule(input);
    setLocalRules((current) => [created, ...current]);
    setSelectedRuleId(created.id);
    setIsCreateOpen(false);
    setFeedback(locale === "zh" ? "规则已创建" : "Rule created");
  }

  async function handleUpdateRule(id: string, input: Partial<RuleInput>) {
    const updated = await props.onUpdateRule(id, input);
    setLocalRules((current) => current.map((rule) => (rule.id === id ? updated : rule)));
  }

  async function handleDeleteRule(id: string) {
    await props.onDeleteRule(id);
    setLocalRules((current) => current.filter((rule) => rule.id !== id));
    setSelectedRuleId((current) => (current === id ? null : current));
  }

  return (
    <div className="page rules-page">
      <section className="rules-workspace">
        <div className="rules-list-panel glass soft-panel">
          <div className="rules-toolbar">
            <div className="rules-search-row">
              <label className="rule-search-shell">
                <span className="rule-search-icon" aria-hidden="true">
                  <SearchIcon />
                </span>
                <input
                  className="rule-search-input"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    locale === "zh"
                      ? "搜索规则名称、匹配内容或显示标签"
                      : "Search name, pattern, or label"
                  }
                  value={search}
                />
              </label>
              <button className="primary-button" onClick={() => setIsCreateOpen(true)} type="button">
                + {text.rules.add}
              </button>
            </div>
            <SegmentedButtonGroup
              value={sourceFilter}
              options={[
                { value: "all", label: locale === "zh" ? "全部" : "All" },
                { value: "app", label: objectKindLabel("app", locale) },
                { value: "site", label: objectKindLabel("site", locale) },
              ]}
              onChange={setSourceFilter}
            />
            <SegmentedButtonGroup
              value={classificationFilter}
              options={[
                { value: "all", label: locale === "zh" ? "全部" : "All" },
                { value: "study", label: locale === "zh" ? "学习" : "Study" },
                { value: "distraction", label: locale === "zh" ? "娱乐" : "Distraction" },
                { value: "neutral", label: locale === "zh" ? "中性" : "Neutral" },
              ]}
              onChange={setClassificationFilter}
            />
          </div>

          <div className="rules-list">
            {filteredRules.map((rule) => {
              const objectKind = ruleObjectKind(rule.type);
              const displayClassification =
                (rule.classification === "ignore" ? "neutral" : rule.classification) as Classification;
              return (
                <button
                  className={`rule-list-item ${selectedRule?.id === rule.id ? "active" : ""}`}
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  type="button"
                >
                  <div className="rule-list-head">
                    <strong>{rule.name}</strong>
                    <span className={`toggle ${rule.enabled ? "on" : ""}`}>
                      {rule.enabled ? text.rules.enabled : text.rules.disabled}
                    </span>
                  </div>
                  <div className="rule-list-line compact">
                    <span className="rule-object-pill">{objectKindLabel(objectKind, locale)}</span>
                    <span className="rule-list-pattern">{rule.pattern}</span>
                  </div>
                  <div className="rule-list-meta">
                    <span className={`classification ${displayClassification}`}>
                      {classificationLabel(displayClassification, text)}
                    </span>
                    <span>{categoryLabel(rule.category, locale)}</span>
                    <span>{locale === "zh" ? `今日命中 ${rule.hitsToday}` : `Hits ${rule.hitsToday}`}</span>
                    <span>P{rule.priority}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rules-detail-panel glass soft-panel">
          {selectedRule ? (
            <RuleDetailPanel
              locale={locale}
              onDelete={handleDeleteRule}
              onNotice={setFeedback}
              onUpdate={handleUpdateRule}
              rule={selectedRule}
              text={text}
            />
          ) : (
            <div className="rules-empty-state">
              <strong>{locale === "zh" ? "没有匹配的规则" : "No matching rules"}</strong>
              <p>{locale === "zh" ? "试试调整筛选条件，或新建一条规则。" : "Try changing filters or create a new rule."}</p>
            </div>
          )}
          {feedback ? <div className="rules-feedback">{feedback}</div> : null}
        </div>
      </section>

      {isCreateOpen ? (
        <RuleCreateModal
          initialDraft={props.createSeed?.initialDraft}
          initialKind={props.createSeed?.kind}
          locale={locale}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateRule}
          text={text}
        />
      ) : null}
    </div>
  );
}
