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
      browser: "chrome",
      url: tab.url,
      domain,
      title: tab.title,
      capturedAt: new Date().toISOString()
    })
  }).catch(() => undefined);
}

async function syncCurrentTab(tabId) {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  await postActiveTab(tab);
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await syncCurrentTab(tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    await postActiveTab(tab);
  }
});
