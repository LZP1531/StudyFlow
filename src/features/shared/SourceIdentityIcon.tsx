type SourceVisualKind = "app" | "site" | "system";

const iconUrls = {
  "app-generic": new URL("../icons/app-generic.svg", import.meta.url).href,
  "site-generic": new URL("../icons/site-generic.svg", import.meta.url).href,
  "system-generic": new URL("../icons/system-generic.svg", import.meta.url).href,
  anki: new URL("../icons/anki.svg", import.meta.url).href,
  bilibili: new URL("../icons/bilibili.svg", import.meta.url).href,
  brave: new URL("../icons/brave.svg", import.meta.url).href,
  chatgpt: new URL("../icons/chatgpt.svg", import.meta.url).href,
  chrome: new URL("../icons/Chrome.svg", import.meta.url).href,
  claude: new URL("../icons/Claude.svg", import.meta.url).href,
  codebuddy: new URL("../icons/codeBuddy.svg", import.meta.url).href,
  codex: new URL("../icons/Codex.svg", import.meta.url).href,
  coding: new URL("../icons/category-coding.svg", import.meta.url).href,
  copilot: new URL("../icons/Copilot.svg", import.meta.url).href,
  coursera: new URL("../icons/coursera.svg", import.meta.url).href,
  course: new URL("../icons/category-course.svg", import.meta.url).href,
  cursor: new URL("../icons/Cursor.svg", import.meta.url).href,
  deepseek: new URL("../icons/deepseek.svg", import.meta.url).href,
  docs: new URL("../icons/category-docs.svg", import.meta.url).href,
  doubao: new URL("../icons/doubao.svg", import.meta.url).href,
  edge: new URL("../icons/Edge.svg", import.meta.url).href,
  edx: new URL("../icons/edx.svg", import.meta.url).href,
  feishu: new URL("../icons/feishu.svg", import.meta.url).href,
  firefox: new URL("../icons/Firefox.svg", import.meta.url).href,
  gemini: new URL("../icons/Gemini.svg", import.meta.url).href,
  globe: new URL("../icons/category-globe.svg", import.meta.url).href,
  idea: new URL("../icons/idea.svg", import.meta.url).href,
  kimi: new URL("../icons/kimi.svg", import.meta.url).href,
  leetcode: new URL("../icons/leetcode.svg", import.meta.url).href,
  language: new URL("../icons/category-language.svg", import.meta.url).href,
  mdn: new URL("../icons/mdn.svg", import.meta.url).href,
  notes: new URL("../icons/category-notes.svg", import.meta.url).href,
  notion: new URL("../icons/notion.svg", import.meta.url).href,
  obsidian: new URL("../icons/obsidian.svg", import.meta.url).href,
  onenote: new URL("../icons/Onenote.svg", import.meta.url).href,
  pycharm: new URL("../icons/pycharm.svg", import.meta.url).href,
  qwen: new URL("../icons/qwen.svg", import.meta.url).href,
  vscode: new URL("../icons/vscode.svg", import.meta.url).href,
  word: new URL("../icons/word.svg", import.meta.url).href,
  wps: new URL("../icons/wps.svg", import.meta.url).href,
  youtube: new URL("../icons/youtube.svg", import.meta.url).href,
  yuque: new URL("../icons/yuque.svg", import.meta.url).href,
} as const;

type IconKey = keyof typeof iconUrls;

const iconTokenMap: Array<{ key: IconKey; tokens: string[] }> = [
  { key: "chatgpt", tokens: ["chatgpt", "chat gpt"] },
  { key: "claude", tokens: ["claude"] },
  { key: "codex", tokens: ["codex"] },
  { key: "gemini", tokens: ["gemini"] },
  { key: "deepseek", tokens: ["deepseek"] },
  { key: "doubao", tokens: ["doubao", "豆包"] },
  { key: "qwen", tokens: ["qwen", "tongyi", "tong yi", "通义"] },
  { key: "kimi", tokens: ["kimi"] },
  { key: "copilot", tokens: ["copilot", "github copilot"] },
  { key: "codebuddy", tokens: ["codebuddy", "code buddy"] },
  { key: "cursor", tokens: ["cursor", "cursor.exe"] },
  { key: "vscode", tokens: ["visual studio code", "code.exe", "vs code", "vscode"] },
  { key: "idea", tokens: ["intellij", "idea64.exe", "idea"] },
  { key: "pycharm", tokens: ["pycharm", "pycharm64.exe"] },
  { key: "notion", tokens: ["notion"] },
  { key: "obsidian", tokens: ["obsidian"] },
  { key: "yuque", tokens: ["yuque", "语雀"] },
  { key: "feishu", tokens: ["feishu", "飞书", "lark"] },
  { key: "onenote", tokens: ["onenote", "one note"] },
  { key: "word", tokens: ["winword.exe", "microsoft word", "word"] },
  { key: "wps", tokens: ["wps", "wps office"] },
  { key: "anki", tokens: ["anki"] },
  { key: "leetcode", tokens: ["leetcode"] },
  { key: "mdn", tokens: ["developer.mozilla.org", "mozilla", "mdn"] },
  { key: "coursera", tokens: ["coursera"] },
  { key: "edx", tokens: ["edx"] },
  { key: "youtube", tokens: ["youtube", "youtu.be"] },
  { key: "bilibili", tokens: ["bilibili", "b23.tv"] },
  { key: "chrome", tokens: ["google chrome", "chrome.exe", "chrome"] },
  { key: "edge", tokens: ["microsoft edge", "msedge.exe", "edge"] },
  { key: "brave", tokens: ["brave", "brave.exe"] },
  { key: "firefox", tokens: ["firefox", "firefox.exe"] },
];

function normalizeToken(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function resolveSourceIconKey(input: {
  sourceLabel?: string | null;
  appName?: string | null;
  domain?: string | null;
  browserName?: string | null;
  url?: string | null;
}) {
  const haystack = [input.sourceLabel, input.appName, input.domain, input.browserName, input.url]
    .map(normalizeToken)
    .filter(Boolean)
    .join(" ");

  if (!haystack) {
    return null;
  }

  const match = iconTokenMap.find((entry) => entry.tokens.some((token) => haystack.includes(token)));
  return match?.key ?? null;
}

function backgroundClassName(iconKey: string, kind: SourceVisualKind) {
  switch (iconKey) {
    case "notion":
      return "brand-github";
    case "mdn":
    case "idea":
    case "cursor":
    case "coding":
      return "brand-codex";
    case "chatgpt":
    case "claude":
    case "codex":
    case "gemini":
    case "deepseek":
    case "qwen":
    case "kimi":
      return "brand-chatgpt";
    case "chrome":
    case "edge":
    case "brave":
    case "firefox":
      return "brand-chrome";
    case "coursera":
    case "course":
      return "brand-coursera";
    case "anki":
    case "language":
      return "brand-anki";
    case "notes":
      return "brand-github";
    case "vscode":
    case "copilot":
      return "brand-vscode";
    case "leetcode":
      return "brand-leetcode";
    case "youtube":
      return "brand-youtube";
    case "bilibili":
      return "brand-bilibili";
    case "edx":
    case "docs":
      return "brand-edx";
    case "pycharm":
      return "brand-pycharm";
    case "obsidian":
      return "brand-obsidian";
    case "globe":
      return "brand-chrome";
    case "app-generic":
      return "brand-generic-app";
    case "site-generic":
      return "brand-generic-site";
    case "system-generic":
      return "brand-generic-system";
    default:
      return kind === "site" ? "brand-generic-site" : kind === "system" ? "brand-generic-system" : "brand-generic-app";
  }
}

export function SourceIdentityIcon(props: {
  iconKey?: string | null;
  sourceKind?: SourceVisualKind;
  sourceLabel?: string | null;
  appName?: string | null;
  domain?: string | null;
  browserName?: string | null;
  url?: string | null;
  className?: string;
}) {
  const sourceKind = props.sourceKind ?? "app";
  const fallbackIconKey: IconKey =
    sourceKind === "site" ? "site-generic" : sourceKind === "system" ? "system-generic" : "app-generic";
  const resolvedIconKey = (props.iconKey as IconKey | null | undefined) ?? resolveSourceIconKey(props) ?? fallbackIconKey;
  const iconUrl = iconUrls[resolvedIconKey] ?? iconUrls[fallbackIconKey];
  const className = [
    "rule-brand-icon",
    "source-identity-icon",
    backgroundClassName(resolvedIconKey, sourceKind),
    props.className ?? "",
  ].filter(Boolean).join(" ");

  return (
    <span className={className}>
      <img alt="" className="rule-brand-img" src={iconUrl} loading="eager" decoding="async" />
    </span>
  );
}

