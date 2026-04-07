import { useEffect, useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import { CloseIcon } from "../../components/icons";
import { DropdownSelect } from "../../components/DropdownSelect";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
import { categoryLabel } from "../shared/viewLabels";
import { defaultRuleInputForKind, objectKindLabel, presetRuleInputs, RuleObjectKind } from "./rules.helpers";
import type { RuleInput, StudyCategory } from "../../types/study";

export function RuleCreateModal(props: {
  locale: Locale;
  text: Messages;
  onClose: () => void;
  onCreate: (input: RuleInput) => Promise<void>;
}) {
  const [kind, setKind] = useState<RuleObjectKind>("app");
  const [draft, setDraft] = useState<RuleInput>(() => defaultRuleInputForKind("app", props.locale));

  useEffect(() => {
    setDraft(defaultRuleInputForKind(kind, props.locale));
  }, [kind, props.locale]);

  const categoryOptions: Array<{ value: StudyCategory; label: string }> = [
    { value: "flashcard", label: categoryLabel("flashcard", props.locale) },
    { value: "note", label: categoryLabel("note", props.locale) },
    { value: "reading", label: categoryLabel("reading", props.locale) },
    { value: "course", label: categoryLabel("course", props.locale) },
    { value: "coding", label: categoryLabel("coding", props.locale) },
    { value: "general", label: categoryLabel("general", props.locale) },
  ];

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
      <div className="modal-panel glass soft-panel rules-modal-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="panel-head">
          <div>
            <p className="eyebrow">{props.text.rules.presetsEyebrow}</p>
            <h2>{props.text.rules.add}</h2>
          </div>
          <button className="icon-close" onClick={props.onClose} type="button">
            <CloseIcon />
          </button>
        </div>

        <div className="rules-preset-grid">
          {props.text.rules.defaults.map((item, index) => {
            const presetKey = (["coding", "language", "notes"] as const)[index];
            return (
              <button
                className="modal-option rule-preset-option"
                key={item.title}
                onClick={() => void props.onCreate(presetRuleInputs[presetKey])}
                type="button"
              >
                <span className="preset-badge">{item.badge}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </button>
            );
          })}
        </div>

        <section className="rule-editor-section">
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{props.locale === "zh" ? "对象类型" : "Object type"}</span>
              <DropdownSelect
                value={kind}
                options={[
                  { value: "app", label: objectKindLabel("app", props.locale) },
                  { value: "site", label: objectKindLabel("site", props.locale) },
                ]}
                onChange={setKind}
              />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "规则名称" : "Rule name"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} value={draft.name} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "匹配内容" : "Pattern"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, pattern: event.target.value }))} value={draft.pattern} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "匹配方式" : "Match mode"}</span>
              <SegmentedButtonGroup
                value={draft.type}
                options={
                  kind === "site"
                    ? [
                        { value: "domain_equals", label: props.locale === "zh" ? "域名" : "Domain" },
                        { value: "url_prefix", label: props.locale === "zh" ? "网址前缀" : "URL prefix" },
                        { value: "url_contains", label: props.locale === "zh" ? "网址包含" : "URL contains" },
                      ]
                    : [
                        { value: "app_name_equals", label: props.locale === "zh" ? "应用名" : "App name" },
                        { value: "window_title_contains", label: props.locale === "zh" ? "标题关键词" : "Title keyword" },
                      ]
                }
                onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
              />
            </label>

            {kind === "site" ? (
              <label className="rule-field">
                <span>{props.locale === "zh" ? "网址建议" : "URL tip"}</span>
                <input className="rule-input" readOnly value={props.locale === "zh" ? "域名用于整个网站，网址规则用于更具体页面。" : "Use domain for a whole site, URL rules for specific pages."} />
              </label>
            ) : null}

            <label className="rule-field">
              <span>{props.locale === "zh" ? "判定结果" : "Classification"}</span>
              <SegmentedButtonGroup
                value={draft.classification}
                options={[
                  { value: "study", label: props.locale === "zh" ? "学习" : "Study" },
                  { value: "distraction", label: props.locale === "zh" ? "娱乐" : "Distraction" },
                  { value: "neutral", label: props.locale === "zh" ? "中性" : "Neutral" },
                ]}
                onChange={(next) => setDraft((current) => ({ ...current, classification: next }))}
              />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "学习类型" : "Study category"}</span>
              <DropdownSelect value={draft.category} options={categoryOptions} onChange={(next) => setDraft((current) => ({ ...current, category: next }))} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "展示标签" : "Source label"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, sourceLabel: event.target.value }))} value={draft.sourceLabel} />
            </label>

            <label className="rule-field">
              <span>{props.locale === "zh" ? "优先级" : "Priority"}</span>
              <input className="rule-input" min={1} max={100} onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) || current.priority }))} type="number" value={draft.priority} />
            </label>
          </div>
        </section>

        <div className="rules-detail-actions">
          <button className="ghost-button" onClick={props.onClose} type="button">{props.locale === "zh" ? "取消" : "Cancel"}</button>
          <button className="primary-button" onClick={() => void handleSubmit()} type="button">{props.locale === "zh" ? "保存规则" : "Save rule"}</button>
        </div>
      </div>
    </div>
  );
}
