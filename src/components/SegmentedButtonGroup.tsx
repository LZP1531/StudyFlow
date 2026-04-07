export function SegmentedButtonGroup<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented-control">
      {props.options.map((option) => (
        <button
          key={option.value}
          className={`segmented-option ${props.value === option.value ? "active" : ""}`}
          onClick={() => props.onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
