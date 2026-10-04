/// <reference path="../types/popover.d.ts" />
import classNames from "classnames";
import React from "react";
import type { IconType } from "react-icons";
import { FaChevronDown } from "react-icons/fa6";
import type { BadgeProps } from "../badge/Badge";
import Badge from "../badge/Badge";
import type { ButtonProps } from "../button/Button";
import Button from "../button/Button";
import styles from "./dropdown.module.css";

export type DropdownProps = {
  /** What the menu hangs off. `"button"` is a full `Button`; `"badge"` is a
   * `Badge`, for a trigger that should read as a label rather than as a
   * control. */
  type?: "button" | "badge";
  ButtonIcon?: IconType;
  buttonLabel?: string;
  buttonProps?: ButtonProps;
  badgeProps?: BadgeProps;
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

export const Dropdown = ({
  type = "button",
  buttonLabel,
  ButtonIcon,
  buttonProps,
  badgeProps,
  className,
  children,
  ...props
}: DropdownProps) => {
  const [expanded, setExpanded] = React.useState(false);
  const menuButtonId = React.useId();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // CSS anchor positioning needs a name unique to this instance, or two
  // dropdowns on one page would anchor to whichever element matched last.
  // `useId` is stable across renders and unique per component instance; its
  // delimiters aren't valid in a dashed-ident, hence the strip.
  const anchorName = React.useMemo(
    () => `--dropdown-${menuButtonId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [menuButtonId],
  );

  // React state drives the native popover.
  React.useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;
    const isOpen = popover.matches(":popover-open");
    if (expanded && !isOpen) popover.showPopover();
    else if (!expanded && isOpen) popover.hidePopover();
  }, [expanded]);

  // ...and follows it back, so anything that closes the popover outside of
  // React (a nested dialog taking the top layer, `hidePopover` from
  // elsewhere) can't leave `expanded` claiming it is still open.
  React.useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return undefined;
    const handleToggle = (event: Event) => {
      setExpanded((event as ToggleEvent).newState === "open");
    };
    popover.addEventListener("toggle", handleToggle);
    return () => popover.removeEventListener("toggle", handleToggle);
  }, []);

  // Dismissal is ours rather than `popover="auto"`'s built-in light
  // dismiss, because the trigger is a `<Button>`, which renders an `<a>`.
  // Only `<button>`/`<input>` can be a `popovertarget` invoker, so an auto
  // popover would treat its own trigger as "outside": pressing it while
  // open would light-dismiss on pointerdown and then immediately reopen on
  // click. `manual` still puts the menu in the top layer -- which is the
  // point, and why nothing here needs a z-index.
  React.useEffect(() => {
    if (!expanded) return undefined;

    // `pointerdown` rather than `click`: dismisses as soon as the press
    // starts, so the menu doesn't linger while a drag/selection is in
    // progress, and it can't be skipped by a handler further down that
    // stops the click from bubbling.
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      // The popover is in the top layer, so it is *not* inside `rootRef`
      // as far as `contains` is concerned on paint -- but it still is in
      // the DOM tree, which is what `contains` actually walks.
      if (rootRef.current?.contains(target)) return;
      setExpanded(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  // Fallback placement for browsers without CSS anchor positioning
  // (Firefox, at the time of writing). A popover is in the top layer, so
  // its containing block is the viewport and the `.anchor` wrapper can no
  // longer place it -- something has to supply coordinates. Mirrors what
  // the CSS does: below the trigger, right edges aligned, flipped above
  // when there isn't room.
  React.useEffect(() => {
    if (!expanded) return undefined;
    if (CSS.supports("anchor-name: --a")) return undefined;
    const popover = popoverRef.current;
    const anchor = anchorRef.current;
    if (!popover || !anchor) return undefined;

    const GAP = 8;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const { offsetWidth: width, offsetHeight: height } = popover;
      const below = rect.bottom + GAP;
      const fitsBelow = below + height <= window.innerHeight;
      const fitsAbove = rect.top - GAP - height >= 0;
      popover.style.setProperty(
        "--fallback-inset-block-start",
        `${!fitsBelow && fitsAbove ? rect.top - GAP - height : below}px`,
      );
      popover.style.setProperty(
        "--fallback-inset-inline-start",
        `${Math.max(GAP, Math.min(rect.right - width, window.innerWidth - width - GAP))}px`,
      );
    };

    place();
    window.addEventListener("resize", place);
    // Capture, so it also follows scrolling of any container in between.
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [expanded]);

  const buttonContents = (
    <>
      {!!ButtonIcon && <ButtonIcon />}
      {buttonLabel}
      <FaChevronDown className={styles.chevron} />
    </>
  );

  return (
    <div {...props} ref={rootRef} className={className}>
      <div
        ref={anchorRef}
        className={styles.anchor}
        style={{ "--dropdown-anchor": anchorName } as React.CSSProperties}
      >
        {type === "button" && (
          <Button
            id={menuButtonId}
            aria-expanded={expanded}
            aria-haspopup="true"
            onClick={() => setExpanded(!expanded)}
            {...buttonProps}
            // After the spread, and merged rather than replaced: a caller
            // passing `buttonProps.className` means "as well as the
            // trigger's own styling", not "instead of it".
            className={classNames(styles.trigger, buttonProps?.className)}
          >
            {buttonContents}
          </Button>
        )}
        {type === "badge" && (
          <Badge
            interactive
            aria-expanded={expanded}
            aria-haspopup="true"
            onClick={() => setExpanded(!expanded)}
            {...badgeProps}
            // After the spread, and merged rather than replaced, for the
            // same reason as the button trigger above.
            className={classNames(styles.badgeTrigger, badgeProps?.className)}
          >
            {buttonContents}
          </Badge>
        )}
        <div
          ref={popoverRef}
          popover="manual"
          className={styles.menu}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={menuButtonId}
          tabIndex={-1}
          onClick={event => {
            // Only a real item dismisses. Group headings are labels, not
            // choices -- clicking one used to close the menu, which read as
            // the click having done something when it hadn't.
            if (
              (event.target as HTMLElement).closest('[role="menuitem"]') !==
              null
            ) {
              setExpanded(false);
            }
          }}
        >
          <div role="none">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
