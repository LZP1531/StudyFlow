import { InfoIcon } from "./icons";

export function InlineInfoButton(props: { tooltip: string }) {
  return (
    <button
      className="inline-info-button"
      aria-label={props.tooltip}
      data-tooltip={props.tooltip}
      type="button"
    >
      <InfoIcon />
    </button>
  );
}
