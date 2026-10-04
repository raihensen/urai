import { FaCircleCheck, FaPlane, FaTriangleExclamation } from "react-icons/fa6";
import { Badge, getContrastingTextColor } from "../../src";
import { Row, Section } from "../Layout";

/** Deliberately spans light and dark hues: the label colour in the `solid`
 * variant is computed per-swatch, so this row is also the test that
 * `getContrastingTextColor` picks the readable one each time. */
const COLORS = ["#ff9500", "#ff2d95", "#0a84ff", "#34c759", "#f5e663"];

export const Badges = () => (
  <Section
    title="Badge"
    description="A label about its surroundings rather than something to press, so it is
      a span and inert by default. Given a hex colour it computes a readable
      label colour by WCAG relative luminance -- note the yellow swatch below
      flipping to black text while the others stay white."
  >
    <Row label="variant">
      <Badge variant="soft">soft (default)</Badge>
      <Badge variant="solid">solid</Badge>
      <Badge variant="outline">outline</Badge>
    </Row>
    <Row label="size">
      <Badge>medium</Badge>
      <Badge size="small">small</Badge>
    </Row>
    <Row label="with icon">
      <Badge icon={FaCircleCheck} color="#34c759">
        Approved
      </Badge>
      <Badge icon={FaTriangleExclamation} color="#ff9500" variant="solid">
        Pending
      </Badge>
      <Badge icon={FaPlane} color="#0a84ff" variant="outline">
        Away
      </Badge>
    </Row>
    <Row label="solid + contrast">
      <span className="swatches">
        {COLORS.map(color => (
          <Badge
            key={color}
            color={color}
            variant="solid"
            tooltip={`${color} -> ${getContrastingTextColor(color)}`}
          >
            {color}
          </Badge>
        ))}
      </span>
    </Row>
    <Row label="soft + colour">
      <span className="swatches">
        {COLORS.map(color => (
          <Badge key={color} color={color}>
            {color}
          </Badge>
        ))}
      </span>
    </Row>
  </Section>
);
