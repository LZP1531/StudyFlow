import activeWin from "active-win";
import type { BrowserActivityPayload } from "./extension-bridge";
import type { SourceType } from "../../src/types/study";

export interface ActiveWindowSnapshot {
  sourceType: SourceType;
  appName: string;
  windowTitle: string;
  domain?: string;
  url?: string;
  browserName?: string;
  pageType?: string;
  isIdle: boolean;
  isInternalApp?: boolean;
  capturedAt: string;
}

const browserNames = new Set(["Google Chrome", "chrome.exe"]);
const studyflowWindowTitles = new Set(["studyflow"]);
const browserActivityFreshMs = 20_000;
const browserActivityRetentionMs = 5 * 60_000;

function normalizeWindowText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function browserTitlesMatch(activeTitle: string, browserTitle: string) {
  const normalizedActiveTitle = normalizeWindowText(activeTitle);
  const normalizedBrowserTitle = normalizeWindowText(browserTitle);

  if (!normalizedActiveTitle || !normalizedBrowserTitle) {
    return false;
  }

  return (
    normalizedActiveTitle === normalizedBrowserTitle ||
    normalizedActiveTitle.includes(normalizedBrowserTitle) ||
    normalizedBrowserTitle.includes(normalizedActiveTitle)
  );
}

function isStudyflowWindow(appName: string, windowTitle: string) {
  const normalizedAppName = appName.trim().toLowerCase();
  const normalizedTitle = windowTitle.trim().toLowerCase();
  const isStudyflowTitle = studyflowWindowTitles.has(normalizedTitle);
  return (
    normalizedAppName === "studyflow" ||
    normalizedAppName === "studyflow.exe" ||
    (normalizedAppName === "electron.exe" && isStudyflowTitle) ||
    isStudyflowTitle
  );
}

export async function captureActiveWindow(
  idleSeconds: number,
  browserActivity: BrowserActivityPayload | null,
  idleThresholdMinutes: number,
): Promise<ActiveWindowSnapshot | null> {
  try {
    const activeWindow = await activeWin();
    if (!activeWindow) {
      return null;
    }

    const appName = activeWindow.owner?.name ?? activeWindow.title ?? "Unknown App";
    const isBrowserWindow = browserNames.has(appName);
    const browserActivityAgeMs = browserActivity ? Date.now() - new Date(browserActivity.capturedAt).getTime() : Number.POSITIVE_INFINITY;
    const shouldUseBrowserActivity =
      isBrowserWindow &&
      browserActivity &&
      (
        browserActivityAgeMs < browserActivityFreshMs ||
        (
          browserActivityAgeMs < browserActivityRetentionMs &&
          browserTitlesMatch(activeWindow.title, browserActivity.title)
        )
      );

    return {
      sourceType: shouldUseBrowserActivity ? "browser" : "desktop",
      appName,
      windowTitle: shouldUseBrowserActivity ? browserActivity.title : activeWindow.title,
      domain: shouldUseBrowserActivity ? browserActivity.domain : undefined,
      url: shouldUseBrowserActivity ? browserActivity.url : undefined,
      browserName: shouldUseBrowserActivity ? browserActivity.browser : undefined,
      pageType: shouldUseBrowserActivity ? browserActivity.pageType : undefined,
      isIdle: idleSeconds >= Math.max(1, idleThresholdMinutes) * 60,
      isInternalApp: isStudyflowWindow(appName, activeWindow.title),
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
