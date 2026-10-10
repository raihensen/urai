import classNames from "classnames";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { MOBILE_QUERY } from "../utils/breakpoints";
import React from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

/** Downward drag past this fraction of the dialog's own height counts as a
 * dismiss swipe; released short of it springs back open. */
const DISMISS_THRESHOLD_RATIO = 0.2;
/** Total movement before a drag commits to being either the header's
 * vertical dismiss or (if `onHorizontalSwipe` is given) a horizontal one.
 * Worth matching against whatever threshold the app's own drag gestures
 * use, so the two feel like one interaction model. */
const AXIS_LOCK_PX = 10;
/** Minimum horizontal travel before a swipe fires `onHorizontalSwipe`.
 * Chosen to match a typical page-level swipe-navigation threshold, since
 * this is the in-modal counterpart of that gesture. */
const HORIZONTAL_SWIPE_MIN_DISTANCE_PX = 60;

export interface ModalProps extends React.PropsWithChildren {
  title: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  footer?: React.ReactNode;
  /** CSS length (e.g. `"700px"`, `"80vh"`). Always clamped to the viewport minus padding. */
  width?: string;
  /** Fixed height, for a dialog that should take the space it is given and
   * scroll its content inside -- rather than the default, which fits the
   * content (up to the viewport, then scrolls). */
  height?: string;
  /** Whether the dialog offers its own ways out: the close button, a click
   * on the backdrop and, on mobile, the bottom-sheet layout with its
   * swipe-down-to-dismiss handle. Default `true`.
   *
   * `false` is for a dialog that has to be answered through its footer --
   * a confirmation. It stays a small centred card on mobile too. Escape
   * still calls `close`, as the keyboard's cancel. */
  closable?: boolean;
  /** Controls that belong to the dialog as a whole rather than to any one
   * field, rendered in the header between the title and the close button.
   * Keeps them out of the form's row rhythm entirely -- see the event
   * editor's preset picker. */
  headerActions?: React.ReactNode;
  /** Mobile only: a *horizontal* drag anywhere in the modal (including the
   * header) fires this. Doesn't compete with the header's own vertical
   * swipe-to-dismiss -- each gesture commits to whichever axis it moves in
   * first, so a single drag is only ever one or the other. A vertical drag
   * that starts outside the header is left alone entirely (native scroll),
   * never treated as either kind of swipe. */
  onHorizontalSwipe?: (direction: "prev" | "next") => void;
}

/** Shared across all modals so later-opened dialogs always stack above earlier
 * ones. Starts above the highest z-index used elsewhere in the app (e.g. the
 * react-select menu portal's 9999), so a modal always wins over a dropdown
 * left open in a modal it's nested inside of. */
let nextZIndex = 10000;

export const Modal = ({
  isOpen,
  close,
  title,
  width,
  height,
  headerActions,
  onHorizontalSwipe,
  closable = true,
  ...props
}: ModalProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const [zIndex, setZIndex] = React.useState<number>();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Portal to <body> so a modal opened from within another modal's markup
  // (e.g. the color picker from an event's color field) always stacks as a
  // sibling top-layer dialog instead of a nested one, which browsers can
  // render inconsistently. Deferred to after mount since `document` isn't
  // available during SSR.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // Also re-run once `mounted` flips true: a modal that's already open on
    // its very first render (e.g. ConfirmationModal, mounted on demand with
    // isOpen already true) would otherwise find `dialogRef.current` still
    // null here, since the portaled <dialog> hasn't rendered yet.
    if (!mounted) return;
    const dialog = dialogRef.current;
    if (isOpen) {
      nextZIndex += 1;
      setZIndex(nextZIndex);
      dialog?.showModal();
      // Clear any leftover drag offset from a previous swipe-to-dismiss
      // attempt that sprang back instead of closing (see the effect below).
      if (dialog) dialog.style.transform = "";
    } else {
      dialog?.close();
    }
    // Close on cleanup so React's Strict Mode double-invoke (mount, cleanup,
    // mount again) doesn't call `showModal()` on an already-open dialog,
    // which throws and aborts the rest of the effect.
    return () => {
      dialog?.close();
    };
  }, [isOpen, mounted]);

  // Mobile-only. Two gestures share this one pointer stream, mutually
  // exclusive per-drag: dragging the header down closes the dialog (a
  // short tap/click still reaches `close` on the CSS-hidden-on-mobile
  // close button, unaffected by this) once past `DISMISS_THRESHOLD_RATIO`
  // of the dialog's own height -- released short of that springs back
  // open, unchanged from before. Dragging *horizontally*, anywhere in the
  // dialog (including the header), instead fires `onHorizontalSwipe` once
  // past `HORIZONTAL_SWIPE_MIN_DISTANCE_PX`, if provided. Which one (if
  // either) a given drag means is decided once, after `AXIS_LOCK_PX` of
  // movement, from whichever axis moved further -- and only vertical
  // drags that *started in the header* are eligible for dismiss; a
  // vertical drag starting anywhere else is left alone entirely (native
  // scroll), never treated as a swipe of either kind.
  //
  // Native Pointer Events (not separate mouse/touch listeners): a single
  // unified stream, and no need to worry about implicit touch capture
  // here since the dialog/header elements themselves never get removed/
  // replaced mid-gesture the way a virtualised grid's cells can. It also
  // stops native touchmove/touchend from reaching `document` while a
  // horizontal drag is in progress -- otherwise an app's own page-level
  // swipe navigation (also listening on `document`) would react to the
  // same gesture and page the content behind the modal.
  React.useEffect(() => {
    if (!isMobile) return undefined;
    // Nothing to do without either gesture: no dismiss swipe on a dialog
    // that isn't closable, and no horizontal one without a handler.
    if (!closable && !onHorizontalSwipe) return undefined;
    const header = headerRef.current;
    const dialog = dialogRef.current;
    if (!header || !dialog) return undefined;

    let start: { x: number; y: number } | null = null;
    let axis: "horizontal" | "vertical" | null = null;
    let startedInHeader = false;
    // Set once a drag is confirmed horizontal, cleared only at the start of
    // the *next* gesture (`handlePointerDown`) -- unlike `axis`, which
    // `finishDrag` clears immediately on `pointerup`. Touch's own
    // `touchend` (what `stopIfHorizontal` below needs to suppress) fires
    // *after* `pointerup` for the same release, by which point `axis`
    // would already read `null` again, so `stopIfHorizontal` was never
    // actually suppressing it -- letting the app's own page-level
    // `touchend` listener also fire for the same gesture.
    let wasHorizontal = false;

    const handlePointerDown = (event: PointerEvent) => {
      start = { x: event.clientX, y: event.clientY };
      axis = null;
      wasHorizontal = false;
      startedInHeader = header.contains(event.target as Node);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!start) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;

      if (axis === null) {
        if (Math.hypot(deltaX, deltaY) < AXIS_LOCK_PX) return;
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        if (!isHorizontal && (!startedInHeader || !closable)) {
          // A plain scroll, starting outside the header -- not our
          // gesture at all, leave it to the browser.
          start = null;
          return;
        }
        axis = isHorizontal ? "horizontal" : "vertical";
        if (axis === "horizontal") wasHorizontal = true;
        if (axis === "vertical") dialog.style.transition = "none";
      }

      if (axis === "vertical") {
        dialog.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
      }
    };
    const finishDrag = (event: PointerEvent) => {
      if (!start) return;
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const finishedAxis = axis;
      start = null;
      axis = null;

      if (finishedAxis === "vertical") {
        dialog.style.transition = "";
        if (
          deltaY >
          dialog.getBoundingClientRect().height * DISMISS_THRESHOLD_RATIO
        ) {
          close();
        } else {
          dialog.style.transform = "";
        }
      } else if (finishedAxis === "horizontal" && onHorizontalSwipe) {
        if (Math.abs(deltaX) > HORIZONTAL_SWIPE_MIN_DISTANCE_PX) {
          onHorizontalSwipe(deltaX < 0 ? "next" : "prev");
        }
      }
    };

    dialog.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", finishDrag);
    document.addEventListener("pointercancel", finishDrag);
    // Capture phase, for the same reason any global drag listener wants
    // it: it has to run regardless of what stops propagation
    // further down, and only actually calls `stopPropagation()` once a
    // drag on this dialog has been confirmed horizontal (`wasHorizontal`,
    // not the live `axis` -- see its own comment above).
    const stopIfHorizontal = (event: TouchEvent) => {
      if (wasHorizontal) event.stopPropagation();
    };
    document.addEventListener("touchmove", stopIfHorizontal, {
      capture: true,
    });
    document.addEventListener("touchend", stopIfHorizontal, {
      capture: true,
    });
    return () => {
      dialog.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", finishDrag);
      document.removeEventListener("pointercancel", finishDrag);
      document.removeEventListener("touchmove", stopIfHorizontal, {
        capture: true,
      });
      document.removeEventListener("touchend", stopIfHorizontal, {
        capture: true,
      });
    };
  }, [isMobile, close, onHorizontalSwipe, closable]);

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={classNames(styles.modal, !closable && styles.centered)}
      style={
        {
          zIndex,
          ...(width && { "--modal-width": width }),
          ...(height && { "--modal-height": height }),
        } as React.CSSProperties
      }
      onCancel={close}
      // Native `<dialog>`'s `::backdrop` isn't part of its own content box,
      // but a click that lands there still targets the `<dialog>` element
      // itself (nothing else is there to receive it) -- a click on any
      // actual content inside instead targets that descendant, leaving
      // `currentTarget` (the dialog) and `target` unequal.
      onClick={event => {
        if (closable && event.target === event.currentTarget) close();
      }}
    >
      <div className={styles.panel}>
        <div ref={headerRef} className={styles.header}>
          {closable && <div className={styles.handle} />}
          <h2 className={styles.title}>{title}</h2>
          {!!headerActions && (
            <div className={styles.headerActions}>{headerActions}</div>
          )}
          {closable && (
            <button className={styles.closeButton} onClick={close}>
              &times;
            </button>
          )}
        </div>
        <div className={styles.content}>{props.children}</div>
        {props.footer && <div className={styles.footer}>{props.footer}</div>}
      </div>
    </dialog>,
    document.body,
  );
};
