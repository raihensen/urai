"use client";

import { useLocales } from "../hooks/useLocales";
import type { FormatDateRangeOptions } from "./dateRange";
import { formatDateRange } from "./dateRange";
import React from "react";
import type { Temporal } from "temporal-polyfill";

export interface DateRangeLabelProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    Omit<FormatDateRangeOptions, "locales"> {
  start: Temporal.PlainDate;
  /** Omitted or equal to `start` renders a single date. */
  end?: Temporal.PlainDate | null;
}

/** Renders a date range in the user's locale, collapsing what the two ends
 * share -- see `formatDateRange`. Takes the locale from `useLocales` so no
 * call site has to thread it through. */
export const DateRangeLabel = ({
  start,
  end,
  month,
  year,
  ...props
}: DateRangeLabelProps) => {
  const locales = useLocales();
  return (
    <span {...props}>
      {formatDateRange(start, end, { locales, month, year })}
    </span>
  );
};

export default DateRangeLabel;
