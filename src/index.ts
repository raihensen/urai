/* urai -- the public surface.
 *
 * Grouped the way the README documents them. Everything reachable from here
 * is API; anything not re-exported is free to change.
 *
 * Note what is *not* here: no `ThemeProvider`, and nothing importing from
 * `next/*`. Theming is the CSS custom properties in `styles/tokens.css`,
 * and the library is framework-agnostic on purpose -- see the README. */

/* -- Primitives ----------------------------------------------------- */

export type { BadgeProps, BadgeVariant } from "./badge/Badge";
export { Badge } from "./badge/Badge";
export type { ButtonProps, ButtonShape } from "./button/Button";
export { Button } from "./button/Button";
export type { DropdownProps } from "./dropdown/Dropdown";
export { Dropdown } from "./dropdown/Dropdown";
export type { MenuItemProps, MenuProps } from "./menu/Menu";
export { Menu, MenuHeading, MenuItem } from "./menu/Menu";
export type {
  TooltipPlacement,
  TooltipProp,
  TooltipProps,
  TooltipTouchBehavior,
  UseTooltipOptions,
} from "./tooltip/Tooltip";
export { Tooltip, useTooltip } from "./tooltip/Tooltip";

/* -- Diagrams ------------------------------------------------------- */

export type { DiagramDatum, DiagramProps } from "./diagram/Diagram";
export { DIAGRAM_PALETTE_SIZE, Diagram, diagramColor } from "./diagram/Diagram";

/* -- Overlays ------------------------------------------------------- */

export type { ModalProps } from "./modal/Modal";
export { Modal } from "./modal/Modal";

export type {
  ChoiceOption,
  ConfirmationModalProps,
} from "./confirmation/ConfirmationModal";
export { ConfirmationModal } from "./confirmation/ConfirmationModal";
export type {
  ChooseFunction,
  ChooseOptions,
  ConfirmFunction,
  ConfirmOptions,
} from "./confirmation/ConfirmProvider";
export {
  ConfirmContext,
  ConfirmProvider,
  useChoose,
  useConfirm,
} from "./confirmation/ConfirmProvider";

/* -- Form inputs ---------------------------------------------------- */

export type { FormProps } from "./form/Form";
export { Form } from "./form/Form";

export type { CheckboxProps } from "./inputs/Checkbox";
export { Checkbox } from "./inputs/Checkbox";
export { InputLabel } from "./inputs/InputLabel";
export type { NumberInputProps } from "./inputs/NumberInput";
export { NumberInput } from "./inputs/NumberInput";
export type { TextInputProps } from "./inputs/TextInput";
export { TextInput } from "./inputs/TextInput";
export type { DefaultValue, InputProps, InputValue } from "./inputs/useInput";
export { useInput } from "./inputs/useInput";

/* -- Temporal ------------------------------------------------------- */

export type { FormatDateRangeOptions } from "./temporal/dateRange";
export { formatDateRange, getDateRangeLength } from "./temporal/dateRange";
export type { DateRangeLabelProps } from "./temporal/DateRangeLabel";
export { DateRangeLabel } from "./temporal/DateRangeLabel";
export type { DateSegmentGroupProps } from "./temporal/DateSegmentGroup";
export { DateSegmentGroup } from "./temporal/DateSegmentGroup";
export type { PlainDateInputProps } from "./temporal/PlainDateInput";
export { PlainDateInput } from "./temporal/PlainDateInput";
export type { PlainDateTimeInputProps } from "./temporal/PlainDateTimeInput";
export {
  PlainDateTimeInput,
  toDatetimeLocalString,
} from "./temporal/PlainDateTimeInput";
export type { TemporalInputProps } from "./temporal/TemporalInput";
export { TemporalInput } from "./temporal/TemporalInput";
export type { DateSegment, DateSegmentType } from "./temporal/useDateSegments";
export { DATE_SEGMENT_MAX, useDateSegments } from "./temporal/useDateSegments";

/* -- Hooks and utilities -------------------------------------------- */

export { useLocales } from "./hooks/useLocales";
export { useMediaQuery } from "./hooks/useMediaQuery";
export { MOBILE_QUERY } from "./utils/breakpoints";
export type { Rgb } from "./utils/color";
export { getContrastingTextColor, parseHexColor } from "./utils/color";
