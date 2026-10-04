import React from "react";
import { Temporal } from "temporal-polyfill";

export type DateSegmentType = "day" | "month" | "year";

export const DATE_SEGMENT_MAX: Record<DateSegmentType, number> = {
  day: 31,
  month: 12,
  year: 9999,
};
const MAX_LEN: Record<DateSegmentType, number> = { day: 2, month: 2, year: 4 };
const PLACEHOLDER: Record<DateSegmentType, string> = {
  day: "dd",
  month: "mm",
  year: "yyyy",
};
const UNIT: Record<DateSegmentType, "days" | "months" | "years"> = {
  day: "days",
  month: "months",
  year: "years",
};

export interface DateSegment {
  type: DateSegmentType;
  ref: React.RefObject<HTMLSpanElement>;
  text: string;
  placeholder: string;
  isPlaceholder: boolean;
  /** Literal separator (e.g. ".") to render right after this segment, "" for the last one. */
  separatorAfter: string;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
}

interface UseDateSegmentsArgs {
  value: Temporal.PlainDate | null;
  /** Never called with `null` -- editing a segment always produces a
   * concrete date (defaulting to today when `value` was previously null).
   * Whether/how a field can be cleared back to `null` is handled by the
   * caller (see `InputLabel`'s optional-value checkbox), not here. */
  onChange: (value: Temporal.PlainDate) => void;
  disabled?: boolean;
  locales?: Intl.LocalesArgument;
}

/** Locale-ordered day/month/year segments (+ the literal separators between
 * them), derived from how the locale formats a plain date -- so e.g. a
 * `de-DE` user sees `dd.mm.yyyy` and a `en-US` user sees `mm/dd/yyyy`. */
function getSegmentOrder(locales: Intl.LocalesArgument): {
  order: DateSegmentType[];
  separators: string[];
} {
  const fallback = {
    order: ["day", "month", "year"] as DateSegmentType[],
    separators: [".", "."],
  };
  try {
    const parts = new Intl.DateTimeFormat(locales, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const order: DateSegmentType[] = [];
    const separators: string[] = [];
    for (const part of parts) {
      if (
        part.type === "day" ||
        part.type === "month" ||
        part.type === "year"
      ) {
        order.push(part.type);
      } else if (order.length > 0 && order.length < 3) {
        separators.push(part.value);
      }
    }
    return order.length === 3 ? { order, separators } : fallback;
  } catch {
    return fallback;
  }
}

/** Keyboard-editable day/month/year segments for one `Temporal.PlainDate`
 * value: ArrowUp/Down increments/decrements the focused segment, ArrowLeft/
 * Right moves focus between segments, and digit keys type a new value
 * directly (auto-advancing once a segment is unambiguous). Used by both
 * `DatePicker` and `DateRangePicker` (twice, for start/end). */
export function useDateSegments({
  value,
  onChange,
  disabled,
  locales,
}: UseDateSegmentsArgs): DateSegment[] {
  const { order, separators } = React.useMemo(
    () => getSegmentOrder(locales),
    [locales],
  );

  const dayRef = React.useRef<HTMLSpanElement>(null);
  const monthRef = React.useRef<HTMLSpanElement>(null);
  const yearRef = React.useRef<HTMLSpanElement>(null);
  const refs = React.useMemo(
    () => ({ day: dayRef, month: monthRef, year: yearRef }),
    [],
  );

  // Digits typed so far for whichever segment is mid-edit; cleared once
  // committed to a `Temporal.PlainDate` (or when focus moves elsewhere).
  const [buffer, setBuffer] = React.useState<{
    type: DateSegmentType;
    text: string;
  } | null>(null);

  const focusSegment = React.useCallback(
    (type: DateSegmentType) => {
      refs[type].current?.focus();
    },
    [refs],
  );

  const stepValue = React.useCallback(
    (type: DateSegmentType, delta: 1 | -1) => {
      const base = value ?? Temporal.Now.plainDateISO();
      setBuffer(null);
      onChange(base.add({ [UNIT[type]]: delta }));
    },
    [value, onChange],
  );

  const commitDigit = React.useCallback(
    (type: DateSegmentType, digit: string) => {
      const current = buffer && buffer.type === type ? buffer.text : "";
      let text = current + digit;
      let num = parseInt(text, 10);
      if (text.length > MAX_LEN[type] || num > DATE_SEGMENT_MAX[type]) {
        // Doesn't fit onto the current buffer -- start over with just the
        // newly typed digit, same as most native date fields.
        text = digit;
        num = parseInt(text, 10);
      }
      const isUnambiguous =
        text.length >= MAX_LEN[type] || num * 10 > DATE_SEGMENT_MAX[type];
      if (!isUnambiguous) {
        setBuffer({ type, text });
        return;
      }
      setBuffer(null);
      const base = value ?? Temporal.Now.plainDateISO();
      try {
        onChange(base.with({ [type]: num }));
      } catch {
        // Out-of-range combination -- Temporal constrains by default, so
        // this shouldn't normally happen; ignore and keep the prior value.
      }
      const idx = order.indexOf(type);
      if (idx >= 0 && idx < order.length - 1) {
        focusSegment(order[idx + 1]);
      }
    },
    [buffer, value, onChange, order, focusSegment],
  );

  const handleKeyDown = React.useCallback(
    (type: DateSegmentType, event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return;
      const idx = order.indexOf(type);
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          stepValue(type, 1);
          break;
        case "ArrowDown":
          event.preventDefault();
          stepValue(type, -1);
          break;
        case "ArrowLeft":
          // Stopped from propagating because an app may well have a
          // document-level bare ArrowLeft/Right shortcut (paging a
          // calendar, say), which must not also fire while a segment is
          // being edited.
          event.stopPropagation();
          if (idx > 0) {
            event.preventDefault();
            focusSegment(order[idx - 1]);
          }
          break;
        case "ArrowRight":
          event.stopPropagation();
          if (idx < order.length - 1) {
            event.preventDefault();
            focusSegment(order[idx + 1]);
          }
          break;
        case "Backspace":
          event.preventDefault();
          if (buffer && buffer.type === type && buffer.text.length > 0) {
            const text = buffer.text.slice(0, -1);
            setBuffer(text ? { type, text } : null);
          } else if (idx > 0) {
            focusSegment(order[idx - 1]);
          }
          break;
        default:
          if (/^[0-9]$/.test(event.key)) {
            event.preventDefault();
            commitDigit(type, event.key);
          }
      }
    },
    [disabled, order, focusSegment, stepValue, buffer, commitDigit],
  );

  return React.useMemo(
    () =>
      order.map((type, i): DateSegment => {
        const buffered = buffer && buffer.type === type ? buffer.text : null;
        const text =
          buffered ??
          (value ? String(value[type]).padStart(MAX_LEN[type], "0") : "");
        return {
          type,
          ref: refs[type],
          text,
          placeholder: PLACEHOLDER[type],
          isPlaceholder: text === "",
          separatorAfter: i < order.length - 1 ? (separators[i] ?? ".") : "",
          onFocus: () => setBuffer(null),
          onKeyDown: event => handleKeyDown(type, event),
        };
      }),
    [order, separators, buffer, value, refs, handleKeyDown],
  );
}
