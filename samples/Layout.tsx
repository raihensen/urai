import React from "react";

/** One titled group of examples. `description` is the part worth reading:
 * it says what the component is for and what the trade-off was, which is
 * the thing a gallery of screenshots can't tell you. */
export const Section = ({
  title,
  description,
  children,
}: React.PropsWithChildren<{ title: string; description?: string }>) => (
  <section className="section">
    <h2>{title}</h2>
    {!!description && <p>{description}</p>}
    {children}
  </section>
);

/** One example, labelled with the prop combination it shows. */
export const Row = ({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) => (
  <div className="row">
    <span className="rowLabel">{label}</span>
    {children}
  </div>
);
