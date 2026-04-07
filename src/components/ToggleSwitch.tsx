export function ToggleSwitch(props: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      aria-label={props.label}
      aria-pressed={props.checked}
      className={`switch ${props.checked ? "on" : ""}`}
      onClick={() => props.onChange(!props.checked)}
      type="button"
    >
      <span className="switch-thumb" />
    </button>
  );
}
