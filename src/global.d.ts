import type { StudyflowApi } from "./types/study";

declare global {
  interface Window {
    studyflow?: StudyflowApi;
  }
}

export {};
