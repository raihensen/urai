/// <reference path="../types/popover.d.ts" />
"use client";

import classNames from "classnames";
import React from "react";
import styles from "./tooltip.module.css";

/** Where the tooltip sits relative to its target. Logical, so it follows
 * writing mode -- `block-end` is "below" in a horizontal script. Each one
 * flips to its opposite when there isn't room. */
export type TooltipPlacement =
  | "block-start"
  | "block-end"
  | "inline-start"
  | "inline-end";

/** What a tooltip does on a device with no hover.
 *
 * There is no right answer for all of them, which is why this is a per-use
 * decision rather than a global one:
 *
 * `"long-press"`  hold the target to reveal it, and the press that revealed
 *                 it doesn't also activate the target. The default, and the
 *                 only option that works on something with its own tap
 *                 action (a button, a checkbox label).
 * `"tap"`         a plain tap toggles it. Only safe on a target that does
 *                 nothing else -- an info icon.
 * `"hide"`        no tooltip at all on touch. The honest choice when the
 *                 target already has a tap action and the same information
 *                 is reachable another way -- an event bar's title, say,
 *                 which tapping the event opens in full. */
export type TooltipTouchBehavior = "long-press" | "tap" | "hide";

/** Mix into a component's own props to give it a built-in tooltip, instead
 * of making every call site wrap it in `<Tooltip>`. See `Button`.
 *
 * Note that a component with a tooltip renders inside a wrapper element,
 * which becomes the flex/grid item in its place. A component positioned by
 * its own margin (`margin-inline-start: auto`, say) needs that class moved
 * to the wrapper -- `Tooltip` takes a `className` for exactly that. Where
 * the target can't afford a wrapper at all, use `useTooltip`. */
export interface TooltipProp {
  /** Shown on hover/focus. Plain text or JSX. */
  tooltip?: React.ReactNode;
  tooltipPlacement?: TooltipPlacement;
  tooltipTouch?: TooltipTouchBehavior;
}

export interface UseTooltipOptions {
  placement?: TooltipPlacement;
  touch?: TooltipTouchBehavior;
}

/** How long a press has to be held before it counts as "show me the
 * tooltip" rather than "activate this". */
const LONG_PRESS_MS = 450;

/** A tooltip without a wrapper element: the caller spreads `anchorProps`
 * onto whatever it already renders, and drops `tooltip` inside it.
 *
 * `Tooltip` is the convenient form and is built on this -- but a wrapper
 * isn't always affordable. A calendar event bar is placed by `grid-area`
 * in its parent grid and sized against that area; wrapping it would hand
 * the grid placement to the wrapper and leave the bar sizing itself
 * against the wrong box. Spreading onto the bar itself avoids all of that.
 *
 * The handlers are pointer- and focus-based, deliberately not
 * `onMouseEnter`/`onMouseLeave`, so a target that already uses those (the
 * event bars, for their cross-view hover highlight) keeps them. */
export function useTooltip(
  content: React.ReactNode,
  { placement = "block-end", touch = "long-press" }: UseTooltipOptions = {},
) {
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  /** The side the tooltip *actually* landed on, which is not necessarily
   * `placement`: `position-try-fallbacks` may have flipped it to fit. Read
   * back from the layout rather than assumed, because the arrow has to
   * point at the target and CSS alone can't report which fallback was
   * used. */
  const [side, setSide] = React.useState<TooltipPlacement>(placement);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const longPressTimer = React.useRef<number | undefined>(undefined);
  /** Set by a long press so the click it turns into can be swallowed. */
  const swallowClick = React.useRef(false);

  // One anchor name per instance, or two tooltips would both resolve to
  // whichever element matched last. `useId`'s delimiters aren't valid in a
  // dashed-ident, hence the strip.
  const anchorName = React.useMemo(
    () => `--tooltip-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [id],
  );

  // React state drives the native popover; nothing else opens or closes it,
  // so there's no `toggle` listener to sync back from.
  React.useEffect(() => {
    const element = popoverRef.current;
    if (!element) return;
    const isOpen = element.matches(":popover-open");
    if (open && !isOpen) element.showPopover();
    else if (!open && isOpen) element.hidePopover();
  }, [open]);

  React.useEffect(() => {
    if (!open) return undefined;

    const measureSide = () => {
      const element = popoverRef.current;
      // The anchor is simply this popover's DOM parent -- `Tooltip` renders
      // it inside the wrapper, and the hook's callers render it inside the
      // target. No ref needed, which matters: targets that already own
      // their `ref` (the event bars' hover ref) could not have spared it.
      // The top layer moves where a popover *paints*, never where it sits
      // in the tree, so this keeps working while it's open.
      const anchor = element?.parentElement;
      if (!element || !anchor) return;
      const tip = element.getBoundingClientRect();
      const box = anchor.getBoundingClientRect();
      // A pixel of slack: the gap is a margin, so the edges never touch
      // exactly, and sub-pixel layout can put them a hair either way.
      if (tip.bottom <= box.top + 1) setSide("block-start");
      else if (tip.top >= box.bottom - 1) setSide("block-end");
      else if (tip.right <= box.left + 1) setSide("inline-start");
      else setSide("inline-end");
    };
    measureSide();

    // Capture, so a handler further down that stops propagation (a modal's
    // own Escape handling, say) can't keep the tooltip open.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // A press anywhere but the target closes it. Mostly for touch, where
    // nothing else would: there is no pointer to leave the target, and a
    // tooltip revealed by a long press otherwise stays up until the next
    // press on that same target.
    const handlePointerDown = (event: PointerEvent) => {
      const anchor = popoverRef.current?.parentElement;
      if (anchor?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("resize", measureSide);
    window.addEventListener("scroll", measureSide, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("resize", measureSide);
      window.removeEventListener("scroll", measureSide, true);
    };
  }, [open]);

  const clearLongPress = React.useCallback(() => {
    if (longPressTimer.current !== undefined) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
  }, []);

  React.useEffect(() => clearLongPress, [clearLongPress]);

  const isTouch = (event: React.PointerEvent) => event.pointerType !== "mouse";

  const anchorProps = {
    // `anchorName` as well as the custom property: `Tooltip`'s wrapper picks
    // the name up from `--tooltip-anchor` in CSS, but a target that spreads
    // these props has no such rule, and without `anchor-name` on the target
    // the tooltip anchors to nothing and lands wherever the viewport puts
    // it. Setting both means either route works.
    style: {
      anchorName,
      "--tooltip-anchor": anchorName,
      // Holding a finger down already means something else to the browser,
      // and each of those would fire alongside the tooltip: selecting the
      // text under it (with its magnifier and handles), and iOS's callout
      // or link preview for a target that is a link -- which `Button` is.
      // Android's context menu is the third, cancelled in `onContextMenu`.
      ...(touch === "long-press" && {
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }),
    } as React.CSSProperties,
    // Hover and focus are the mouse/keyboard paths, and are all a pointing
    // device ever needs.
    onPointerEnter: (event: React.PointerEvent) => {
      if (!isTouch(event)) setOpen(true);
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (!isTouch(event)) setOpen(false);
      clearLongPress();
    },
    onFocusCapture: () => setOpen(true),
    onBlurCapture: () => setOpen(false),
    onPointerDown: (event: React.PointerEvent) => {
      if (!isTouch(event) || touch === "hide") return;
      if (touch === "tap") {
        setOpen(previous => !previous);
        return;
      }
      clearLongPress();
      longPressTimer.current = window.setTimeout(() => {
        swallowClick.current = true;
        setOpen(true);
      }, LONG_PRESS_MS);
    },
    onPointerUp: clearLongPress,
    // Android opens the context menu on the same hold that reveals the
    // tooltip. Only cancelled for touch: a right click keeps its menu.
    onContextMenu: (event: React.MouseEvent) => {
      if (touch !== "long-press") return;
      if ((event.nativeEvent as PointerEvent).pointerType === "mouse") return;
      event.preventDefault();
    },
    onPointerCancel: () => {
      clearLongPress();
      setOpen(false);
    },
    // Capture, so the target never sees the click that a long press turns
    // into: holding a button to read its tooltip must not also press it.
    onClickCapture: (event: React.MouseEvent) => {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  const tooltip = content ? (
    <div
      ref={popoverRef}
      popover="manual"
      role="tooltip"
      data-side={side}
      className={classNames(styles.tooltip, styles[placement])}
    >
      {content}
    </div>
  ) : null;

  return { anchorProps, tooltip };
}

export interface TooltipProps
  // `popover` is omitted because this component's own prop of that name
  // shadows the native attribute -- which the wrapper never sets anyway;
  // the popover here is the tooltip *inside* it.
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "popover"> {
  /** The tooltip's content. Plain text or JSX. */
  popover: React.ReactNode;
  placement?: TooltipPlacement;
  touch?: TooltipTouchBehavior;
  /** The target. Wrapped in an inline-block span that carries the anchor. */
  children: React.ReactNode;
}

export const Tooltip = ({
  popover,
  placement,
  touch,
  className,
  style,
  children,
  ...props
}: TooltipProps) => {
  const { anchorProps, tooltip } = useTooltip(popover, { placement, touch });
  const { style: anchorStyle, ...handlers } = anchorProps;
  return (
    <span
      {...props}
      {...handlers}
      className={classNames(styles.wrapper, className)}
      style={{ ...style, ...anchorStyle }}
    >
      {children}
      {tooltip}
    </span>
  );
};

export default Tooltip;
