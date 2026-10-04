import React from "react";
import { Checkbox, NumberInput, TextInput } from "../../src";
import { Section } from "../Layout";

export const Inputs = () => {
  const [title, setTitle] = React.useState<string | null>("Standup");
  const [duration, setDuration] = React.useState<number | null>(15);
  const [capacity, setCapacity] = React.useState<number | null>(null);
  const [allDay, setAllDay] = React.useState(false);

  return (
    <Section
      title="Form inputs"
      description="Each input renders a label and a control as two siblings with no wrapper
        between them, so the app's own form grid lines every field up -- the
        two-column grid below is the page's, not the component's. Values are
        `T | null` rather than empty strings: a cleared optional field is
        absent, not blank. Give one a `defaultValue` and the label grows a
        checkbox that toggles it between that value and null -- `capacity`
        below starts off."
    >
      <div className="form">
        <TextInput label="Title" value={title} onChange={setTitle} />
        <NumberInput
          label="Duration (min)"
          value={duration}
          onChange={setDuration}
          min={0}
          step={15}
        />
        <NumberInput
          label="Capacity"
          value={capacity}
          onChange={setCapacity}
          defaultValue={10}
          min={1}
        />
        <Checkbox label="All day" checked={allDay} onChange={setAllDay} />
        <TextInput
          label="Disabled"
          value="Not editable"
          onChange={() => undefined}
          disabled
        />
      </div>
      <div className="value">
        {JSON.stringify({ title, duration, capacity, allDay })}
      </div>
    </Section>
  );
};
