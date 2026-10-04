/** Black or white, whichever reads on `color`.
 *
 * Relative luminance per WCAG, not a plain average of the channels: the eye
 * is far more sensitive to green than to blue, so averaging calls a magenta
 * light and a saturated green dark -- both wrong, and both common as
 * category or user colours.
 *
 * Accepts `#rgb` and `#rrggbb`, with or without the hash. Anything else
 * (a named colour, `oklch(...)`, a custom property) can't be measured here
 * and falls back to white, which is the safer default: these colours are
 * overwhelmingly mid-to-dark saturated hues. */
export function getContrastingTextColor(color: string): "#000000" | "#ffffff" {
  const rgb = parseHexColor(color);
  if (!rgb) return "#ffffff";
  const channel = (value: number) => {
    const ratio = value / 255;
    return ratio <= 0.03928
      ? ratio / 12.92
      : Math.pow((ratio + 0.055) / 1.055, 2.4);
  };
  const luminance =
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  // 0.179 is where contrast against black and against white are equal.
  return luminance > 0.179 ? "#000000" : "#ffffff";
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** `#f0a`/`#ff00aa` -> channels, or `null` if it isn't a hex colour. */
export function parseHexColor(color: string): Rgb | null {
  const hex = color.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map(char => char + char)
          .join("")
      : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}
