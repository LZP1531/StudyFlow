import { useEffect, useRef, useState } from "react";
import type { Locale } from "../../types/app";

function dashboardFlipUnitLabel(unit: "hours" | "minutes", locale: Locale) {
  if (locale === "zh") {
    return unit === "hours" ? "时" : "分";
  }
  return unit === "hours" ? "Hour" : "Min";
}

function formatDashboardFlipDate(currentTimeMs: number) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "2-digit",
  })
    .format(new Date(currentTimeMs))
    .replace(", ", " • ")
    .toUpperCase();
}

function DashboardFlipDigit(props: { digit: string }) {
  const { digit } = props;
  const [current, setCurrent] = useState(digit);
  const [next, setNext] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);
  const queuedDigitRef = useRef<string | null>(null);
  const currentRef = useRef(digit);
  const nextRef = useRef(digit);
  const isFlippingRef = useRef(false);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  useEffect(() => {
    isFlippingRef.current = isFlipping;
  }, [isFlipping]);

  useEffect(() => {
    if (digit === currentRef.current && !isFlippingRef.current) {
      queuedDigitRef.current = null;
      return;
    }

    if (isFlippingRef.current) {
      queuedDigitRef.current = digit;
      return;
    }

    nextRef.current = digit;
    setNext(digit);
    setIsFlipping(true);
  }, [digit]);

  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.animationName !== "dashboard-flip-bottom-in") {
      return;
    }

    const resolvedDigit = nextRef.current;
    currentRef.current = resolvedDigit;
    setCurrent(resolvedDigit);
    setIsFlipping(false);

    const queuedDigit = queuedDigitRef.current;
    queuedDigitRef.current = null;

    if (queuedDigit && queuedDigit !== resolvedDigit) {
      nextRef.current = queuedDigit;
      setNext(queuedDigit);
      setIsFlipping(true);
    }
  }

  return (
    <div className="dashboard-flip-digit">
      {!isFlipping ? (
        <>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-top">{current}</div>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-bottom">{current}</div>
        </>
      ) : (
        <>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-top">{next}</div>
          <div className="dashboard-flip-half dashboard-flip-half-static dashboard-flip-half-bottom">{current}</div>
          <div className="dashboard-flip-half dashboard-flip-half-anim dashboard-flip-half-top dashboard-flip-half-top-anim">{current}</div>
          <div className="dashboard-flip-half dashboard-flip-half-anim dashboard-flip-half-bottom dashboard-flip-half-bottom-anim" onAnimationEnd={handleAnimationEnd}>
            {next}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardFlipDigitGroup(props: { value: number }) {
  const formatted = props.value.toString().padStart(2, "0");
  return (
    <div className="dashboard-flip-pair">
      <DashboardFlipDigit digit={formatted[0]} />
      <DashboardFlipDigit digit={formatted[1]} />
    </div>
  );
}

export function DashboardFlipTimer(props: {
  elapsedSeconds: number;
  locale: Locale;
  currentTimeMs: number;
  currentTaskLabel: string;
}) {
  const safeSeconds = Math.max(0, props.elapsedSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const timeLabel = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const dateLabel = formatDashboardFlipDate(props.currentTimeMs);
  const taskLabel = props.currentTaskLabel.trim() || (props.locale === "zh" ? "当前专注" : "Current focus");

  return (
    <div className="dashboard-live-timer-wrap dashboard-live-timer-wrap-flip">
      <div className="dashboard-flip-timer" aria-label={timeLabel}>
        <div className="dashboard-flip-meta-top">{dateLabel}</div>
        <div className="dashboard-flip-timer-readout" aria-hidden="true">
          <DashboardFlipDigitGroup value={hours} />
          <div className="dashboard-flip-unit-label">{dashboardFlipUnitLabel("hours", props.locale)}</div>
          <DashboardFlipDigitGroup value={minutes} />
          <div className="dashboard-flip-unit-label">{dashboardFlipUnitLabel("minutes", props.locale)}</div>
          <DashboardFlipDigitGroup value={seconds} />
        </div>
        <div className="dashboard-flip-meta-bottom">
          <span className="dashboard-flip-task-pill">
            <strong>{taskLabel}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
