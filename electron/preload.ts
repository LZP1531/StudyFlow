import { contextBridge, ipcRenderer } from "electron";
import type { RuleInput, SettingsUpdate, StudyflowApi } from "../src/types/study";

const api: StudyflowApi = {
  getTrackingSnapshot: () => ipcRenderer.invoke("studyflow:getTrackingSnapshot"),
  getDailySummary: () => ipcRenderer.invoke("studyflow:getDailySummary"),
  getWeeklySummary: () => ipcRenderer.invoke("studyflow:getWeeklySummary"),
  listSourceBreakdown: () => ipcRenderer.invoke("studyflow:listSourceBreakdown"),
  listActivityEvents: () => ipcRenderer.invoke("studyflow:listActivityEvents"),
  listStudySessions: () => ipcRenderer.invoke("studyflow:listStudySessions"),
  listRules: () => ipcRenderer.invoke("studyflow:listRules"),
  createRule: (input: RuleInput) => ipcRenderer.invoke("studyflow:createRule", input),
  updateRule: (id: string, input: Partial<RuleInput>) =>
    ipcRenderer.invoke("studyflow:updateRule", id, input),
  getSettings: () => ipcRenderer.invoke("studyflow:getSettings"),
  updateSettings: (input: SettingsUpdate) => ipcRenderer.invoke("studyflow:updateSettings", input),
  getSettingsMeta: () => ipcRenderer.invoke("studyflow:getSettingsMeta"),
  exportLocalData: () => ipcRenderer.invoke("studyflow:exportLocalData"),
  copyDebugInfo: () => ipcRenderer.invoke("studyflow:copyDebugInfo"),
  setTrackingEnabled: (enabled: boolean) => ipcRenderer.invoke("studyflow:setTrackingEnabled", enabled),
  setWindowTheme: (theme: "light" | "dark") => ipcRenderer.invoke("studyflow:setWindowTheme", theme),
  minimizeWindow: () => ipcRenderer.invoke("studyflow:minimizeWindow"),
  maximizeWindow: () => ipcRenderer.invoke("studyflow:maximizeWindow"),
  closeWindow: () => ipcRenderer.invoke("studyflow:closeWindow"),
  getWindowState: () => ipcRenderer.invoke("studyflow:getWindowState"),
};

contextBridge.exposeInMainWorld("studyflow", api);
