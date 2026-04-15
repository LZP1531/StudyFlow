import type { StudyflowApi } from "../types/study";

export interface TrackerBridge extends StudyflowApi {}

const bridgeErrorMessage =
  "StudyFlow desktop bridge is unavailable. Please launch the app through Electron so the renderer can talk to the local desktop services.";

function getElectronBridge(): TrackerBridge | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.studyflow ?? null;
}

export const trackerBridge: TrackerBridge = new Proxy({} as TrackerBridge, {
  get(_target, prop) {
    const bridge = getElectronBridge();
    if (!bridge) {
      throw new Error(bridgeErrorMessage);
    }

    const value = Reflect.get(bridge, prop);
    if (typeof value === "function") {
      return value.bind(bridge);
    }

    return value;
  },
});
