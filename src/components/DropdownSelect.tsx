import { useState } from "react";
import { ChevronDownIcon } from "./icons";

export function DropdownSelect<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = props.options.find((option) => option.value === props.value) ?? props.options[0];

  return (
    <div
      className={`dropdown-select ${open ? "open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        aria-expanded={open}
        className="dropdown-select-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{selected?.label}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <div className="dropdown-select-menu" role="listbox">
          {props.options.map((option) => (
            <button
              className={`dropdown-select-option ${option.value === props.value ? "active" : ""}`}
              key={option.value}
              onClick={() => {
                props.onChange(option.value);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
