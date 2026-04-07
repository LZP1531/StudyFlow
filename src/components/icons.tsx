import type { ViewKey } from "../types/app";

export function AppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="6" fill="currentColor" opacity="0.18" />
      <path d="M8.4 7.8h7.2l-1.1 2.1h-5L8.4 7.8Zm1.1 3.5h4.8v4.9H9.5v-4.9Z" fill="currentColor" />
    </svg>
  );
}

export function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M4.5 6.5h15v11h-15z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.5 19.5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M12 3.2a8.8 8.8 0 1 0 8.6 10.7 7.1 7.1 0 0 1-8.5-8.5c0-.8.1-1.5.3-2.2A2.6 2.6 0 0 0 12 3.2Z" fill="currentColor" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M12 5.2 4.6 11v7.2h5.1v-4.5h4.6v4.5h5.1V11L12 5.2Z" fill="currentColor" />
    </svg>
  );
}

export function TimelineIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M6 7.5h3.5v3.5H6V7.5Zm4.25 0h7.75v1.8h-7.75V7.5Zm0 3.7h5.5V13h-5.5v-1.8ZM6 13.2h3.5v3.5H6v-3.5Zm4.25 0H18V15h-7.75v-1.8Zm0 3.7h6.2v1.8h-6.2v-1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RulesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M7 6.5h10a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 17 17.5H7A1.5 1.5 0 0 1 5.5 16V8A1.5 1.5 0 0 1 7 6.5Zm1.4 3.1h7.2v1.8H8.4V9.6Zm0 3.2h4.4v1.8H8.4v-1.8Zm6.2-.4 1.1 1.1 2.1-2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="m12 5.4 1 .3.6 1.6 1.5.6 1.4-.6 1 .9-.5 1.4.6 1.5 1.6.6.3 1-.3 1-1.6.6-.6 1.5.5 1.4-1 .9-1.4-.6-1.5.6-.6 1.6-1 .3-1-.3-.6-1.6-1.5-.6-1.4.6-1-.9.5-1.4-.6-1.5-1.6-.6-.3-1 .3-1 1.6-.6.6-1.5-.5-1.4 1-.9 1.4.6 1.5-.6.6-1.6 1-.3Zm0 4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z" fill="currentColor" />
    </svg>
  );
}

export function TimerStyleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <rect x="4.5" y="5.8" width="15" height="12.4" rx="2.7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.2 12h13.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 4.2h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M6 12.9h12v1.8H6z" fill="currentColor" />
    </svg>
  );
}

export function MaximizeIcon(props: { isMaximized: boolean }) {
  return props.isMaximized ? (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M7 9h8v8H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="M7 7h10v10H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="m8 8 8 8M16 8l-8 8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.6v5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.6" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.9 12h16.2M12 3.8a12.7 12.7 0 0 1 0 16.4M12 3.8a12.7 12.7 0 0 0 0 16.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DatabaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <ellipse cx="12" cy="6.6" rx="6.5" ry="2.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 6.8v9.6c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8V6.8M5.5 11.6c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path d="m14.2 14.2 4.1 4.1" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.6v4.8l3.1 1.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardPulseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M3.8 12h4l2-4.3 3.1 8 2.4-5.1h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DashboardBreakIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M7.2 9.1h9.6v5.1a4.8 4.8 0 0 1-4.8 4.8 4.8 4.8 0 0 1-4.8-4.8V9.1Zm9.6 1.1h1.4a1.7 1.7 0 0 1 0 3.4h-1.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.7 5.5v1.8M12 4.9v2.4M15.3 5.5v1.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardHistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ui-icon" aria-hidden="true">
      <path
        d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.8 8.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 5.6v3.1h3.1M12 8.2v4.2l2.7 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function navIcon(view: ViewKey) {
  switch (view) {
    case "dashboard":
      return <HomeIcon />;
    case "timeline":
      return <TimelineIcon />;
    case "rules":
      return <RulesIcon />;
    case "settings":
      return <SettingsIcon />;
  }
}
