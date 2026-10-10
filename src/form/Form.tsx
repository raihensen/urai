import classNames from "classnames";
import React from "react";
import styles from "./Form.module.css";

export interface FormProps extends React.HTMLAttributes<HTMLDivElement> {
  /** How many label/field pairs share a row once the form is wide enough.
   *
   * With `2`, fields fill the two slots of each row in source order; a field
   * given `fullRow` starts a row of its own and takes all of it. Below the
   * width that fits two pairs, the form falls back to one pair per row, and
   * on mobile to label-above-field -- see `Form.module.css`. */
  columns?: 1 | 2;
}

/** The label/field grid every input in `inputs/` renders into.
 *
 * A `div`, not a `<form>`: it is layout only, and the caller usually
 * already has a `<form>` around it (a nested one would be invalid HTML).
 *
 * There is no registration of fields with this component. Each input marks
 * its own label (see `InputLabel`'s `data-urai-full-row`), and grid
 * auto-placement assigns slots in DOM order -- which is the order fields
 * would register in anyway, including fields rendered conditionally. */
export const Form = ({
  columns = 1,
  className,
  children,
  ...props
}: FormProps) => (
  <div className={styles.container}>
    <div
      {...props}
      className={classNames(
        styles.form,
        { [styles.twoColumns]: columns === 2 },
        className,
      )}
    >
      {children}
    </div>
  </div>
);
