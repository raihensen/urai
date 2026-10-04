import classNames from "classnames";
import React from "react";
import type { TooltipProp } from "../tooltip/Tooltip";
import { Tooltip } from "../tooltip/Tooltip";
import "./button.css";

/** How the corners are cut. Independent of whether the button is square:
 * an icon-only button is always 1:1 (see `isIconOnly`), so `"circle"`
 * renders a true circle there and a pill anywhere there's a label. */
export type ButtonShape = "circle" | "rounded" | "sharp";

export type ButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  TooltipProp & {
    large?: boolean;
    link?: boolean;
    alpha?: boolean;
    shape?: ButtonShape;
    primary?: boolean;
    secondary?: boolean;
    danger?: boolean;
    disabled?: boolean;
    /** Overrides the automatic detection below -- for the rare case where
     * the content is an element that nonetheless reads as a label. */
    iconOnly?: boolean;
  };

const styles = {
  large: "large",
  circle: "circle",
  sharp: "sharp",
  iconOnly: "icon-only",
  link: "link",
  alpha: "alpha",
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
  disabled: "disabled",
};

/** `true` when the button's content is a single element and nothing else --
 * an icon, with no label beside it.
 *
 * Fragments are walked through rather than counted: `Dropdown` passes its
 * whole trigger as one `<>...</>`, which `React.Children` reports as a
 * single child even when it holds an icon, a label and a caret. Whitespace-
 * only strings are ignored too, since JSX produces them between elements
 * that sit on separate lines. */
function isIconOnly(children: React.ReactNode): boolean {
  const leaves: React.ReactNode[] = [];
  const walk = (node: React.ReactNode) => {
    React.Children.forEach(node, child => {
      if (child === null || child === undefined || typeof child === "boolean") {
        return;
      }
      if (typeof child === "string") {
        if (child.trim() !== "") leaves.push(child);
        return;
      }
      if (typeof child === "number") {
        leaves.push(child);
        return;
      }
      if (React.isValidElement(child) && child.type === React.Fragment) {
        walk((child.props as { children?: React.ReactNode }).children);
        return;
      }
      leaves.push(child);
    });
  };
  walk(children);
  return leaves.length === 1 && React.isValidElement(leaves[0]);
}

export const Button = ({
  href,
  children,
  shape = "rounded",
  iconOnly,
  large = false,
  link = false,
  alpha = false,
  primary = false,
  secondary = false,
  danger = false,
  disabled = false,
  tooltip,
  tooltipPlacement,
  // A button always has a tap action of its own, so a plain tap can never
  // mean "show me the tooltip" -- long press is the only gesture left.
  tooltipTouch = "long-press",
  className,
  ...props
}: ButtonProps) => {
  className = classNames(
    "button",
    className,
    shape === "circle" && styles.circle,
    shape === "sharp" && styles.sharp,
    (iconOnly ?? isIconOnly(children)) && styles.iconOnly,
    large && styles.large,
    link && styles.link,
    alpha && styles.alpha,
    primary && styles.primary,
    secondary && styles.secondary,
    danger && styles.danger,
    disabled && styles.disabled,
  );

  const button = href ? (
    <a className={className} href={href} {...props}>
      {children}
    </a>
  ) : (
    // return <button {...props}>{children}</button>
    <a className={className} {...props}>
      {children}
    </a>
  );

  if (!tooltip) return button;
  return (
    <Tooltip
      popover={tooltip}
      placement={tooltipPlacement}
      touch={tooltipTouch}
    >
      {button}
    </Tooltip>
  );
};

export default Button;
