import classNames from "classnames";
import React from "react";
import type { IconType } from "react-icons";
import type { TooltipProp } from "../tooltip/Tooltip";
import { Tooltip } from "../tooltip/Tooltip";
import { getContrastingTextColor } from "../utils/color";
import styles from "./Badge.module.css";

/** How much of the badge's colour is actually painted.
 *
 * `"solid"`    the colour as the background, label in whichever of black or
 *              white reads on it (see `getContrastingTextColor`).
 * `"soft"`     a tint of the colour behind the page's own text colour. The
 *              default: it carries the same information at a fraction of
 *              the visual weight, which is what you want when several sit
 *              in a row.
 * `"outline"`  the colour as a border only, for a badge on an already busy
 *              background. */
export type BadgeVariant = "solid" | "soft" | "outline";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  TooltipProp & {
    /** Any CSS colour. A hex value additionally gets a readable label
     * colour computed for it in the `"solid"` variant; anything else
     * (`oklch(...)`, a custom property) still paints correctly but falls
     * back to white there, since its luminance can't be measured. Omitted
     * entirely, the badge uses the theme's neutral grey. */
    color?: string;
    variant?: BadgeVariant;
    size?: "small" | "medium";
    icon?: IconType;
    /** Gives the badge a pointer cursor and a hover state. For a badge that
     * is genuinely a control, prefer `Button` -- this is for the in-between
     * case of a badge that opens something, such as `Dropdown`'s badge
     * trigger. */
    interactive?: boolean;
  };

/** A small label: a category, a count, a status.
 *
 * Non-interactive by default and rendered as a `<span>`, because a badge is
 * a piece of text about its surroundings rather than something to press. */
export const Badge = ({
  color,
  variant = "soft",
  size = "medium",
  icon: Icon,
  interactive = false,
  tooltip,
  tooltipPlacement,
  // A plain badge has no tap action of its own, so a tap is free to mean
  // "show me the tooltip" -- unlike `Button`, which must use long press.
  // An interactive one does have one, so it goes back to long press.
  tooltipTouch,
  className,
  children,
  style,
  ...props
}: BadgeProps) => {
  const badge = (
    <span
      {...props}
      className={classNames(
        styles.badge,
        styles[variant],
        size === "small" && styles.small,
        interactive && styles.interactive,
        className,
      )}
      style={
        {
          ...style,
          ...(color && {
            "--badge-color": color,
            "--badge-on-color": getContrastingTextColor(color),
          }),
        } as React.CSSProperties
      }
    >
      {!!Icon && <Icon className={styles.icon} />}
      {children}
    </span>
  );

  if (!tooltip) return badge;
  return (
    <Tooltip
      popover={tooltip}
      placement={tooltipPlacement}
      touch={tooltipTouch ?? (interactive ? "long-press" : "tap")}
    >
      {badge}
    </Tooltip>
  );
};

export default Badge;
