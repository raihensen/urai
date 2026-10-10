import styles from "./inputs.module.css";
import { InputLabel } from "./InputLabel";
import type { InputProps } from "./useInput";
import { useInput } from "./useInput";

export type TextInputProps<Req extends boolean = false> = InputProps<
  string,
  Req
>;

export const TextInput = (props: TextInputProps) => {
  const { id, inputRef, handleChange } = useInput<string, false>(props);

  return (
    <>
      <InputLabel
        id={id}
        label={props.label}
        hasValue={props.value !== null}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
        required={props.required}
        disabled={props.disabled}
        fullRow={props.fullRow}
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        className={styles.input}
        value={props.value ?? ""}
        onChange={handleChange}
        disabled={props.disabled}
      />
    </>
  );
};
