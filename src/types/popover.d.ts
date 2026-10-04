import "react";

/** `@types/react` 18 predates the Popover API, so JSX doesn't know these
 * attributes yet. `HTMLElement.showPopover`/`hidePopover` and the
 * `:popover-open` selector are already in `lib.dom`, so only the JSX side
 * needs filling in.
 *
 * Referenced explicitly (`/// <reference path>`) by `Tooltip.tsx` and
 * `Dropdown.tsx` rather than left to be picked up from the `include` list:
 * a consuming app compiles these files out of `node_modules`, which its own
 * tsconfig does not scan, so nothing else would load this augmentation
 * there. */
declare module "react" {
  /* eslint-disable @typescript-eslint/no-unused-vars --
   * `T` has to be declared to match the interface being augmented, even
   * though nothing added here uses it. */
  interface HTMLAttributes<T> {
    /** `"auto"` opts into light dismiss (outside click + Escape) and
     * closes other auto popovers; `"manual"` leaves dismissal entirely to
     * the page. Either way the element is promoted to the top layer. */
    popover?: "auto" | "manual" | "";
    popoverTarget?: string;
    popoverTargetAction?: "toggle" | "show" | "hide";
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
