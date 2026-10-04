import type { Temporal } from "temporal-polyfill";
import type { InputProps } from "../inputs/useInput";
import { PlainDateInput, type PlainDateInputProps } from "./PlainDateInput";
import {
  PlainDateTimeInput,
  type PlainDateTimeInputProps,
} from "./PlainDateTimeInput";

// type TemporalInputProps<R extends boolean = false> =
//   | ({
//       type: "plain-date";
//     } & PlainDateInputProps<R>)
//   | ({
//       type: "plain-datetime";
//     } & PlainDateTimeInputProps<R>);

export interface TemporalInputProps<
  R extends boolean = false,
> extends InputProps<Temporal.PlainDate | Temporal.PlainDateTime, R> {
  type: "plain-date" | "plain-datetime";
}

export const TemporalInput = <R extends boolean = false>({
  type,
  ...props
}: TemporalInputProps<R>) => {
  if (type === "plain-date") {
    return <PlainDateInput<R> {...(props as PlainDateInputProps<R>)} />;
  }
  if (type === "plain-datetime") {
    return <PlainDateTimeInput<R> {...(props as PlainDateTimeInputProps<R>)} />;
  }

  return null;
};
