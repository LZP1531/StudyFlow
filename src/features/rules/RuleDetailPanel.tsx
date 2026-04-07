import { useEffect, useState } from "react";
import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import type { Rule, RuleClassification, RuleInput, StudyCategory } from "../../types/study";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DropdownSelect } from "../../components/DropdownSelect";
import { SegmentedButtonGroup } from "../../components/SegmentedButtonGroup";
import { ToggleSwitch } from "../../components/ToggleSwitch";
import { categoryLabel } from "../shared/viewLabels";
import { nextRuleTypeForKind, objectKindLabel, ruleObjectKind } from "./rules.helpers";

export function RuleDetailPanel(props: {
  rule: Rule;
  locale: Locale;
  text: Messages;
  onUpdate: (id: string, input: Partial<RuleInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const { locale, rule } = props;
  const [draft, setDraft] = useState<Rule>(rule);
  const [pendingAction, setPendingAction] = useState<null | "delete">(null);

  useEffect(() => {
    setDraft(rule);
  }, [rule]);

  const objectKind = ruleObjectKind(draft.type);
  const isDirty =
    draft.name !== rule.name ||
    draft.type !== rule.type ||
    draft.pattern !== rule.pattern ||
    draft.classification !== rule.classification ||
    draft.category !== rule.category ||
    draft.sourceLabel !== rule.sourceLabel ||
    draft.priority !== rule.priority ||
    draft.enabled !== rule.enabled;

  const categoryOptions: Array<{ value: StudyCategory; label: string }> = [
    { value: "flashcard", label: categoryLabel("flashcard", locale) },
    { value: "note", label: categoryLabel("note", locale) },
    { value: "reading", label: categoryLabel("reading", locale) },
    { value: "course", label: categoryLabel("course", locale) },
    { value: "coding", label: categoryLabel("coding", locale) },
    { value: "general", label: categoryLabel("general", locale) },
  ];

  async function confirmDelete() {
    await props.onDelete(rule.id);
    props.onNotice(locale === "zh" ? "规则已删除" : "Rule deleted");
  }

  function confirmReset() {
    setDraft(rule);
    props.onNotice(locale === "zh" ? "已取消改动" : "Changes discarded");
  }

  async function confirmSave() {
    await props.onUpdate(rule.id, {
      name: draft.name,
      type: draft.type,
      pattern: draft.pattern,
      classification: draft.classification,
      category: draft.category,
      sourceLabel: draft.sourceLabel,
      priority: draft.priority,
      enabled: draft.enabled,
      presetKey: draft.presetKey,
    });
    props.onNotice(locale === "zh" ? "规则已保存" : "Rule saved");
  }

  return (
    <div className="rules-detail">
      <div className="panel-head rules-detail-head">
        <div>
          <p className="eyebrow">{locale === "zh" ? "规则详情" : "Rule details"}</p>
          <h2>{draft.name}</h2>
        </div>
        <ToggleSwitch checked={draft.enabled} label={locale === "zh" ? "启用规则" : "Enable rule"} onChange={(next) => setDraft((current) => ({ ...current, enabled: next }))} />
      </div>

      <section className="rule-editor-section">
        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "基础信息" : "Basics"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "规则名称" : "Rule name"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} value={draft.name} />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "对象类型" : "Object type"}</span>
              <DropdownSelect
                value={objectKind}
                options={[
                  { value: "app", label: objectKindLabel("app", locale) },
                  { value: "site", label: objectKindLabel("site", locale) },
                ]}
                onChange={(next) => setDraft((current) => ({ ...current, type: nextRuleTypeForKind(next, current.type) }))}
              />
            </label>
          </div>
        </div>

        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "匹配条件" : "Match conditions"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "匹配方式" : "Match mode"}</span>
              {objectKind === "site" ? (
                <SegmentedButtonGroup
                  value={draft.type}
                  options={[
                    { value: "domain_equals", label: locale === "zh" ? "域名" : "Domain" },
                    { value: "url_prefix", label: locale === "zh" ? "网址前缀" : "URL prefix" },
                    { value: "url_contains", label: locale === "zh" ? "网址包含" : "URL contains" },
                  ]}
                  onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
                />
              ) : (
                <SegmentedButtonGroup
                  value={draft.type}
                  options={[
                    { value: "app_name_equals", label: locale === "zh" ? "应用名" : "App name" },
                    { value: "window_title_contains", label: locale === "zh" ? "标题关键词" : "Title keyword" },
                  ]}
                  onChange={(next) => setDraft((current) => ({ ...current, type: next }))}
                />
              )}
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "匹配内容" : "Pattern"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, pattern: event.target.value }))} value={draft.pattern} />
            </label>
          </div>
        </div>

        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "识别结果" : "Recognition result"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "判定结果" : "Classification"}</span>
              <SegmentedButtonGroup
                value={draft.classification === "ignore" ? "neutral" : draft.classification}
                options={[
                  { value: "study", label: locale === "zh" ? "学习" : "Study" },
                  { value: "distraction", label: locale === "zh" ? "娱乐" : "Distraction" },
                  { value: "neutral", label: locale === "zh" ? "中性" : "Neutral" },
                ]}
                onChange={(next) => setDraft((current) => ({ ...current, classification: next as RuleClassification }))}
              />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "学习类型" : "Study category"}</span>
              <DropdownSelect value={draft.category} options={categoryOptions} onChange={(next) => setDraft((current) => ({ ...current, category: next }))} />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "展示标签" : "Source label"}</span>
              <input className="rule-input" onChange={(event) => setDraft((current) => ({ ...current, sourceLabel: event.target.value }))} value={draft.sourceLabel} />
            </label>
          </div>
        </div>

        <div className="rule-editor-block">
          <p className="eyebrow">{locale === "zh" ? "优先级与命中" : "Priority and hits"}</p>
          <div className="rule-editor-grid">
            <label className="rule-field">
              <span>{locale === "zh" ? "优先级" : "Priority"}</span>
              <input className="rule-input" min={1} max={100} onChange={(event) => setDraft((current) => ({ ...current, priority: Number(event.target.value) || current.priority }))} type="number" value={draft.priority} />
            </label>
            <label className="rule-field">
              <span>{locale === "zh" ? "今日命中" : "Hits today"}</span>
              <input className="rule-input" readOnly value={String(draft.hitsToday)} />
            </label>
          </div>
        </div>
      </section>

      <div className="rules-detail-actions">
        <button className="ghost-button danger action-button" onClick={() => setPendingAction("delete")} type="button">
          {locale === "zh" ? "删除" : "Delete"}
        </button>
        <div className="rules-detail-actions-right">
          <button className="ghost-button action-button" onClick={() => (isDirty ? confirmReset() : setDraft(rule))} type="button">
            {locale === "zh" ? "取消改动" : "Cancel"}
          </button>
          <button className="primary-button action-button" disabled={!isDirty} onClick={() => void confirmSave()} type="button">
            {locale === "zh" ? "保存" : "Save"}
          </button>
        </div>
      </div>

      {pendingAction === "delete" ? (
        <ConfirmDialog
          cancelLabel={locale === "zh" ? "取消" : "Cancel"}
          confirmLabel={locale === "zh" ? "删除规则" : "Delete rule"}
          description={locale === "zh" ? "删除后这条规则将不再参与识别，且无法恢复。" : "This rule will stop participating in recognition and cannot be restored."}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            setPendingAction(null);
            void confirmDelete();
          }}
          title={locale === "zh" ? "删除这条规则？" : "Delete this rule?"}
          tone="danger"
        />
      ) : null}
    </div>
  );
}
