import { useMediaQuery } from "../hooks/useMediaQuery";
import { MOBILE_QUERY } from "../utils/breakpoints";
import classNames from "classnames";
import React from "react";
import checkboxStyles from "./Checkbox.module.css";
import inputStyles from "./inputs.module.css";
import type { InputProps } from "./useInput";

export type CheckboxProps = Omit<
  InputProps<boolean, true>,
  "value" | "required"
> & {
  checked: boolean;
};

export const Checkbox = (props: CheckboxProps) => {
  const id = React.useId();
  const { label, checked, onChange, disabled } = props;
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const input = (
    <input
      id={id}
      type="checkbox"
      checked={checked ?? false}
      onChange={e => onChange(e.target.checked)}
      disabled={disabled}
    />
  );

  // On mobile, every other field's label sits above it (see
  // `EventEditor.module.css`'s `.form`) -- but stacking a checkbox below
  // its own one-word label would waste a row for no reason, so it's kept
  // as a single "checkbox + label" row instead, matching the indent
  // reserved by other fields' labels (see `inputs.module.css`'s `.label`).
  if (isMobile) {
    return (
      <label
        htmlFor={id}
        className={classNames(inputStyles.label, checkboxStyles.checkboxLabel)}
      >
        <span className={checkboxStyles.checkboxSlot}>{input}</span>
        {label}
      </label>
    );
  }

  return (
    <>
      <label htmlFor={id} className={inputStyles.label}>
        {label}
      </label>
      {input}
    </>
  );
};
