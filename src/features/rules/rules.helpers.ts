import type { Locale } from "../../types/app";
import type { RuleInput, RuleType } from "../../types/study";

export type RuleObjectKind = "app" | "site";

export function ruleObjectKind(ruleType: RuleType): RuleObjectKind {
  switch (ruleType) {
    case "domain_equals":
    case "url_prefix":
    case "url_contains":
      return "site";
    default:
      return "app";
  }
}

export function objectKindLabel(kind: RuleObjectKind, locale: Locale) {
  if (locale === "zh") {
    return kind === "app" ? "应用" : "网站";
  }
  return kind === "app" ? "App" : "Site";
}

export function nextRuleTypeForKind(kind: RuleObjectKind, currentType?: RuleType): RuleType {
  if (kind === "site") {
    return currentType === "url_prefix" || currentType === "url_contains" || currentType === "domain_equals"
      ? currentType
      : "domain_equals";
  }

  return currentType === "window_title_contains" || currentType === "app_name_equals" ? currentType : "app_name_equals";
}

export const presetRuleInputs: Record<"coding" | "language" | "notes", RuleInput> = {
  coding: {
    name: "编程学习包",
    type: "domain_equals",
    pattern: "leetcode.cn",
    classification: "study",
    category: "coding",
    sourceLabel: "算法刷题",
    priority: 95,
    presetKey: "coding",
    enabled: true,
  },
  language: {
    name: "英语学习包",
    type: "app_name_equals",
    pattern: "Anki",
    classification: "study",
    category: "flashcard",
    sourceLabel: "英语 Anki",
    priority: 90,
    presetKey: "language",
    enabled: true,
  },
  notes: {
    name: "笔记整理包",
    type: "app_name_equals",
    pattern: "Obsidian",
    classification: "study",
    category: "note",
    sourceLabel: "Obsidian 笔记",
    priority: 90,
    presetKey: "notes",
    enabled: true,
  },
};

export function defaultRuleInputForKind(kind: RuleObjectKind, locale: Locale): RuleInput {
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
