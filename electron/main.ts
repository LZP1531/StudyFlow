import { app, BrowserWindow, clipboard, dialog, ipcMain, Menu, nativeImage, nativeTheme, powerMonitor, Tray } from "electron";
import { copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ExtensionBridge } from "./services/extension-bridge";
import { StudyflowDatabase } from "./services/database";
import { captureActiveWindow } from "./services/tracking";

const isDev = !app.isPackaged;
const trackingIntervals = {
  trackingSampleMs: 15_000,
} as const;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let sampleTimer: NodeJS.Timeout | null = null;
let trackingEnabled = true;

const database = new StudyflowDatabase(join(app.getPath("userData"), "studyflow.sqlite"));
const extensionBridge = new ExtensionBridge();

function resolveDesktopIconPath() {
  const candidatePaths = [
    join(app.getAppPath(), "public", "studyflow-icon.png"),
    join(app.getAppPath(), "dist", "studyflow-icon.png"),
    join(__dirname, "../../public/studyflow-icon.png"),
    join(__dirname, "../../dist/studyflow-icon.png"),
  ];

  return candidatePaths.find((candidate) => existsSync(candidate)) ?? null;
}

function getResolvedWindowTheme(themeMode: "light" | "dark" | "system") {
  if (themeMode === "system") {
    return nativeTheme.shouldUseDarkColors ? "dark" : "light";
  }

  return themeMode;
}

function applyWindowChrome(theme: "light" | "dark") {
  if (!mainWindow) {
    return;
  }

  mainWindow.setBackgroundColor("#00000000");
}

async function createWindow() {
  const settings = database.getSettings();
  const resolvedTheme = getResolvedWindowTheme(settings.themeMode);
  const iconPath = resolveDesktopIconPath();

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1080,
    minHeight: 720,
    title: "StudyFlow",
    frame: false,
    transparent: true,
    roundedCorners: true,
    backgroundColor: "#00000000",
    autoHideMenuBar: true,
    icon: iconPath ?? undefined,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    await mainWindow.loadURL("http://localhost:5173");
  } else {
    await mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("close", (event) => {
    if (!isQuitting && database.getSettings().minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function setupTray() {
  const iconPath = resolveDesktopIconPath();
  const icon = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("StudyFlow");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Open StudyFlow",
        click: () => {
          mainWindow?.show();
        },
      },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on("click", () => mainWindow?.show());
}

function setupIpc() {
  ipcMain.handle("studyflow:getTrackingSnapshot", () => database.getTrackingSnapshot());
  ipcMain.handle("studyflow:getDailySummary", () => database.getDailySummary());
  ipcMain.handle("studyflow:getWeeklySummary", () => database.getWeeklySummary());
  ipcMain.handle("studyflow:listSourceBreakdown", () => database.listSourceBreakdown());
  ipcMain.handle("studyflow:listActivityEvents", () => database.listActivityEvents());
  ipcMain.handle("studyflow:listStudySessions", () => database.listStudySessions());
  ipcMain.handle("studyflow:listRules", () => database.listRules());
  ipcMain.handle("studyflow:createRule", (_event, input) => database.createRule(input));
  ipcMain.handle("studyflow:updateRule", (_event, id, input) => database.updateRule(id, input));
  ipcMain.handle("studyflow:deleteRule", (_event, id) => database.deleteRule(id));
  ipcMain.handle("studyflow:deleteStudySession", (_event, id) => database.deleteStudySession(id));
  ipcMain.handle("studyflow:getSettings", () => database.getSettings());
  ipcMain.handle("studyflow:updateSettings", (_event, input) => {
    const updated = database.updateSettings(input);
    app.setLoginItemSettings({ openAtLogin: updated.launchOnStartup });
    applyWindowChrome(getResolvedWindowTheme(updated.themeMode));
    return updated;
  });
  ipcMain.handle("studyflow:getSettingsMeta", () => {
    const extensionStatus = extensionBridge.getStatus();

    return {
      trackingStatus: trackingEnabled ? "active" : "paused",
      browserExtensionConnected: extensionStatus.browserExtensionConnected,
      lastBrowserSyncAt: extensionStatus.lastBrowserSyncAt,
      databaseStatus: database.getHealthStatus(),
      appVersion: app.getVersion(),
    };
  });
  ipcMain.handle("studyflow:exportLocalData", async () => {
    const settings = database.getSettings();
    if (!settings.allowLocalExports) {
      return { success: false };
    }

    const fileName = `studyflow-export-${new Date().toISOString().slice(0, 10)}.sqlite`;
    const result = mainWindow
      ? await dialog.showSaveDialog(mainWindow, {
          defaultPath: join(app.getPath("documents"), fileName),
          filters: [{ name: "SQLite Database", extensions: ["sqlite", "db"] }],
        })
      : await dialog.showSaveDialog({
          defaultPath: join(app.getPath("documents"), fileName),
          filters: [{ name: "SQLite Database", extensions: ["sqlite", "db"] }],
        });

    if (result.canceled || !result.filePath) {
      return { success: false };
    }

    await copyFile(database.getDatabasePath(), result.filePath);
    return { success: true, filePath: result.filePath };
  });
  ipcMain.handle("studyflow:copyDebugInfo", async () => {
    const settings = database.getSettings();
    const meta = extensionBridge.getStatus();
    const payload = [
      `appVersion=${app.getVersion()}`,
      `themeMode=${settings.themeMode}`,
      `locale=${settings.locale}`,
      `idleThresholdMinutes=${settings.idleThresholdMinutes}`,
      `launchOnStartup=${settings.launchOnStartup}`,
      `minimizeToTray=${settings.minimizeToTray}`,
      `allowLocalExports=${settings.allowLocalExports}`,
      `trackingStatus=${trackingEnabled ? "active" : "paused"}`,
      `browserExtensionConnected=${meta.browserExtensionConnected}`,
      `lastBrowserSyncAt=${meta.lastBrowserSyncAt ?? "null"}`,
      `databaseStatus=${database.getHealthStatus()}`,
    ].join("\n");

    clipboard.writeText(payload);
  });
  ipcMain.handle("studyflow:setTrackingEnabled", (_event, enabled: boolean) => {
    trackingEnabled = enabled;
    if (!enabled) {
      database.closeOpenActivityEvent();
    }

    const extensionStatus = extensionBridge.getStatus();
    return {
      trackingStatus: trackingEnabled ? "active" : "paused",
      browserExtensionConnected: extensionStatus.browserExtensionConnected,
      lastBrowserSyncAt: extensionStatus.lastBrowserSyncAt,
      databaseStatus: database.getHealthStatus(),
      appVersion: app.getVersion(),
    };
  });
  ipcMain.handle("studyflow:setWindowTheme", (_event, theme: "light" | "dark") => {
    applyWindowChrome(theme);
  });
  ipcMain.handle("studyflow:minimizeWindow", () => {
    mainWindow?.minimize();
  });
  ipcMain.handle("studyflow:maximizeWindow", () => {
    if (!mainWindow) {
      return;
    }
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      return;
    }
    mainWindow.maximize();
  });
  ipcMain.handle("studyflow:closeWindow", () => {
    isQuitting = true;
    mainWindow?.close();
  });
  ipcMain.handle("studyflow:getWindowState", () => ({
    isMaximized: mainWindow?.isMaximized() ?? false,
  }));
}

function startTrackingLoop() {
  const captureAndRecordSample = async () => {
    if (!trackingEnabled) {
      return;
    }
    const idleSeconds = powerMonitor.getSystemIdleTime();
    const browserActivity = extensionBridge.getLatestActivity();
    const idleThresholdMinutes = database.getSettings().idleThresholdMinutes;
    const sample = await captureActiveWindow(idleSeconds, browserActivity, idleThresholdMinutes);
    if (sample) {
      database.recordSample(sample);
    }
  };

  void captureAndRecordSample();
  sampleTimer = setInterval(() => {
    void captureAndRecordSample();
  }, trackingIntervals.trackingSampleMs);
}

app.whenReady().then(async () => {
  setupIpc();
  setupTray();
  app.setLoginItemSettings({ openAtLogin: database.getSettings().launchOnStartup });
  await extensionBridge.start();
  await createWindow();
  powerMonitor.on("suspend", () => {
    database.closeOpenActivityEvent();
  });
  powerMonitor.on("lock-screen", () => {
    database.closeOpenActivityEvent();
  });
  startTrackingLoop();
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  } else {
    mainWindow?.show();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (sampleTimer) {
    clearInterval(sampleTimer);
  }
  extensionBridge.stop();
  database.close();
});
