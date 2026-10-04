import { FaArrowRight, FaGear, FaTrash } from "react-icons/fa6";
import { Button } from "../../src";
import { Row, Section } from "../Layout";

export const Buttons = () => (
  <Section
    title="Button"
    description="Renders an anchor, not a button element -- so it is equally the link
      primitive. Intent (primary / secondary / danger), weight (link / alpha)
      and shape are separate axes, and a button whose only child is an
      element is detected as icon-only and squared off automatically."
  >
    <Row label="intent">
      <Button>Default</Button>
      <Button primary>Primary</Button>
      <Button secondary>Secondary</Button>
      <Button danger>Danger</Button>
    </Row>
    <Row label="weight">
      <Button link>link</Button>
      <Button alpha>alpha</Button>
      <Button large>large</Button>
    </Row>
    <Row label="shape">
      <Button shape="rounded">rounded</Button>
      <Button shape="circle">circle (pill)</Button>
      <Button shape="sharp">sharp</Button>
    </Row>
    <Row label="icon-only">
      {/* No `iconOnly` prop passed: a single element child is detected. */}
      <Button tooltip="Settings">
        <FaGear />
      </Button>
      <Button shape="circle" tooltip="Delete" danger>
        <FaTrash />
      </Button>
      <Button primary>
        Continue <FaArrowRight />
      </Button>
    </Row>
    <Row label="disabled">
      <Button disabled>Default</Button>
      <Button primary disabled>
        Primary
      </Button>
    </Row>
    <Row label="as a link">
      <Button href="https://github.com/rhensen" target="_blank" alpha>
        Opens a URL
      </Button>
    </Row>
  </Section>
);
