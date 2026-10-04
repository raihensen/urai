/** The one breakpoint the library's own components branch on in JS.
 *
 * Deliberately a single shared constant rather than a per-component
 * literal: `Modal`'s swipe-to-dismiss and `Checkbox`'s label stacking have
 * to agree with the `@media (max-width: 640px)` blocks in the stylesheets,
 * and a second copy of the number is how they drift apart.
 *
 * 640px because that is the first of the container widths in
 * `styles/layout.css`. Changing it means changing both. */
export const MOBILE_QUERY = "(max-width: 640px)";
