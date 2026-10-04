# urai

Personal, reusable React components: buttons, badges, menus, modals, form
inputs, and Temporal-based date rendering.

No build step, no CSS-in-JS, no theme context. Components are plain `.tsx`
with CSS modules, styled entirely through CSS custom properties, and the
consumer compiles them.

```tsx
import { Badge, Button, Modal } from "urai";
import "urai/styles.css";
```

## Contents

### Primitives

| Export                            | What it is                                                                                                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                          | Renders an `<a>`, so it is equally the link primitive. Intent (`primary`/`secondary`/`danger`), weight (`link`/`alpha`/`large`) and `shape` are independent axes. A single element child is detected as icon-only and squared off. |
| `Badge`                           | A label, not a control: a `<span>`, inert unless `interactive`. Given a hex `color`, computes a readable label colour for the `solid` variant. Variants `soft` (default) / `solid` / `outline`.                                    |
| `Dropdown`                        | A menu anchored to its own trigger (`type="button"` or `"badge"`), in the top layer via the Popover API.                                                                                                                           |
| `Menu`, `MenuItem`, `MenuHeading` | Full-height side sheet with a backdrop — the touch-first counterpart to `Dropdown`. Items reach `close` through context.                                                                                                           |
| `Tooltip`, `useTooltip`           | CSS-anchor-positioned, top-layer, with an arrow that points at the side it actually landed on. Per-use touch behaviour: `long-press` / `tap` / `hide`.                                                                             |
| `TooltipProp`                     | Mix into a component's props to give it a built-in tooltip rather than making every call site wrap it. `Button` and `Badge` both do.                                                                                               |

### Overlays

| Export              | What it is                                                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Modal`             | Native `<dialog>`, portaled to `<body>` so nested dialogs stack as siblings. On mobile it becomes a bottom sheet: swipe the header down to dismiss, or pass `onHorizontalSwipe` for a sideways gesture. Slots: `title`, `headerActions`, children, `footer`. |
| `ConfirmProvider`   | Mount once at the app root.                                                                                                                                                                                                                                  |
| `useConfirm`        | `await confirm({ title, description })` → `boolean`.                                                                                                                                                                                                         |
| `useChoose`         | The same dialog with more than two answers → the chosen `value`, or `null`.                                                                                                                                                                                  |
| `ConfirmationModal` | The dialog itself, if you want to drive it directly.                                                                                                                                                                                                         |

### Form inputs

`TextInput`, `NumberInput`, `Checkbox`, `InputLabel`, `useInput`.

Each renders **a label and a control as two siblings, with no wrapper
between them**, so the app's own form grid lines every field up. That is the
one thing to know before using them:

```css
.form {
  display: grid;
  grid-template-columns: 10rem 1fr;
}
```

Values are `T | null`, not `""` — a cleared optional field is absent, not
blank. Give a field a `defaultValue` and its label grows a checkbox that
toggles the value between that default and `null`.

### Temporal

Temporal values throughout. No `Date`, and no string dates in any prop.

| Export                                 | What it is                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DateSegmentGroup`, `useDateSegments`  | A `dd.mm.yyyy` display whose segments are individually keyboard-editable: arrows step, digits type and auto-advance. Segment **order and separators come from the locale**, so the same component reads `mm/dd/yyyy` for `en-US`. Display only — compose it into a field with whatever trigger you want. |
| `PlainDateInput`, `PlainDateTimeInput` | Native `<input type="date">` / `datetime-local`, converted at the boundary.                                                                                                                                                                                                                              |
| `TemporalInput`                        | Picks between those two on a `type` prop.                                                                                                                                                                                                                                                                |
| `formatDateRange`, `DateRangeLabel`    | One date range, said the way a person would: `04.08. – 07.08.2026` becomes `4.–7. August 2026`. Every part comes from `Intl`, so order, punctuation and month names follow the locale.                                                                                                                   |
| `getDateRangeLength`                   | Inclusive day count.                                                                                                                                                                                                                                                                                     |

### Hooks and utilities

`useMediaQuery` (SSR-safe), `useLocales`, `MOBILE_QUERY`,
`getContrastingTextColor` (WCAG relative luminance, not a channel average),
`parseHexColor`.

## Theming

**There is no `ThemeProvider`, and there does not need to be one.** Every
component is styled exclusively in terms of the custom properties in
[`src/styles/tokens.css`](src/styles/tokens.css) — that file _is_ the
theming API. Redefine a token and everything using it follows, with no
context, no re-render and no JavaScript.

Dark mode is selected by `data-theme="dark"` on the root element. Nothing in
the library writes that attribute; it only reads it. So:

- **With `next-themes`:** `<ThemeProvider attribute="data-theme">`. Done.
- **With nothing:** set the attribute yourself. The whole implementation is
  the dozen lines of `useTheme` in [`samples/App.tsx`](samples/App.tsx).
- **With neither:** `tokens.css` falls back to `prefers-color-scheme` while
  the attribute is absent, so the library looks right in a plain page.

A library-side `ThemeProvider` would be a dependency on one framework's
theme storage plus a context that re-renders the tree, in exchange for
nothing the cascade isn't already doing.

### Stylesheets

`urai/styles.css` is everything, in cascade order. Take it in parts if you
already have a reset:

| File         | Contents                          | Required?                                                     |
| ------------ | --------------------------------- | ------------------------------------------------------------- |
| `tokens.css` | The design tokens, light and dark | **Yes** — components reference these by name                  |
| `reset.css`  | A minimal Preflight replacement   | Recommended; each rule notes what depends on it               |
| `base.css`   | Bare `a`, `input`, `body`         | Recommended — `input` is what gives the form inputs their box |
| `layout.css` | The `.container` width utility    | Optional                                                      |

To override a token, define it _after_ importing:

```css
@import "urai/styles.css";

:root {
  --primary: #0fac54;
}
```

Overriding `--foreground` means overriding `--foreground-rgb` too: the whole
`--gray-alpha-*` ramp is built from the channels.

## Dependencies vs. peer dependencies

The short version: **if two copies would break something, it's a peer.**

A peer dependency says "you install this, and I'll use yours." A regular
dependency says "I'll bring my own." The difference only matters for
packages where _having two copies is a bug_ — and for a library, that is
almost always about shared state or shared identity:

- **`react`, `react-dom` — peers.** Two Reacts means two independent hook
  dispatchers and two separate context registries. Hooks throw outright
  ("invalid hook call"), and a context provided by the app is invisible to a
  consumer inside the library.
- **`temporal-polyfill` — peer.** `Temporal.PlainDate` appears in the public
  API, and `instanceof` compares against the _class object_. Across two
  copies it quietly returns `false`, so a date the app constructed fails
  every check inside the library. Worse than a crash, because nothing
  reports it.
- **`react-icons` — peer.** `IconType` is part of the public API, and there
  is no reason to ship a second copy of an icon set the app already has.
- **`classnames` — a regular dependency.** A pure string function: no state,
  no identity, nothing to share. Two copies would be wasteful (it is tiny)
  but never _wrong_, so there is no reason to make it the consumer's
  problem.

Peers are also listed in `devDependencies` here. That is not a contradiction
and not duplication: `peerDependencies` declares what a consumer must
supply, and `devDependencies` is how _this_ checkout gets a copy to
typecheck against and run the samples with. Consumers never install a
library's devDependencies.

## Samples

A plain Vite page, one section per component. No Storybook — the whole point
is that each section is a few lines of ordinary JSX you can read beside the
component.

```sh
yarn install
yarn samples      # http://localhost:5273, opens automatically
```

`yarn dev` is an alias for it. Sections live in
[`samples/sections/`](samples/sections/); to add one, drop a file there and
render it from [`samples/App.tsx`](samples/App.tsx).

What the gallery is for, beyond looking at things:

- The **theme toggle** (top right) cycles system → dark → light, which is
  how you check that a change works in both themes.
- **Narrowing the window past 640px** is how you check the responsive
  behaviour — `Modal` becomes a swipeable bottom sheet and `Checkbox`
  restacks.
- The **locale row** under Temporal renders the same date for `de-DE`,
  `en-US` and `ja-JP` side by side.

Vite is a devDependency used only for this. The library itself is never
bundled.

## Consuming

urai ships TypeScript source and CSS modules; the consumer compiles them.
There is no `dist`, so nothing can be stale and CSS modules keep working
normally.

In a Next.js app, from a sibling checkout:

```jsonc
// package.json
"dependencies": {
  "urai": "link:../../urai"   // path is relative to the *consumer*
}
```

```ts
// next.config.ts
transpilePackages: ["urai"],
```

Then import `urai/styles.css` once, at the root.

Because the link is a symlink into a checkout that has its own
`node_modules`, the peer dependencies need pinning to the app's copies in
**two** places — bundler and TypeScript. The consuming repo's
`next.config.ts` and `tsconfig.json` each carry a comment explaining it; in
short:

- `resolve.alias` for `temporal-polyfill` and `react-icons`. **Not** for
  `react`/`react-dom` — Next aliases those to its own precompiled builds to
  select the `react-server` build for server components, and overriding
  that breaks the RSC build outright (`React.cache is not a function`).
- `compilerOptions.paths` for all of them, `react` included: two copies of
  `@types/react` give two nominally distinct `ReactNode`s, and then every
  component boundary between app and library fails to typecheck.

Published to a registry instead, both problems disappear — the peers would
resolve from the consumer's own tree like any other package.

## Checks

```sh
yarn typecheck      # tsc --noEmit, library + samples
yarn format         # prettier
yarn build:samples  # proves the gallery still builds
```
