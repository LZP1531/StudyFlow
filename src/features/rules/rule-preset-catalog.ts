import type { Locale } from "../../types/app";
import type { RuleInput } from "../../types/study";

export type RulePresetCategoryKey =
  | "app_coding"
  | "app_notes"
  | "app_language"
  | "site_coding"
  | "site_course"
  | "site_docs";

export type RulePresetKind = "app" | "site";

export interface RulePresetItem {
  key: string;
  label: string;
  iconKey: string;
  kind: RulePresetKind;
  draft: RuleInput;
}

export interface RulePresetCategory {
  key: RulePresetCategoryKey;
  label: string;
  iconKey: string;
  items: RulePresetItem[];
}

function createPresetDraft(input: Omit<RuleInput, "enabled" | "presetKey">): RuleInput {
  return {
    ...input,
    enabled: true,
    presetKey: "custom",
  };
}

export function buildRulePresetCatalog(locale: Locale): RulePresetCategory[] {
  if (locale === "zh") {
    return [
      {
        key: "app_coding",
        label: "编程应用",
        iconKey: "coding",
        items: [
          {
            key: "idea",
            label: "IDEA",
            iconKey: "idea",
            kind: "app",
            draft: createPresetDraft({
              name: "IDEA 编程",
              type: "app_name_equals",
              pattern: "idea64.exe",
              classification: "study",
              category: "coding",
              sourceLabel: "IDEA 编程",
              priority: 92,
            }),
          },
          {
            key: "pycharm",
            label: "PyCharm",
            iconKey: "pycharm",
            kind: "app",
            draft: createPresetDraft({
              name: "PyCharm 编程",
              type: "app_name_equals",
              pattern: "pycharm64.exe",
              classification: "study",
              category: "coding",
              sourceLabel: "PyCharm 编程",
              priority: 92,
            }),
          },
          {
            key: "vscode",
            label: "VS Code",
            iconKey: "vscode",
            kind: "app",
            draft: createPresetDraft({
              name: "VS Code 编程",
              type: "app_name_equals",
              pattern: "Code.exe",
              classification: "study",
              category: "coding",
              sourceLabel: "VS Code 编程",
              priority: 90,
            }),
          },
          {
            key: "codex",
            label: "Codex",
            iconKey: "codex",
            kind: "app",
            draft: createPresetDraft({
              name: "Codex 编程",
              type: "app_name_equals",
              pattern: "Codex.exe",
              classification: "study",
              category: "coding",
              sourceLabel: "Codex 编程",
              priority: 93,
            }),
          },
        ],
      },
      {
        key: "app_notes",
        label: "笔记应用",
        iconKey: "notes",
        items: [
          {
            key: "obsidian",
            label: "Obsidian",
            iconKey: "obsidian",
            kind: "app",
            draft: createPresetDraft({
              name: "Obsidian 笔记",
              type: "app_name_equals",
              pattern: "Obsidian",
              classification: "study",
              category: "note",
              sourceLabel: "Obsidian 笔记",
              priority: 90,
            }),
          },
          {
            key: "notion",
            label: "Notion",
            iconKey: "notion",
            kind: "app",
            draft: createPresetDraft({
              name: "Notion 笔记",
              type: "app_name_equals",
              pattern: "Notion",
              classification: "study",
              category: "note",
              sourceLabel: "Notion 笔记",
              priority: 88,
            }),
          },
        ],
      },
      {
        key: "app_language",
        label: "语言应用",
        iconKey: "language",
        items: [
          {
            key: "anki",
            label: "Anki",
            iconKey: "anki",
            kind: "app",
            draft: createPresetDraft({
              name: "Anki 记忆复习",
              type: "app_name_equals",
              pattern: "Anki",
              classification: "study",
              category: "flashcard",
              sourceLabel: "Anki 记忆复习",
              priority: 91,
            }),
          },
        ],
      },
      {
        key: "site_coding",
        label: "编程网站",
        iconKey: "globe",
        items: [
          {
            key: "leetcode",
            label: "LeetCode",
            iconKey: "leetcode",
            kind: "site",
            draft: createPresetDraft({
              name: "LeetCode 刷题",
              type: "domain_equals",
              pattern: "leetcode.cn",
              classification: "study",
              category: "coding",
              sourceLabel: "LeetCode 刷题",
              priority: 95,
            }),
          },
          {
            key: "github_docs",
            label: "GitHub Docs",
            iconKey: "github",
            kind: "site",
            draft: createPresetDraft({
              name: "GitHub Docs 文档",
              type: "domain_equals",
              pattern: "docs.github.com",
              classification: "study",
              category: "coding",
              sourceLabel: "GitHub Docs 文档",
              priority: 89,
            }),
          },
          {
            key: "mdn",
            label: "MDN",
            iconKey: "mdn",
            kind: "site",
            draft: createPresetDraft({
              name: "MDN 开发文档",
              type: "domain_equals",
              pattern: "developer.mozilla.org",
              classification: "study",
              category: "coding",
              sourceLabel: "MDN 开发文档",
              priority: 90,
            }),
          },
        ],
      },
      {
        key: "site_course",
        label: "课程网站",
        iconKey: "course",
        items: [
          {
            key: "coursera",
            label: "Coursera",
            iconKey: "coursera",
            kind: "site",
            draft: createPresetDraft({
              name: "Coursera 课程",
              type: "domain_equals",
              pattern: "coursera.org",
              classification: "study",
              category: "course",
              sourceLabel: "Coursera 课程",
              priority: 92,
            }),
          },
          {
            key: "edx",
            label: "edX",
            iconKey: "edx",
            kind: "site",
            draft: createPresetDraft({
              name: "edX 课程",
              type: "domain_equals",
              pattern: "edx.org",
              classification: "study",
              category: "course",
              sourceLabel: "edX 课程",
              priority: 92,
            }),
          },
          {
            key: "bilibili_course",
            label: "Bilibili",
            iconKey: "bilibili",
            kind: "site",
            draft: createPresetDraft({
              name: "Bilibili 学习视频",
              type: "url_prefix",
              pattern: "https://www.bilibili.com/video/",
              classification: "study",
              category: "video_course",
              sourceLabel: "Bilibili 学习视频",
              priority: 82,
            }),
          },
          {
            key: "youtube_learning",
            label: "YouTube",
            iconKey: "youtube",
            kind: "site",
            draft: createPresetDraft({
              name: "YouTube 学习视频",
              type: "domain_equals",
              pattern: "youtube.com",
              classification: "study",
              category: "video_course",
              sourceLabel: "YouTube 学习视频",
              priority: 70,
            }),
          },
        ],
      },
      {
        key: "site_docs",
        label: "文档网站",
        iconKey: "docs",
        items: [
          {
            key: "cambridge_dictionary",
            label: "Cambridge",
            iconKey: "cambridge",
            kind: "site",
            draft: createPresetDraft({
              name: "Cambridge 词典",
              type: "domain_equals",
              pattern: "dictionary.cambridge.org",
              classification: "study",
              category: "reading",
              sourceLabel: "Cambridge 词典",
              priority: 87,
            }),
          },
        ],
      },
    ];
  }

  return [
    {
      key: "app_coding",
      label: "Coding apps",
      iconKey: "coding",
      items: [
        {
          key: "idea",
          label: "IDEA",
          iconKey: "idea",
          kind: "app",
          draft: createPresetDraft({
            name: "IDEA coding",
            type: "app_name_equals",
            pattern: "idea64.exe",
            classification: "study",
            category: "coding",
            sourceLabel: "IDEA coding",
            priority: 92,
          }),
        },
        {
          key: "pycharm",
          label: "PyCharm",
          iconKey: "pycharm",
          kind: "app",
          draft: createPresetDraft({
            name: "PyCharm coding",
            type: "app_name_equals",
            pattern: "pycharm64.exe",
            classification: "study",
            category: "coding",
            sourceLabel: "PyCharm coding",
            priority: 92,
          }),
        },
        {
          key: "vscode",
          label: "VS Code",
          iconKey: "vscode",
          kind: "app",
          draft: createPresetDraft({
            name: "VS Code coding",
            type: "app_name_equals",
            pattern: "Code.exe",
            classification: "study",
            category: "coding",
            sourceLabel: "VS Code coding",
            priority: 90,
          }),
        },
        {
          key: "codex",
          label: "Codex",
          iconKey: "codex",
          kind: "app",
          draft: createPresetDraft({
            name: "Codex coding",
            type: "app_name_equals",
            pattern: "Codex.exe",
            classification: "study",
            category: "coding",
            sourceLabel: "Codex coding",
            priority: 93,
          }),
        },
      ],
    },
    {
      key: "app_notes",
      label: "Notes apps",
      iconKey: "notes",
      items: [
        {
          key: "obsidian",
          label: "Obsidian",
          iconKey: "obsidian",
          kind: "app",
          draft: createPresetDraft({
            name: "Obsidian notes",
            type: "app_name_equals",
            pattern: "Obsidian",
            classification: "study",
            category: "note",
            sourceLabel: "Obsidian notes",
            priority: 90,
          }),
        },
        {
          key: "notion",
          label: "Notion",
          iconKey: "notion",
          kind: "app",
          draft: createPresetDraft({
            name: "Notion notes",
            type: "app_name_equals",
            pattern: "Notion",
            classification: "study",
            category: "note",
            sourceLabel: "Notion notes",
            priority: 88,
          }),
        },
      ],
    },
    {
      key: "app_language",
      label: "Language apps",
      iconKey: "language",
      items: [
        {
          key: "anki",
          label: "Anki",
          iconKey: "anki",
          kind: "app",
          draft: createPresetDraft({
            name: "Anki review",
            type: "app_name_equals",
            pattern: "Anki",
            classification: "study",
            category: "flashcard",
            sourceLabel: "Anki review",
            priority: 91,
          }),
        },
      ],
    },
    {
      key: "site_coding",
      label: "Coding sites",
      iconKey: "globe",
      items: [
        {
          key: "leetcode",
          label: "LeetCode",
          iconKey: "leetcode",
          kind: "site",
          draft: createPresetDraft({
            name: "LeetCode practice",
            type: "domain_equals",
            pattern: "leetcode.cn",
            classification: "study",
            category: "coding",
            sourceLabel: "LeetCode practice",
            priority: 95,
          }),
        },
        {
          key: "github_docs",
          label: "GitHub Docs",
          iconKey: "github",
          kind: "site",
          draft: createPresetDraft({
            name: "GitHub Docs",
            type: "domain_equals",
            pattern: "docs.github.com",
            classification: "study",
            category: "coding",
            sourceLabel: "GitHub Docs",
            priority: 89,
          }),
        },
        {
          key: "mdn",
          label: "MDN",
          iconKey: "mdn",
          kind: "site",
          draft: createPresetDraft({
            name: "MDN docs",
            type: "domain_equals",
            pattern: "developer.mozilla.org",
            classification: "study",
            category: "coding",
            sourceLabel: "MDN docs",
            priority: 90,
          }),
        },
      ],
    },
    {
      key: "site_course",
      label: "Course sites",
      iconKey: "course",
      items: [
        {
          key: "coursera",
          label: "Coursera",
          iconKey: "coursera",
          kind: "site",
          draft: createPresetDraft({
            name: "Coursera course",
            type: "domain_equals",
            pattern: "coursera.org",
            classification: "study",
            category: "course",
            sourceLabel: "Coursera course",
            priority: 92,
          }),
        },
        {
          key: "edx",
          label: "edX",
          iconKey: "edx",
          kind: "site",
          draft: createPresetDraft({
            name: "edX course",
            type: "domain_equals",
            pattern: "edx.org",
            classification: "study",
            category: "course",
            sourceLabel: "edX course",
            priority: 92,
          }),
        },
        {
          key: "bilibili_course",
          label: "Bilibili",
          iconKey: "bilibili",
          kind: "site",
          draft: createPresetDraft({
            name: "Bilibili learning video",
            type: "url_prefix",
            pattern: "https://www.bilibili.com/video/",
            classification: "study",
            category: "video_course",
            sourceLabel: "Bilibili learning video",
            priority: 82,
          }),
        },
        {
          key: "youtube_learning",
          label: "YouTube",
          iconKey: "youtube",
          kind: "site",
          draft: createPresetDraft({
            name: "YouTube learning video",
            type: "domain_equals",
            pattern: "youtube.com",
            classification: "study",
            category: "video_course",
            sourceLabel: "YouTube learning video",
            priority: 70,
          }),
        },
      ],
    },
    {
      key: "site_docs",
      label: "Reference sites",
      iconKey: "docs",
      items: [
        {
          key: "cambridge_dictionary",
          label: "Cambridge",
          iconKey: "cambridge",
          kind: "site",
          draft: createPresetDraft({
            name: "Cambridge Dictionary",
            type: "domain_equals",
            pattern: "dictionary.cambridge.org",
            classification: "study",
            category: "reading",
            sourceLabel: "Cambridge Dictionary",
            priority: 87,
          }),
        },
      ],
    },
  ];
}
