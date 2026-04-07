export function ChoiceChipGroup<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="choice-chip-group">
      {props.options.map((option) => (
        <button
          key={option.value}
          className={`choice-chip ${props.value === option.value ? "active" : ""}`}
          onClick={() => props.onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
