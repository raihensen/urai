import React from "react";

export type DefaultValue<T> = T | (() => T);

export interface InputProps<T, Req extends boolean = false> {
  label?: string;
  value: Req extends true ? T : T | null;
  onChange: Req extends true
    ? (newValue: T) => void
    : (newValue: T | null) => void;
  disabled?: boolean;
  required?: Req;
  errorMessage?: string;
  /** Default-Wert, der beim Aktivieren der Checkbox verwendet wird.
   *
   * Kann auch als Funktion angegeben werden, um die Berechnung des Default-Werts zu verzögern, bis er tatsächlich benötigt wird. */
  defaultValue?: Req extends true ? DefaultValue<T> : DefaultValue<T | null>;
  /** Inside a two-column `Form`: start a row of its own and fill it, rather
   * than taking the next half-row slot. */
  fullRow?: boolean;
}

export type InputValue<T, Req extends boolean> = Req extends true
  ? T
  : T | null;

const DEFAULT_PROCESS_VALUE = <T>(value: string): T | null => {
  if (value === "") {
    return null;
  }
  return value as T;
};

interface UseInputOptions<T> {
  processValue?: (value: string) => T | null;
  validate?: (value: T | null) => boolean;
}

export function useInput<
  T,
  Req extends boolean = false,
  E extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =
    HTMLInputElement,
>(
  {
    onChange,
    errorMessage = "Invalid input",
    ...props
  }: InputProps<T, Req> & { errorMessage?: string },
  options?: UseInputOptions<T>,
) {
  const { processValue, validate } = options ?? {};

  const id = React.useId();
  const inputRef = React.useRef<E>(null);

  const latestValue = React.useRef(props.value);
  React.useEffect(() => {
    latestValue.current = props.value;
  }, [props.value]);

  const [isValid, setIsValid] = React.useState(true);
  React.useEffect(() => {
    if (inputRef.current) {
      if (isValid) {
        inputRef.current.setCustomValidity("");
      } else {
        inputRef.current.setCustomValidity(errorMessage);
      }
    }
  }, [isValid, errorMessage]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<E> | string | (Req extends false ? null : never)) => {
      const inputValue =
        (typeof e === "string" || e === null ? e : e.target.value) ?? "";
      let newValue: T | null = null;
      try {
        newValue = (processValue ?? DEFAULT_PROCESS_VALUE<T>)(inputValue);
      } catch (error) {
        console.error("Error processing input value:", error);
        setIsValid(false);
        return;
      }

      if (props.required) {
        if (newValue === null) {
          setIsValid(false);
          return;
        }
      }

      // TODO: Also include built-in HTML validation via inputRef.current?.validity etc. (e.g. for required fields, pattern, min/max, etc.)
      // const valid =
      //   (inputRef.current?.checkValidity() ?? true) &&
      //   (validate?.(newValue) ?? true);
      const valid = validate?.(newValue) ?? true;
      setIsValid(valid);
      console.debug(
        `Input value changed: ${newValue?.toString()}, valid: ${valid}`,
      );
      if (valid) {
        (onChange as (newValue: T | null) => void)(newValue);
      }
    },
    [onChange, props.required, processValue, validate],
  );

  return { id, inputRef, handleChange, isValid };
}
