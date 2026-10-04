import classNames from "classnames";
import React from "react";
import type { Temporal } from "temporal-polyfill";
import styles from "./dateSegments.module.css";
import { DATE_SEGMENT_MAX, useDateSegments } from "./useDateSegments";

export interface DateSegmentGroupProps {
  value: Temporal.PlainDate | null;
  onChange: (value: Temporal.PlainDate) => void;
  disabled?: boolean;
  locales?: Intl.LocalesArgument;
  "aria-label"?: string;
  /** Applied to the first segment, so a `<label htmlFor={id}>` focuses it. */
  id?: string;
}

/** Renders one classic "dd.mm.yyyy"-style date display whose segments are
 * individually keyboard-editable in place -- see `useDateSegments` for the
 * interaction model.
 *
 * The display only; it has no popup calendar and no trigger of its own, so
 * it composes into either a single-date or a start/end-range field. */
export const DateSegmentGroup = ({
  value,
  onChange,
  disabled,
  locales,
  ...props
}: DateSegmentGroupProps) => {
  const segments = useDateSegments({ value, onChange, disabled, locales });

  return (
    <span className={styles.segmentGroup} aria-label={props["aria-label"]}>
      {segments.map((segment, i) => (
        <React.Fragment key={segment.type}>
          <span
            ref={segment.ref}
            id={i === 0 ? props.id : undefined}
            role="spinbutton"
            tabIndex={disabled ? -1 : 0}
            aria-label={segment.type}
            aria-valuemin={1}
            aria-valuemax={DATE_SEGMENT_MAX[segment.type]}
            aria-valuenow={
              segment.isPlaceholder ? undefined : Number(segment.text)
            }
            className={classNames(
              styles.segment,
              segment.isPlaceholder && styles.placeholder,
            )}
            onFocus={segment.onFocus}
            onKeyDown={segment.onKeyDown}
          >
            {segment.isPlaceholder ? segment.placeholder : segment.text}
          </span>
          {segment.separatorAfter && (
            <span className={styles.separator} aria-hidden>
              {segment.separatorAfter}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};
