import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "./icons";

export function DropdownSelect<T extends string>(props: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
  placement?: "down" | "up";
  renderValue?: (option: { label: string; value: T }) => ReactNode;
  renderOption?: (option: { label: string; value: T }, selected: boolean) => ReactNode;
  triggerClassName?: string;
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = props.options.find((option) => option.value === props.value) ?? props.options[0];
  const placement = props.placement ?? "down";

  return (
    <div
      className={`dropdown-select dropdown-select-${placement} ${open ? "open" : ""}`.trim()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        aria-expanded={open}
        className={["dropdown-select-trigger", props.triggerClassName].filter(Boolean).join(" ")}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span>{selected ? (props.renderValue ? props.renderValue(selected) : selected.label) : null}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <div className={["dropdown-select-menu", props.menuClassName].filter(Boolean).join(" ")} role="listbox">
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
              {props.renderOption ? props.renderOption(option, option.value === props.value) : option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
