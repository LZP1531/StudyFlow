import type { ReactNode } from "react";

function BrandWrap(props: { children: ReactNode; className?: string }) {
  return <span className={`rule-brand-icon ${props.className ?? ""}`.trim()}>{props.children}</span>;
}

const officialLogoUrls: Partial<Record<string, string>> = {
  idea: new URL("./brand-assets/idea.svg", import.meta.url).href,
  pycharm: new URL("./brand-assets/pycharm.svg", import.meta.url).href,
  notion: new URL("./brand-assets/notion.svg", import.meta.url).href,
  obsidian: new URL("./brand-assets/obsidian.svg", import.meta.url).href,
  anki: new URL("./brand-assets/anki.svg", import.meta.url).href,
  coursera: new URL("./brand-assets/coursera.svg", import.meta.url).href,
  edx: new URL("./brand-assets/edx.svg", import.meta.url).href,
  bilibili: new URL("./brand-assets/bilibili.svg", import.meta.url).href,
  leetcode: new URL("./brand-assets/leetcode.svg", import.meta.url).href,
  mdn: new URL("./brand-assets/mdn.svg", import.meta.url).href,
  vscode: new URL("./brand-assets/vscode.svg", import.meta.url).href,
  youtube: new URL("./brand-assets/youtube.svg", import.meta.url).href,
};

export function RuleBrandIcon(props: { iconKey: string }) {
  const officialLogoUrl = officialLogoUrls[props.iconKey];
  if (officialLogoUrl) {
    return (
      <BrandWrap className={`brand-remote brand-${props.iconKey}`}>
        <img alt="" className="rule-brand-img" src={officialLogoUrl} loading="eager" decoding="async" />
      </BrandWrap>
    );
  }

  switch (props.iconKey) {
    case "coding":
      return <BrandWrap className="category-coding"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="m8.2 8.4-3.6 3.6 3.6 3.6M15.8 8.4l3.6 3.6-3.6 3.6M13.4 6 10.6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></BrandWrap>;
    case "notes":
      return <BrandWrap className="category-notes"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="M7 5.5h10v13H7z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M9.2 9h5.6M9.2 12h5.6M9.2 15h3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></BrandWrap>;
    case "language":
      return <BrandWrap className="category-language"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="M7.5 17 12 7l4.5 10M9.1 13.5h5.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></BrandWrap>;
    case "globe":
      return <BrandWrap className="category-globe"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4.8 12h14.4M12 4.5a11 11 0 0 1 0 15M12 4.5a11 11 0 0 0 0 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></BrandWrap>;
    case "course":
      return <BrandWrap className="category-course"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="M5.5 8.2 12 5l6.5 3.2V16L12 19l-6.5-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 5v14" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg></BrandWrap>;
    case "docs":
      return <BrandWrap className="category-docs"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="M7 5.5h7l3 3v10H7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M14 5.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></BrandWrap>;
    case "idea":
      return <BrandWrap className="brand-idea"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.2" fill="#111827" /><path d="M8 8.1h8v2H8Zm1.5 3.7h1.9v4.1H9.5Zm3.5 0h3.4v1.6h-1.5v.9H16.4v1.6H13Z" fill="#ffffff" /></svg></BrandWrap>;
    case "pycharm":
      return <BrandWrap className="brand-pycharm"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><defs><linearGradient id="pycharm-g" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#21d789" /><stop offset="1" stopColor="#8f5cff" /></linearGradient></defs><rect x="4" y="4" width="16" height="16" rx="3.2" fill="url(#pycharm-g)" /><rect x="7" y="7" width="10" height="10" rx="1.8" fill="#111827" /><path d="M9 10h4.4a2 2 0 0 1 0 4H11v2H9Zm2 1.7v.9h2.1a.45.45 0 0 0 0-.9Zm3.2 3.3h2.8v1.5h-2.8z" fill="#ffffff" /></svg></BrandWrap>;
    case "vscode":
      return <BrandWrap className="brand-vscode"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="m17.6 4.8 2.9 1.4v11.6l-2.9 1.4-6.6-6.2Z" fill="#1f9cf0" /><path d="m7.1 12 5.1-4.4v2.8l-2.3 1.6 2.3 1.6v2.8Z" fill="#0b6cce" /><path d="m12.2 7.6 5.4-2.8v14.4l-5.4-2.8Z" fill="#42a5f5" /></svg></BrandWrap>;
    case "codex":
      return <BrandWrap className="brand-codex"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="#111827" /><path d="M10.2 7.8A4.6 4.6 0 1 0 12.3 16" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" /><path d="m13.3 9.6 2.6 2.4-2.6 2.4" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></BrandWrap>;
    case "obsidian":
      return <BrandWrap className="brand-obsidian"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="m11.9 3.8 5.2 3v10.4l-5.2 3-4.4-2.8V6.6z" fill="#7c3aed" /><path d="m11.9 5.8 3.4 2v8.4l-3.4 2-2.6-1.6V7.4z" fill="#a78bfa" /></svg></BrandWrap>;
    case "notion":
      return <BrandWrap className="brand-notion"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2" fill="#ffffff" stroke="#111827" strokeWidth="1.5" /><path d="M8.5 15.7V8.3h1.4l3 4.5V8.3h1.5v7.4H13l-3-4.5v4.5Z" fill="#111827" /></svg></BrandWrap>;
    case "anki":
      return <BrandWrap className="brand-anki"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.5" y="6" width="15" height="12" rx="2.6" fill="#2563eb" /><path d="M8.1 15.2 12 8.7l3.9 6.5h-1.8l-.7-1.3h-2.8l-.7 1.3Zm3.1-2.7h1.5L12 11.1Z" fill="#ffffff" /></svg></BrandWrap>;
    case "navicat":
      return <BrandWrap className="brand-navicat"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><ellipse cx="12" cy="7" rx="5.2" ry="2.2" fill="#f97316" /><path d="M6.8 7v8.4c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2V7" fill="none" stroke="#ea580c" strokeWidth="1.6" /><path d="M6.8 10.8c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2" fill="none" stroke="#ea580c" strokeWidth="1.6" /></svg></BrandWrap>;
    case "leetcode":
      return <BrandWrap className="brand-leetcode"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="m13.8 5.8 4 4-4 4" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.8 7.7 7.1 11.4l3.7 3.7" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8.5 12h7.1" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" /></svg></BrandWrap>;
    case "github":
      return <BrandWrap className="brand-github"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="M12 4.8a7.2 7.2 0 0 0-2.3 14v-2.2c-2 .4-2.5-.9-2.5-.9-.4-.8-.9-1.1-.9-1.1-.8-.5.1-.5.1-.5.8.1 1.3.8 1.3.8.8 1.3 2 1 2.5.8.1-.5.3-.9.6-1.1-1.8-.2-3.7-.9-3.7-4a3.1 3.1 0 0 1 .8-2.1 2.9 2.9 0 0 1 .1-2s.7-.2 2.3.8a7.7 7.7 0 0 1 4.2 0c1.6-1 2.3-.8 2.3-.8a2.9 2.9 0 0 1 .1 2 3.1 3.1 0 0 1 .8 2.1c0 3.1-1.9 3.8-3.8 4 .3.3.6.8.6 1.6v2.4A7.2 7.2 0 0 0 12 4.8Z" fill="#111827" /></svg></BrandWrap>;
    case "mdn":
      return <BrandWrap className="brand-mdn"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.5" y="5.2" width="15" height="13.6" rx="2.6" fill="#111827" /><path d="M7.7 15.2V8.8h1.6l1.7 2.6 1.7-2.6h1.6v6.4h-1.5v-3.6l-1.7 2.3-1.7-2.3v3.6Zm8 0V8.8h1.6v6.4Z" fill="#ffffff" /></svg></BrandWrap>;
    case "coursera":
      return <BrandWrap className="brand-coursera"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><circle cx="12" cy="12" r="7.6" fill="#0056d2" /><path d="M15.2 9.4a4.2 4.2 0 1 0 0 5.2" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" /></svg></BrandWrap>;
    case "edx":
      return <BrandWrap className="brand-edx"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><path d="M6.6 9.2h4.1v1.5H8.2v1h2.3v1.5H8.2v1h2.5v1.5H6.6zm5.2 0h1.5l1.6 2.2 1.6-2.2H18l-2.4 3.3L18 15.8h-1.6l-1.7-2.3-1.7 2.3h-1.6l2.5-3.3z" fill="#02262b" /></svg></BrandWrap>;
    case "bilibili":
      return <BrandWrap className="brand-bilibili"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.5" y="6.8" width="15" height="10.4" rx="2.6" fill="#2ec5ff" /><path d="m9 5.3-1.2-1.2M16.2 5.3l1.2-1.2M10.2 11.2v2.2M13.8 11.2v2.2" fill="none" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" /><path d="m11.2 10.8 3 1.7-3 1.7z" fill="#0f172a" /></svg></BrandWrap>;
    case "youtube":
      return <BrandWrap className="brand-youtube"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.2" y="7" width="15.6" height="10" rx="3" fill="#ff0033" /><path d="m10.4 9.7 5 2.8-5 2.8z" fill="#ffffff" /></svg></BrandWrap>;
    case "cambridge":
      return <BrandWrap className="brand-cambridge"><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="#b91c1c" /><path d="M15.2 9.4a3.9 3.9 0 1 0 0 5.2" fill="none" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" /></svg></BrandWrap>;
    default:
      return <BrandWrap><svg viewBox="0 0 24 24" className="rule-brand-svg" aria-hidden="true"><rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="currentColor" opacity="0.22" /><path d="M8 12h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></BrandWrap>;
  }
}
