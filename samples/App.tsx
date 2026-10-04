import React from "react";
import { FaCircleHalfStroke, FaMoon, FaSun } from "react-icons/fa6";
import { Button } from "../src";
import { Badges } from "./sections/Badges";
import { Buttons } from "./sections/Buttons";
import { Inputs } from "./sections/Inputs";
import { Dropdowns, Menus, Modals, Tooltips } from "./sections/Overlays";
import { TemporalSamples } from "./sections/TemporalSamples";

type Mode = "system" | "light" | "dark";
const NEXT: Record<Mode, Mode> = {
  system: "dark",
  dark: "light",
  light: "system",
};
const ICON = { system: FaCircleHalfStroke, dark: FaMoon, light: FaSun };

/** The whole of theming, in a dozen lines and with no dependency.
 *
 * `tokens.css` keys dark mode off `data-theme="dark"` on the root element,
 * and falls back to `prefers-color-scheme` only while the attribute is
 * absent -- which is exactly what `"system"` does here by removing it. An
 * app with `next-themes` gets the same contract from
 * `<ThemeProvider attribute="data-theme">` instead; this is here to show the
 * library needs nothing more than the attribute. */
const useTheme = () => {
  const [mode, setMode] = React.useState<Mode>("system");
  React.useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
  }, [mode]);
  return { mode, cycle: () => setMode(current => NEXT[current]) };
};

export const App = () => {
  const { mode, cycle } = useTheme();
  const Icon = ICON[mode];

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>urai</h1>
        <Button
          className="themeToggle"
          onClick={cycle}
          tooltip={`Theme: ${mode}. Click to cycle.`}
          alpha
        >
          <Icon />
        </Button>
      </header>
      <p className="pageIntro">
        Every component below is styled only through the custom properties in{" "}
        <code>styles/tokens.css</code>. Switch the theme to see that there is no
        second set of colours hiding anywhere -- and narrow the window past
        640px to see the responsive behaviour, which is where Modal and Checkbox
        change shape.
      </p>

      <Buttons />
      <Badges />
      <Tooltips />
      <Dropdowns />
      <Menus />
      <Modals />
      <Inputs />
      <TemporalSamples />
    </main>
  );
};
