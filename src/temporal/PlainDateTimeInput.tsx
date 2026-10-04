import React from "react";
import { Temporal } from "temporal-polyfill";
import styles from "../inputs/inputs.module.css";
import { InputLabel } from "../inputs/InputLabel";
import type { InputProps } from "../inputs/useInput";
import { useInput } from "../inputs/useInput";

export interface PlainDateTimeInputProps<
  R extends boolean = false,
> extends InputProps<Temporal.PlainDateTime, R> {}

export const PlainDateTimeInput = <R extends boolean = false>(
  props: PlainDateTimeInputProps<R>,
) => {
  const { id, inputRef, handleChange } = useInput<Temporal.PlainDateTime, R>(
    props,
    {
      processValue: React.useCallback(
        (newValue: string) => fromDateTimeLocalString(newValue),
        [],
      ),
    },
  );

  const { label, value, onChange, disabled, required, defaultValue } = props;

  const stringValue: string = React.useMemo(
    () => toDatetimeLocalString(value),
    [value],
  );

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
        type="datetime-local"
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

export function toDatetimeLocalString(
  date: Temporal.PlainDateTime | null,
): string {
  if (!date) return "";
  return date.toString({ smallestUnit: "minute" });
}

function fromDateTimeLocalString(
  dateString: string,
): Temporal.PlainDateTime | null {
  if (!dateString.length) return null;
  // Expecting format "YYYY-MM-DDTHH:MM"
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) throw new Error("Invalid datetime-local format");
  const [, year, month, day, hour, minute] = match;
  return Temporal.PlainDateTime.from({
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
  });
}
