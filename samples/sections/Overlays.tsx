import React from "react";
import { FaEllipsis, FaGithub, FaWandMagicSparkles } from "react-icons/fa6";
import {
  Badge,
  Button,
  Dropdown,
  Menu,
  MenuHeading,
  MenuItem,
  Modal,
  Tooltip,
  useChoose,
  useConfirm,
} from "../../src";
import { Row, Section } from "../Layout";

export const Tooltips = () => (
  <Section
    title="Tooltip"
    description="Anchored with CSS anchor positioning and promoted to the top layer, so
      it needs no z-index and cannot be clipped by an ancestor's overflow. The
      arrow points at the side the tooltip actually landed on, which is read
      back from layout -- a tooltip flipped to fit still points the right way.
      On touch, each use picks its own behaviour: long-press, tap, or nothing."
  >
    <Row label="placement">
      {(
        ["block-start", "block-end", "inline-start", "inline-end"] as const
      ).map(placement => (
        <Tooltip
          key={placement}
          popover={`Placed at ${placement}. Flips when there is no room.`}
          placement={placement}
        >
          <Button alpha>{placement}</Button>
        </Tooltip>
      ))}
    </Row>
    <Row label="touch behaviour">
      <Badge tooltip="A tap toggles this one -- safe, since the badge does nothing else.">
        tap
      </Badge>
      <Button tooltip="Long press to read this: a tap would press the button.">
        long-press
      </Button>
      <Tooltip popover="Never shown on touch at all." touch="hide">
        <Button alpha>hide</Button>
      </Tooltip>
    </Row>
    <Row label="built into props">
      {/* Anything mixing in `TooltipProp` takes these three directly, rather
          than making the call site wrap it. */}
      <Button
        tooltip="Passed as a prop, not a wrapper."
        tooltipPlacement="inline-end"
      >
        tooltip prop
      </Button>
    </Row>
  </Section>
);

export const Dropdowns = () => (
  <Section
    title="Dropdown"
    description="A menu anchored to its own trigger, as a manual popover. Dismissal is
      handled here rather than by the browser's light dismiss, because the
      trigger is an anchor and so an auto popover would treat it as outside
      itself -- pressing it while open would close and immediately reopen.
      Browsers without anchor positioning get coordinates from JS."
  >
    <Row label='type="button"'>
      <Dropdown
        ButtonIcon={FaGithub}
        buttonLabel="Repositories"
        buttonProps={{ alpha: true }}
      >
        {["urai", "portfolio", "myhass"].map(repo => (
          <a
            key={repo}
            role="menuitem"
            tabIndex={-1}
            href={`https://github.com/raihensen/${repo}`}
            target="_blank"
          >
            raihensen/{repo}
          </a>
        ))}
      </Dropdown>
      <Dropdown
        ButtonIcon={FaWandMagicSparkles}
        buttonLabel="Preset"
        buttonProps={{ primary: true }}
      >
        {["Standup", "Lunch", "Gym"].map(preset => (
          <a
            key={preset}
            role="menuitem"
            tabIndex={-1}
            onClick={e => e.preventDefault()}
          >
            {preset}
          </a>
        ))}
      </Dropdown>
    </Row>
    <Row label='type="badge"'>
      <Dropdown
        type="badge"
        buttonLabel="Status"
        badgeProps={{ color: "#0a84ff" }}
      >
        {["Open", "In progress", "Done"].map(status => (
          <a
            key={status}
            role="menuitem"
            tabIndex={-1}
            onClick={e => e.preventDefault()}
          >
            {status}
          </a>
        ))}
      </Dropdown>
    </Row>
  </Section>
);

export const Menus = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <Section
      title="Menu"
      description="A full-height side sheet with its own backdrop -- the mobile-first
        counterpart to Dropdown. Items reach `close` through context, so a
        plain MenuItem dismisses on click without the call site wiring
        anything; `keepOpenOnClick` opts out, for a toggle you may want to
        press twice."
    >
      <Row label="open">
        <Button primary onClick={() => setOpen(true)}>
          <FaEllipsis />
        </Button>
        <span className="value">{open ? "open" : "closed"}</span>
      </Row>
      {open && (
        <Menu close={() => setOpen(false)}>
          <MenuHeading>View</MenuHeading>
          <MenuItem
            text="Columns"
            selected
            onClick={() => undefined}
            keepOpenOnClick
          />
          <MenuItem text="Grid" onClick={() => undefined} keepOpenOnClick />
          <MenuItem separator />
          <MenuHeading>Actions</MenuHeading>
          <MenuItem text="Dismisses on click" onClick={() => undefined} />
          <MenuItem
            text="Disabled, with a reason"
            disabled
            tooltip="Shown greyed out rather than hidden, so the option does not appear and disappear between states."
          />
          <MenuItem text="External link" href="https://example.com" />
        </Menu>
      )}
    </Section>
  );
};

export const Modals = () => {
  const [open, setOpen] = React.useState(false);
  const confirm = useConfirm();
  const choose = useChoose();
  const [result, setResult] = React.useState<string>("--");

  return (
    <Section
      title="Modal, ConfirmProvider"
      description="Modal is a native dialog portaled to the body, so dialogs opened from
        inside other dialogs stack as siblings. On a phone it becomes a bottom
        sheet you can swipe down to dismiss -- and a horizontal drag is passed
        through as a swipe instead, each gesture committing to one axis.
        useConfirm / useChoose turn a dialog into an awaited value."
    >
      <Row label="Modal">
        <Button onClick={() => setOpen(true)}>Open</Button>
      </Row>
      <Row label="useConfirm">
        <Button
          danger
          onClick={async () => {
            const ok = await confirm({
              title: "Delete this?",
              description: "This cannot be undone.",
              confirmText: "Delete",
            });
            setResult(ok ? "confirmed" : "cancelled");
          }}
        >
          Confirm
        </Button>
      </Row>
      <Row label="useChoose">
        <Button
          onClick={async () => {
            const choice = await choose({
              title: "Edit recurring event",
              description: "Which occurrences should this change apply to?",
              choices: [
                { value: "one", label: "This event only", primary: true },
                { value: "following", label: "This and all following events" },
                { value: "all", label: "All events in the series" },
              ],
            });
            setResult(choice ?? "cancelled");
          }}
        >
          Choose
        </Button>
        <span className="value">last answer: {result}</span>
      </Row>
      <Modal
        isOpen={open}
        close={() => setOpen(false)}
        title="A dialog"
        headerActions={<Badge color="#0a84ff">headerActions</Badge>}
        footer={
          <>
            <Button primary onClick={() => setOpen(false)}>
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </>
        }
      >
        <p>
          Header, scrolling content and footer are separate slots, so the footer
          stays put while the content scrolls.
        </p>
        <p style={{ marginBlockStart: "0.75rem", color: "var(--gray-700)" }}>
          On a narrow viewport this is a bottom sheet: drag the header down to
          dismiss it.
        </p>
      </Modal>
    </Section>
  );
};
