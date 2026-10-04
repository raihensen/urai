import React from "react";
import { Temporal } from "temporal-polyfill";
import styles from "../inputs/inputs.module.css";
import { InputLabel } from "../inputs/InputLabel";
import type { InputProps } from "../inputs/useInput";
import { useInput } from "../inputs/useInput";

export interface PlainDateInputProps<
  R extends boolean = false,
> extends InputProps<Temporal.PlainDate, R> {}

export const PlainDateInput = <R extends boolean = false>(
  props: PlainDateInputProps<R>,
) => {
  const { id, inputRef, handleChange } = useInput<Temporal.PlainDate, R>(
    props,
    {
      processValue: React.useCallback(
        (newValue: string) => fromDateString(newValue),
        [],
      ),
    },
  );

  const { label, value, onChange, disabled, required, defaultValue } = props;

  const stringValue: string = React.useMemo(() => toDateString(value), [value]);

  return (
    <>
      <InputLabel
        id={id}
        label={label}
        hasValue={value !== null}
        onChange={onChange}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
      />
      <input
        type="date"
        ref={inputRef}
        id={id}
        className={styles.input}
        value={stringValue}
        onChange={handleChange}
        disabled={disabled}
        required={required}
      />
    </>
  );
};

function toDateString(date: Temporal.PlainDate | null): string {
  if (!date) return "";
  return date.toString();
}

function fromDateString(dateString: string): Temporal.PlainDate | null {
  if (!dateString.length) return null;
  // Expecting format "YYYY-MM-DD"
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("Invalid date format");
  const [, year, month, day] = match;
  return Temporal.PlainDate.from({
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
  });
}
