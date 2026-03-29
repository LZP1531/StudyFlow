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
  capturedAt: string;
}

const browserNames = new Set(["Google Chrome", "chrome.exe"]);

export async function captureActiveWindow(
  idleSeconds: number,
  browserActivity: BrowserActivityPayload | null,
): Promise<ActiveWindowSnapshot | null> {
  try {
    const activeWindow = await activeWin();
    if (!activeWindow) {
      return null;
    }

    const appName = activeWindow.owner?.name ?? activeWindow.title ?? "Unknown App";
    const isBrowserWindow = browserNames.has(appName);
    const shouldUseBrowserActivity =
      isBrowserWindow &&
      browserActivity &&
      Date.now() - new Date(browserActivity.capturedAt).getTime() < 15_000;

    return {
      sourceType: shouldUseBrowserActivity ? "browser" : "desktop",
      appName,
      windowTitle: shouldUseBrowserActivity ? browserActivity.title : activeWindow.title,
      domain: shouldUseBrowserActivity ? browserActivity.domain : undefined,
      url: shouldUseBrowserActivity ? browserActivity.url : undefined,
      browserName: shouldUseBrowserActivity ? browserActivity.browser : undefined,
      pageType: shouldUseBrowserActivity ? browserActivity.pageType : undefined,
      isIdle: idleSeconds > 240,
      capturedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
