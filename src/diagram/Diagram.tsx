import classNames from "classnames";
import React from "react";
import styles from "./Diagram.module.css";

/** How many colours the fixed palette has (`--diagram-1` … `--diagram-8` in
 * `styles/tokens.css`). */
export const DIAGRAM_PALETTE_SIZE = 8;

/** The palette colour for a slot, 1-based, as a CSS value that follows the
 * theme. Useful for matching something outside the diagram to a slice. */
export function diagramColor(slot: number): string {
  const index =
    ((Math.max(1, Math.round(slot)) - 1) % DIAGRAM_PALETTE_SIZE) + 1;
  return `var(--diagram-${index})`;
}

export interface DiagramDatum {
  label: string;
  value: number;
  /** Any CSS colour. Without one, the entry takes the palette slot of its
   * position in `data` -- so a colour belongs to an entry, not to a rank,
   * and never moves when values change. */
  color?: string;
}

export interface DiagramProps {
  /** Only pies so far. */
  type: "pie";
  data: DiagramDatum[];
  /** Shown above the diagram and used as its accessible name. */
  title?: string;
  /** A ring instead of a full disc. */
  donut?: boolean;
  /** Diameter of the pie in px. @default 160 */
  size?: number;
  /** How values read in the legend and tooltip. @default toLocaleString() */
  formatValue?: (value: number) => string;
  /**
   * Slices shown before the rest are folded into one neutral "Other"
   * slice, in data order -- so pass the important entries first. A pie
   * stops being readable past a handful of slices. At most
   * `DIAGRAM_PALETTE_SIZE`. @default 6
   */
  maxSlices?: number;
  /** @default "Other" */
  otherLabel?: string;
  className?: string;
}

interface Slice {
  label: string;
  value: number;
  share: number;
  color: string;
  start: number;
  end: number;
}

/** Up to this many slices get their percentage printed next to them; past
 * it the labels would crowd, and the legend carries the numbers. */
const MAX_DIRECT_LABELS = 4;
/** A slice thinner than this gets no direct label (it wouldn't fit). */
const MIN_LABELLED_SHARE = 0.05;
/** Room around the pie for direct labels, in px. */
const LABEL_SPACE = 36;
const DONUT_HOLE = 0.58;

const formatPercent = (share: number) =>
  share.toLocaleString(undefined, {
    style: "percent",
    maximumFractionDigits: share < 0.1 ? 1 : 0,
  });

/** Folds everything past `maxSlices` into one "Other" entry, drops entries
 * a pie can't show (zero, negative, not a number), and lays the rest out
 * clockwise from twelve o'clock. */
function buildSlices(
  data: DiagramDatum[],
  maxSlices: number,
  otherLabel: string,
): Slice[] {
  const entries = data
    .map((datum, index) => ({
      label: datum.label,
      value: datum.value,
      color: datum.color ?? diagramColor(index + 1),
    }))
    .filter(entry => Number.isFinite(entry.value) && entry.value > 0);

  const limit = Math.min(Math.max(1, maxSlices), DIAGRAM_PALETTE_SIZE);
  // Folding one entry would just rename it; only fold two or more.
  const shown =
    entries.length > limit
      ? [
          ...entries.slice(0, limit - 1),
          {
            label: otherLabel,
            value: entries
              .slice(limit - 1)
              .reduce((sum, entry) => sum + entry.value, 0),
            color: "var(--diagram-other)",
          },
        ]
      : entries;

  const total = shown.reduce((sum, entry) => sum + entry.value, 0);
  let angle = 0;
  return shown.map(entry => {
    const share = entry.value / total;
    const slice = { ...entry, share, start: angle, end: angle + share };
    angle += share;
    return slice;
  });
}

/** A point on the circle, with 0 at twelve o'clock and 1 a full turn. */
function polar(radius: number, turn: number): [number, number] {
  const angle = turn * 2 * Math.PI - Math.PI / 2;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

function slicePath(slice: Slice, outer: number, inner: number): string {
  // A full circle can't be drawn as one arc: start and end coincide.
  if (slice.share >= 1 - 1e-9) {
    const ring = (r: number) =>
      `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`;
    return inner > 0 ? `${ring(outer)} ${ring(inner)}` : ring(outer);
  }
  const large = slice.share > 0.5 ? 1 : 0;
  const [x0, y0] = polar(outer, slice.start);
  const [x1, y1] = polar(outer, slice.end);
  if (inner <= 0) {
    return `M 0 0 L ${x0} ${y0} A ${outer} ${outer} 0 ${large} 1 ${x1} ${y1} Z`;
  }
  const [x2, y2] = polar(inner, slice.end);
  const [x3, y3] = polar(inner, slice.start);
  return [
    `M ${x0} ${y0}`,
    `A ${outer} ${outer} 0 ${large} 1 ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${inner} ${inner} 0 ${large} 0 ${x3} ${y3}`,
    "Z",
  ].join(" ");
}

/**
 * A diagram -- for now a pie: the share of a whole, at a glance.
 *
 * A pie is the right form only for that. Close values are hard to compare
 * by angle (use bars, or just the numbers), two slices are one ratio (a
 * meter or a single number says it better), and past about six slices the
 * colours stop being distinguishable, which is why the rest folds into
 * "Other".
 *
 * Slices are separated by a 2px gap in the background colour. A legend
 * with values and shares is always there, up to four slices also carry
 * their percentage, and a visually hidden table gives screen readers the
 * numbers -- colour never carries identity alone.
 */
export const Diagram = ({
  data,
  title,
  donut = false,
  size = 160,
  formatValue = value => value.toLocaleString(),
  maxSlices = 6,
  otherLabel = "Other",
  className,
}: DiagramProps) => {
  const slices = buildSlices(data, maxSlices, otherLabel);
  const [active, setActive] = React.useState<number | null>(null);
  const [tooltip, setTooltip] = React.useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);

  const directLabels = slices.length <= MAX_DIRECT_LABELS;
  const radius = size / 2;
  const pad = directLabels ? LABEL_SPACE : 2;
  const box = size + 2 * pad;

  const showTooltip = (index: number, event: React.PointerEvent) => {
    const frame = frameRef.current?.getBoundingClientRect();
    if (!frame) return;
    setActive(index);
    setTooltip({
      index,
      x: event.clientX - frame.left,
      y: event.clientY - frame.top,
    });
  };
  const clear = () => {
    setActive(null);
    setTooltip(null);
  };

  if (slices.length === 0) {
    return (
      <figure className={classNames(styles.diagram, className)}>
        {title && <figcaption className={styles.title}>{title}</figcaption>}
        <p className={styles.empty}>No data</p>
      </figure>
    );
  }

  const tooltipSlice = tooltip && slices[tooltip.index];

  return (
    <figure className={classNames(styles.diagram, className)}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}
      <div className={styles.body}>
        <div ref={frameRef} className={styles.frame}>
          <svg
            width={box}
            height={box}
            viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}
            className={styles.svg}
            // The table below is the accessible version.
            aria-hidden
            onPointerLeave={clear}
          >
            {slices.map((slice, index) => (
              <path
                key={`${slice.label}-${index}`}
                d={slicePath(slice, radius, donut ? radius * DONUT_HOLE : 0)}
                className={classNames(
                  styles.slice,
                  active !== null && active !== index && styles.dimmed,
                )}
                style={{ fill: slice.color }}
                fillRule="evenodd"
                onPointerMove={event => showTooltip(index, event)}
              />
            ))}
            {directLabels &&
              slices.map((slice, index) => {
                if (slice.share < MIN_LABELLED_SHARE) return null;
                const middle = (slice.start + slice.end) / 2;
                const [x, y] = polar(radius + 8, middle);
                // Left half anchors at the end, right half at the start,
                // top and bottom in the middle.
                const horizontal = Math.sin(middle * 2 * Math.PI);
                const anchor =
                  horizontal > 0.3
                    ? "start"
                    : horizontal < -0.3
                      ? "end"
                      : "middle";
                return (
                  <text
                    key={`label-${index}`}
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className={styles.directLabel}
                  >
                    {formatPercent(slice.share)}
                  </text>
                );
              })}
          </svg>
          {tooltipSlice && (
            <div
              className={styles.tooltip}
              style={{ left: tooltip.x, top: tooltip.y }}
              role="presentation"
            >
              <span className={styles.tooltipLabel}>
                <span
                  className={styles.swatch}
                  style={{ background: tooltipSlice.color }}
                />
                <span>{tooltipSlice.label}</span>
              </span>
              <span className={styles.tooltipValue}>
                {formatValue(tooltipSlice.value)} ·{" "}
                {formatPercent(tooltipSlice.share)}
              </span>
            </div>
          )}
        </div>

        <ul className={styles.legend} aria-hidden>
          {slices.map((slice, index) => (
            <li
              key={`${slice.label}-${index}`}
              className={classNames(
                styles.legendItem,
                active !== null && active !== index && styles.dimmed,
              )}
              onPointerEnter={() => setActive(index)}
              onPointerLeave={() => setActive(null)}
            >
              <span
                className={styles.swatch}
                style={{ background: slice.color }}
              />
              <span className={styles.legendLabel}>{slice.label}</span>
              <span className={styles.legendValue}>
                {formatValue(slice.value)}
              </span>
              <span className={styles.legendShare}>
                {formatPercent(slice.share)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <table className={styles.srOnly}>
        {title && <caption>{title}</caption>}
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice, index) => (
            <tr key={`${slice.label}-${index}`}>
              <th scope="row">{slice.label}</th>
              <td>{formatValue(slice.value)}</td>
              <td>{formatPercent(slice.share)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
