import type { Temporal } from "temporal-polyfill";

export interface FormatDateRangeOptions {
  locales?: Intl.LocalesArgument;
  /** `"long"` reads as a sentence ("4.–7. August 2026"); `"short"` fits a
   * dense list ("4.–7. Aug. 2026"). */
  month?: "short" | "long";
  /** Drop the year -- for a range inside a period the surrounding UI has
   * already established, where repeating it only adds noise. */
  year?: boolean;
}

/** The leading "4." of "4.–7. August", or `null` when the locale can't say
 * it that way.
 *
 * `{ day: "numeric" }` on its own yields a bare "4" in every locale, but
 * German writes an ordinal day with a trailing period. Rather than hard-
 * code that, the separator is lifted out of the locale's own day+month
 * pattern: whatever punctuation it puts directly after the day is what
 * belongs there.
 *
 * Returns `null` for month-first locales (en-US's "August 4"), where
 * collapsing the range this way would put the day before a month it isn't
 * attached to. Those fall through to the fuller form. */
function compactDayPrefix(
  date: Temporal.PlainDate,
  locales: Intl.LocalesArgument,
  month: "short" | "long",
): string | null {
  const day = date.toLocaleString(locales, { day: "numeric" });
  const withMonth = date.toLocaleString(locales, { day: "numeric", month });
  if (!withMonth.startsWith(day)) return null;
  const suffix = /^[^\p{L}\p{N}\s]+/u.exec(withMonth.slice(day.length));
  return day + (suffix?.[0] ?? "");
}

/** One date range, said the way a person would.
 *
 * The whole point is what it *leaves out*: a range inside one month names
 * that month once, so "04. Aug. – 07. Aug. 2026" becomes "4.–7. August
 * 2026". Every part is formatted by `Intl` rather than assembled from
 * numbers, so day/month order, punctuation and the month's name all come
 * from the locale.
 *
 * One implementation on purpose: this is the kind of formatting every
 * call site otherwise grows its own slightly different version of. */
export function formatDateRange(
  start: Temporal.PlainDate,
  end: Temporal.PlainDate | null | undefined,
  { locales, month = "long", year = true }: FormatDateRangeOptions = {},
): string {
  const last = end ?? start;

  const full = (date: Temporal.PlainDate) =>
    date.toLocaleString(locales, {
      day: "numeric",
      month,
      ...(year && { year: "numeric" }),
    });
  const dayAndMonth = (date: Temporal.PlainDate) =>
    date.toLocaleString(locales, { day: "numeric", month });

  if (start.equals(last)) return full(start);

  // Same month: the month and the year belong to both ends, so they're
  // said once, at the end. No spaces around the dash -- "4.–7." reads as
  // one token, which is what it is.
  if (start.year === last.year && start.month === last.month) {
    const prefix = compactDayPrefix(start, locales, month);
    if (prefix !== null) return `${prefix}–${full(last)}`;
  }

  // Same year, different months: each end needs its own month, but the
  // year is still shared.
  if (start.year === last.year) {
    return `${dayAndMonth(start)} – ${full(last)}`;
  }

  return `${full(start)} – ${full(last)}`;
}

/** Inclusive day count of a range -- what "4.–7." actually costs you. */
export function getDateRangeLength(
  start: Temporal.PlainDate,
  end: Temporal.PlainDate | null | undefined,
): number {
  return start.until(end ?? start).days + 1;
}
