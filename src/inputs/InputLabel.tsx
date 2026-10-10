import React from "react";
import styles from "./inputs.module.css";
import type { InputProps } from "./useInput";

interface InputLabelProps<T, R extends boolean = false> extends Omit<
  InputProps<T, R>,
  "value"
> {
  id: string;
  /** Gibt an, ob der aktuelle Wert nicht `null` ist. */
  hasValue: boolean;
}

export const InputLabel = <T, R extends boolean = false>(
  props: InputLabelProps<T, R>,
) => {
  const { hasValue, onChange, defaultValue, required, disabled, fullRow } =
    props;

  /** Show optional checkbox if not required and default value is set (s.t. default can be applied when checking) */
  const hasOptionalCheck = !required && defaultValue !== undefined;

  // TODO: Back to previous non-null value when re-enabling and defaultValue is not set?

  return (
    <label
      htmlFor={props.id}
      className={styles.label}
      // Read by `Form.module.css`, which has to find a full-row field's label
      // and the control right after it from outside this CSS module.
      data-urai-full-row={fullRow || undefined}
    >
      {props.label}
      {hasOptionalCheck && (
        <input
          type="checkbox"
          className={styles.optionalCheck}
          checked={hasValue}
          onChange={e => {
            if (e.target.checked && defaultValue) {
              onChange(
                typeof defaultValue === "function"
                  ? defaultValue()
                  : defaultValue,
              );
            } else if (!required) {
              (onChange as (newValue: T | null) => void)(null);
            }
          }}
          disabled={disabled || defaultValue === undefined}
        />
      )}
    </label>
  );
};
