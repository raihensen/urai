import { Diagram } from "../../src";
import { Row, Section } from "../Layout";

const hours = (value: number) => `${value} h`;

export const Diagrams = () => (
  <Section
    title="Diagram"
    description="Pies for the share of a whole, at a glance. Colours come from a fixed,
      colour-blind-checked palette in data order, or per entry via `color`.
      Past `maxSlices` (6) the rest folds into a neutral Other slice. A legend
      with values is always shown, up to four slices also carry their
      percentage, and screen readers get a hidden table. Hover a slice for
      its tooltip."
  >
    <Row label="palette">
      <Diagram
        type="pie"
        title="Woche"
        formatValue={hours}
        data={[
          { label: "Arbeit", value: 40 },
          { label: "Schlaf", value: 56 },
          { label: "Freizeit", value: 30 },
        ]}
      />
    </Row>
    <Row label="donut, own colours">
      <Diagram
        type="pie"
        donut
        title="Status"
        data={[
          { label: "Fertig", value: 12, color: "#16a34a" },
          { label: "Offen", value: 5, color: "#a3a3a3" },
          { label: "Blockiert", value: 2, color: "#dc2626" },
        ]}
      />
    </Row>
    <Row label="folded into Other">
      <Diagram
        type="pie"
        title="Ausgaben"
        formatValue={value => `${value} €`}
        otherLabel="Sonstiges"
        data={[
          { label: "Miete", value: 900 },
          { label: "Lebensmittel", value: 380 },
          { label: "Mobilität", value: 160 },
          { label: "Versicherung", value: 120 },
          { label: "Freizeit", value: 110 },
          { label: "Kleidung", value: 60 },
          { label: "Bücher", value: 25 },
          { label: "Spenden", value: 20 },
        ]}
      />
    </Row>
  </Section>
);
