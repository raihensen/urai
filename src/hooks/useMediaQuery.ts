import React from "react";

/** Tracks whether `query` currently matches, via `window.matchMedia`.
 * SSR-safe: returns `false` until mounted, then stays in sync with a
 * `change` listener. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handleChange = () => setMatches(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
