import React from "react";
import { Temporal } from "temporal-polyfill";
import {
  DateRangeLabel,
  DateSegmentGroup,
  PlainDateInput,
  PlainDateTimeInput,
  getDateRangeLength,
  useLocales,
} from "../../src";
import { Row, Section } from "../Layout";

/** The three cases `formatDateRange` collapses differently, so the row below
 * shows all of them at once rather than one example. */
const RANGES: [string, Temporal.PlainDate, Temporal.PlainDate | null][] = [
  ["single day", Temporal.PlainDate.from("2026-08-04"), null],
  [
    "within a month",
    Temporal.PlainDate.from("2026-08-04"),
    Temporal.PlainDate.from("2026-08-07"),
  ],
  [
    "across months",
    Temporal.PlainDate.from("2026-08-28"),
    Temporal.PlainDate.from("2026-09-03"),
  ],
  [
    "across years",
    Temporal.PlainDate.from("2026-12-28"),
    Temporal.PlainDate.from("2027-01-03"),
  ],
];

export const TemporalSamples = () => {
  const locales = useLocales();
  const [date, setDate] = React.useState<Temporal.PlainDate | null>(
    Temporal.PlainDate.from("2026-08-04"),
  );
  const [dateTime, setDateTime] = React.useState<Temporal.PlainDateTime | null>(
    Temporal.PlainDateTime.from("2026-08-04T09:30"),
  );
  const [segments, setSegments] = React.useState<Temporal.PlainDate | null>(
    null,
  );

  return (
    <Section
      title="Temporal"
      description="Temporal values throughout -- no Date, and no string dates in any prop.
        DateSegmentGroup orders its own segments from the locale, so the same
        component reads dd.mm.yyyy for de-DE and mm/dd/yyyy for en-US; arrow
        keys step the focused segment and typing digits advances automatically.
        DateRangeLabel collapses whatever the two ends share."
    >
      <div className="form">
        <PlainDateInput label="PlainDate" value={date} onChange={setDate} />
        <PlainDateTimeInput
          label="PlainDateTime"
          value={dateTime}
          onChange={setDateTime}
        />
      </div>

      <Row label="DateSegmentGroup">
        {/* No value to begin with, so the placeholders show. Arrow keys and
            digits both work; it never hands back null. */}
        <DateSegmentGroup
          value={segments}
          onChange={setSegments}
          locales={locales}
          aria-label="Pick a date"
        />
        <span className="value">{segments?.toString() ?? "(empty)"}</span>
      </Row>

      <Row label="locale order">
        <span className="value">your locale: {String(locales)}</span>
        {(["de-DE", "en-US", "ja-JP"] as const).map(locale => (
          <DateSegmentGroup
            key={locale}
            value={Temporal.PlainDate.from("2026-08-04")}
            onChange={() => undefined}
            locales={locale}
            aria-label={locale}
          />
        ))}
      </Row>

      {RANGES.map(([label, start, end]) => (
        <Row key={label} label={label}>
          <DateRangeLabel start={start} end={end} />
          <span className="value">{getDateRangeLength(start, end)} day(s)</span>
        </Row>
      ))}

      <Row label="month / year">
        <DateRangeLabel start={RANGES[1][1]} end={RANGES[1][2]} month="short" />
        <DateRangeLabel start={RANGES[1][1]} end={RANGES[1][2]} year={false} />
      </Row>
    </Section>
  );
};
