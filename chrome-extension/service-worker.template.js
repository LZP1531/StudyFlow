const BROWSER_ID = "__BROWSER_ID__";
const BROWSER_NAME = "__BROWSER_NAME__";

function inferPageType(url) {
  if (
    url.startsWith("chrome://") ||
    url.startsWith("edge://") ||
    url.startsWith("brave://") ||
    url.startsWith("lenovo://") ||
    url.startsWith("firefox://") ||
    url.startsWith("opera://") ||
    url.startsWith("vivaldi://") ||
    url.startsWith("arc://")
  ) {
    return "browser_internal";
  }

  if (url.startsWith("chrome-extension://") || url.startsWith("extension://")) {
    return "extension";
  }

  return "web";
}

async function postActiveTab(tab) {
  if (!tab || !tab.url || !tab.title) {
    return;
  }

  let domain = "";
  try {
    domain = new URL(tab.url).hostname;
  } catch {
    return;
  }

  await fetch("http://127.0.0.1:32145/extension/activity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      browser: BROWSER_ID,
      browserName: BROWSER_NAME,
      url: tab.url,
      domain,
      title: tab.title,
      pageType: inferPageType(tab.url),
      capturedAt: new Date().toISOString()
    })
  }).catch(() => undefined);
}

async function syncCurrentTab(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  await postActiveTab(tab);
}

async function syncActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
  await postActiveTab(tab);
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await syncCurrentTab(tabId);
});

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    await postActiveTab(tab);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }

  await syncActiveTab();
});

chrome.runtime.onStartup.addListener(() => {
  void syncActiveTab();
});

chrome.runtime.onInstalled.addListener(() => {
  void syncActiveTab();
});
