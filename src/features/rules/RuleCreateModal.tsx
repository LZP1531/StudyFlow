import { useEffect, useMemo, useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import { CloseIcon } from "../../components/icons";
import { DropdownSelect } from "../../components/DropdownSelect";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
import {
  buildRulePresetCatalog,
  type RulePresetCategoryKey,
} from "./rule-preset-catalog";
import { RuleBrandIcon } from "./RuleBrandIcons";
import type { RuleInput, StudyCategory } from "../../types/study";

type RuleObjectKind = "app" | "site";

type ModalCopy = {
  title: string;
  appliedPreset: string;
  save: string;
  cancel: string;
  objectType: string;
  ruleName: string;
  pattern: string;
  matchMode: string;
  classification: string;
  studyCategory: string;
  sourceLabel: string;
  priority: string;
  urlTipLabel: string;
  urlTip: string;
  modes: {
    domain: string;
    urlPrefix: string;
    urlContains: string;
    appName: string;
    titleKeyword: string;
  };
  classificationOptions: {
    study: string;
    distraction: string;
    neutral: string;
  };
};

function modalCopy(locale: Locale): ModalCopy {
  if (locale === "zh") {
    return {
      title: "新增规则",
      appliedPreset: "已应用模板",
      save: "保存规则",
      cancel: "取消",
      objectType: "对象类型",
      ruleName: "规则名称",
      pattern: "匹配内容",
      matchMode: "匹配方式",
      classification: "判定结果",
      studyCategory: "学习分类",
      sourceLabel: "显示标签",
      priority: "优先级",
      urlTipLabel: "填写建议",
      urlTip: "整站优先用域名匹配，更具体的页面再用 URL 前缀或 URL 包含。",
      modes: {
        domain: "域名",
        urlPrefix: "URL 前缀",
        urlContains: "URL 包含",
        appName: "应用名",
        titleKeyword: "标题关键字",
      },
      classificationOptions: {
        study: "学习",
        distraction: "娱乐",
        neutral: "中性",
      },
    };
  }

  return {
    title: "Add rule",
    appliedPreset: "Applied preset",
    save: "Save rule",
    cancel: "Cancel",
    objectType: "Object type",
    ruleName: "Rule name",
    pattern: "Pattern",
    matchMode: "Match mode",
    classification: "Classification",
    studyCategory: "Study category",
    sourceLabel: "Source label",
    priority: "Priority",
    urlTipLabel: "URL tip",
    urlTip: "Use domain for a whole site, and URL rules for more specific pages.",
    modes: {
      domain: "Domain",
      urlPrefix: "URL prefix",
      urlContains: "URL contains",
      appName: "App name",
      titleKeyword: "Title keyword",
    },
    classificationOptions: {
      study: "Study",
      distraction: "Distraction",
      neutral: "Neutral",
    },
  };
}

function objectKindLabel(kind: RuleObjectKind, locale: Locale) {
  if (locale === "zh") {
    return kind === "app" ? "应用" : "网站";
  }
  return kind === "app" ? "App" : "Site";
}

function nextRuleTypeForKind(kind: RuleObjectKind, currentType?: RuleInput["type"]): RuleInput["type"] {
  if (kind === "site") {
    return currentType === "url_prefix" || currentType === "url_contains" || currentType === "domain_equals"
      ? currentType
      : "domain_equals";
  }

  return currentType === "window_title_contains" || currentType === "app_name_equals"
    ? currentType
    : "app_name_equals";
}

function defaultRuleInputForKind(kind: RuleObjectKind, locale: Locale): RuleInput {
  if (kind === "app") {
    return {
      name: locale === "zh" ? "新的应用规则" : "New app rule",
      type: "app_name_equals",
      pattern: "",
      classification: "study",
      category: "general",
      sourceLabel: locale === "zh" ? "应用学习" : "App study",
      priority: 90,
      enabled: true,
      presetKey: "custom",
    };
  }

  return {
    name: locale === "zh" ? "新的网站规则" : "New site rule",
    type: "domain_equals",
    pattern: "",
    classification: "study",
    category: "course",
    sourceLabel: locale === "zh" ? "课程网站" : "Course site",
    priority: 95,
    enabled: true,
    presetKey: "custom",
  };
}

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

export function RuleCreateModal(props: {
  locale: Locale;
  text: Messages;
  onClose: () => void;
  onCreate: (input: RuleInput) => Promise<void>;
}) {
  const presets = useMemo(() => buildRulePresetCatalog(props.locale), [props.locale]);
  const copy = useMemo(() => modalCopy(props.locale), [props.locale]);
  const [kind, setKind] = useState<RuleObjectKind>("app");
  const [draft, setDraft] = useState<RuleInput>(() => defaultRuleInputForKind("app", props.locale));
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<RulePresetCategoryKey>(
    presets[0]?.key ?? "app_coding",
  );
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string | null>(null);

  useEffect(() => {
    setKind("app");
    setDraft(defaultRuleInputForKind("app", props.locale));
    setSelectedCategoryKey(presets[0]?.key ?? "app_coding");
    setSelectedPresetLabel(null);
  }, [presets, props.locale]);

  const selectedCategory = presets.find((category) => category.key === selectedCategoryKey) ?? presets[0];

  const categoryOptions: Array<{ value: StudyCategory; label: string }> = [
    { value: "flashcard", label: categoryLabel("flashcard", props.locale) },
    { value: "note", label: categoryLabel("note", props.locale) },
    { value: "reading", label: categoryLabel("reading", props.locale) },
    { value: "course", label: categoryLabel("course", props.locale) },
    { value: "video_course", label: categoryLabel("video_course", props.locale) },
    { value: "coding", label: categoryLabel("coding", props.locale) },
    { value: "general", label: categoryLabel("general", props.locale) },
  ];

  function handleKindChange(nextKind: RuleObjectKind) {
    setKind(nextKind);
    setDraft((current) => ({
      ...current,
      type: nextRuleTypeForKind(nextKind, current.type),
    }));
    setSelectedPresetLabel(null);
  }

  function handlePresetApply(nextKind: RuleObjectKind, nextDraft: RuleInput, nextLabel: string) {
    setKind(nextKind);
    setDraft({ ...nextDraft });
    setSelectedPresetLabel(nextLabel);
  }

  async function handleSubmit() {
    if (!draft.name.trim() || !draft.pattern.trim() || !draft.sourceLabel.trim()) {
      return;
    }

    await props.onCreate({
      ...draft,
      name: draft.name.trim(),
      pattern: draft.pattern.trim(),
      sourceLabel: draft.sourceLabel.trim(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={props.onClose} role="presentation">
      <div
        className="modal-panel glass soft-panel rules-modal-panel rules-modal-panel-compact"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="panel-head">
          <div>
            <h2>{copy.title}</h2>
          </div>
          <button className="icon-close" onClick={props.onClose} type="button">
            <CloseIcon />
          </button>
        </div>

        <div className="rule-create-layout rule-create-layout-compact">
          <aside className="rule-preset-sidebar rule-preset-sidebar-compact">
            <div className="rule-preset-category-list">
              {presets.map((category) => (
                <button
                  className={`rule-preset-category rule-preset-category-row ${selectedCategory?.key === category.key ? "active" : ""}`}
                  key={category.key}
                  onClick={() => setSelectedCategoryKey(category.key)}
                  type="button"
                >
                  <RuleBrandIcon iconKey={category.iconKey} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="rule-create-main">
            <div className="rule-preset-panel">
              <div className="rules-preset-grid rule-preset-grid-row">
                {selectedCategory?.items.map((item) => (
                  <button
                    className={`modal-option rule-preset-option rule-preset-option-row ${selectedPresetLabel === item.label ? "active" : ""}`}
                    key={item.key}
                    onClick={() => handlePresetApply(item.kind, item.draft, item.label)}
                    type="button"
                  >
                    <RuleBrandIcon iconKey={item.iconKey} />
                    <strong>{item.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <section className="rule-editor-section">
              <div className="rule-editor-block">
                {selectedPresetLabel ? (
                  <div className="rule-preset-applied">
                    <span className="muted-tag">
                      {copy.appliedPreset}: {selectedPresetLabel}
                    </span>
                  </div>
                ) : null}

                <div className="rule-editor-grid">
                  <label className="rule-field">
                    <span>{copy.objectType}</span>
                    <DropdownSelect
                      value={kind}
                      options={[
                        { value: "app", label: objectKindLabel("app", props.locale) },
                        { value: "site", label: objectKindLabel("site", props.locale) },
                      ]}
                      onChange={handleKindChange}
                    />
                  </label>

                  <label className="rule-field">
                    <span>{copy.ruleName}</span>
                    <input
                      className="rule-input"
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      value={draft.name}
                    />
                  </label>

                  <label className="rule-field">
                    <span>{copy.pattern}</span>
                    <input
                      className="rule-input"
                      onChange={(event) => setDraft((current) => ({ ...current, pattern: event.target.value }))}
                      value={draft.pattern}
                    />
                  </label>

                  <label className="rule-field">
                    <span>{copy.matchMode}</span>
                    <SegmentedButtonGroup
                      value={draft.type}
                      options={
                        kind === "site"
                          ? [
                              { value: "domain_equals", label: copy.modes.domain },
                              { value: "url_prefix", label: copy.modes.urlPrefix },
                              { value: "url_contains", label: copy.modes.urlContains },
                            ]
                          : [
                              { value: "app_name_equals", label: copy.modes.appName },
                              { value: "window_title_contains", label: copy.modes.titleKeyword },
                            ]
                      }
                      onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
                    />
                  </label>

                  {kind === "site" ? (
                    <label className="rule-field">
                      <span>{copy.urlTipLabel}</span>
                      <input className="rule-input" readOnly value={copy.urlTip} />
                    </label>
                  ) : null}

                  <label className="rule-field">
                    <span>{copy.classification}</span>
                    <SegmentedButtonGroup
                      value={draft.classification}
                      options={[
                        { value: "study", label: copy.classificationOptions.study },
                        { value: "distraction", label: copy.classificationOptions.distraction },
                        { value: "neutral", label: copy.classificationOptions.neutral },
                      ]}
                      onChange={(next) => setDraft((current) => ({ ...current, classification: next }))}
                    />
                  </label>

                  <label className="rule-field">
                    <span>{copy.studyCategory}</span>
                    <DropdownSelect
                      value={draft.category}
                      options={categoryOptions}
                      onChange={(next) => setDraft((current) => ({ ...current, category: next }))}
                    />
                  </label>

                  <label className="rule-field">
                    <span>{copy.sourceLabel}</span>
                    <input
                      className="rule-input"
                      onChange={(event) => setDraft((current) => ({ ...current, sourceLabel: event.target.value }))}
                      value={draft.sourceLabel}
                    />
                  </label>

                  <label className="rule-field">
                    <span>{copy.priority}</span>
                    <input
                      className="rule-input"
                      min={1}
                      max={100}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          priority: Number(event.target.value) || current.priority,
                        }))
                      }
                      type="number"
                      value={draft.priority}
                    />
                  </label>
                </div>
              </div>
            </section>
          </section>
        </div>

        <div className="rules-detail-actions">
          <button className="ghost-button" onClick={props.onClose} type="button">
            {copy.cancel}
          </button>
          <button className="primary-button" onClick={() => void handleSubmit()} type="button">
            {copy.save}
          </button>
        </div>
      </div>
    </div>
  );
}
