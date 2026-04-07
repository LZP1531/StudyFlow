import type { StudyflowApi } from "./study";

declare global {
  interface Window {
    studyflow?: StudyflowApi;
  }
}

export {};
