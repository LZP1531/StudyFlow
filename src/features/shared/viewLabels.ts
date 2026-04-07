import type { Messages } from "../../i18n/messages";
import type { Locale } from "../../types/app";
import type { Classification, StudyCategory } from "../../types/study";

export function classificationLabel(classification: Classification, text: Messages) {
  return text.classification[classification];
}

export function categoryLabel(category: StudyCategory, locale: Locale) {
  const labelsZh: Record<StudyCategory, string> = {
    flashcard: "刷卡",
    note: "笔记",
    reading: "阅读",
    course: "课程",
    video_course: "视频课程",
    coding: "编码",
    general: "通用",
  };
  const labelsEn: Record<StudyCategory, string> = {
    flashcard: "Flashcard",
    note: "Notes",
    reading: "Reading",
    course: "Course",
    video_course: "Video course",
    coding: "Coding",
    general: "General",
  };

  return locale === "zh" ? labelsZh[category] : labelsEn[category];
}
