import React from "react";
import { Checkbox, Form, NumberInput, TextInput } from "../../src";
import { Section } from "../Layout";

export const Inputs = () => {
  const [title, setTitle] = React.useState<string | null>("Standup");
  const [duration, setDuration] = React.useState<number | null>(15);
  const [capacity, setCapacity] = React.useState<number | null>(null);
  const [allDay, setAllDay] = React.useState(false);
  const [notes, setNotes] = React.useState<string | null>(null);

  return (
    <Section
      title="Form inputs"
      description="Each input renders a label and a control as two siblings with no wrapper
        between them, and `Form` lines them up in a label/field grid. With
        `columns={2}` it fits two fields per row once it is wide enough,
        filled in order; `fullRow` gives a field a row of its own (`Notes`
        below). Narrow the window to see one pair per row, then label above
        field. Values are
        `T | null` rather than empty strings: a cleared optional field is
        absent, not blank. Give one a `defaultValue` and the label grows a
        checkbox that toggles it between that value and null -- `capacity`
        below starts off."
    >
      <Form columns={2}>
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
        <TextInput label="Notes" value={notes} onChange={setNotes} fullRow />
      </Form>
      <div className="value">
        {JSON.stringify({ title, duration, capacity, allDay, notes })}
      </div>
    </Section>
  );
};
