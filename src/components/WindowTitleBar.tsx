import type { Locale, ThemeMode } from "../types/app";
import type { TrackingConfig } from "../types/study";
import {
  CloseIcon,
  MaximizeIcon,
  MinimizeIcon,
  SunIcon,
  SystemIcon,
  ThemeIcon,
  TimerStyleIcon,
} from "./icons";

function ChromeButton(props: {
  tooltip: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`chrome-button no-drag ${props.className ?? ""}`.trim()}
      onClick={props.onClick}
      aria-label={props.tooltip}
      data-tooltip={props.tooltip}
      type="button"
    >
      {props.children}
    </button>
  );
}

export function WindowTitleBar(props: {
  locale: Locale;
  themeMode: ThemeMode;
  dashboardTimerStyle: TrackingConfig["dashboardTimerStyle"];
  isMaximized: boolean;
  onToggleTheme: () => void;
  onToggleTimerStyle: () => void;
  onToggleLocale: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}) {
  return (
    <header className="window-titlebar drag-region">
      <div className="titlebar-brand no-drag">
        <div className="brand-mark brand-mark-small">
          <img className="brand-logo" src="/studyflow-icon.png" alt="StudyFlow" />
        </div>
        <strong>StudyFlow</strong>
      </div>

      <div className="titlebar-actions no-drag">
        <ChromeButton
          onClick={props.onToggleTheme}
          tooltip={
            props.locale === "zh"
              ? `主题：${props.themeMode === "dark" ? "深色" : props.themeMode === "light" ? "浅色" : "系统"}`
              : `Theme: ${props.themeMode}`
          }
        >
          {props.themeMode === "system" ? <SystemIcon /> : props.themeMode === "light" ? <SunIcon /> : <ThemeIcon />}
        </ChromeButton>
        <ChromeButton
          onClick={props.onToggleTimerStyle}
          tooltip={
            props.locale === "zh"
              ? `计时器：${props.dashboardTimerStyle === "dial" ? "表盘" : "翻页"}`
              : `Timer: ${props.dashboardTimerStyle === "dial" ? "Dial" : "Flip"}`
          }
        >
          <TimerStyleIcon />
        </ChromeButton>
        <ChromeButton onClick={props.onToggleLocale} tooltip={props.locale === "zh" ? "语言：中文" : "Language: English"}>
          <span className="chrome-button-text">{props.locale === "zh" ? "中" : "EN"}</span>
        </ChromeButton>
        <ChromeButton onClick={props.onMinimize} tooltip={props.locale === "zh" ? "最小化" : "Minimize"}>
          <MinimizeIcon />
        </ChromeButton>
        <ChromeButton onClick={props.onMaximize} tooltip={props.locale === "zh" ? "最大化" : "Maximize"}>
          <MaximizeIcon isMaximized={props.isMaximized} />
        </ChromeButton>
        <ChromeButton className="danger" onClick={props.onClose} tooltip={props.locale === "zh" ? "关闭" : "Close"}>
          <CloseIcon />
        </ChromeButton>
      </div>
    </header>
  );
}
