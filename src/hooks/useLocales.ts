import React from "react";

export function useLocales() {
  const [locales, setLocales] = React.useState<Intl.LocalesArgument>("de-DE");

  React.useEffect(() => {
    if (window) {
      setLocales(window.navigator.language);
    }
  }, []);

  return locales;
}
