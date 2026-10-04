import React from "react";
import { InputLabel } from "./InputLabel";
import styles from "./inputs.module.css";
import type { InputProps } from "./useInput";
import { useInput } from "./useInput";

export interface NumberInputProps<R extends boolean = false> extends InputProps<
  number,
  R
> {
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = <R extends boolean = false>(
  props: NumberInputProps<R>,
) => {
  const { id, handleChange, inputRef } = useInput<number, R>(props, {
    processValue: React.useCallback((value: string) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }, []),
  });

  const { label, value, disabled, required, defaultValue } = props;

  if (
    props.min !== undefined &&
    props.max !== undefined &&
    props.min > props.max
  ) {
    console.warn(
      `NumberInput: min value (${props.min}) is greater than max value (${props.max}). This may lead to unexpected behavior.`,
    );
  }

  return (
    <>
      <InputLabel
        id={id}
        label={label}
        hasValue={value !== null}
        onChange={props.onChange}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      />
      <input
        type="number"
        ref={inputRef}
        id={id}
        className={styles.input}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        step={props.step}
        min={props.min}
        max={props.max}
      />
    </>
  );
};
