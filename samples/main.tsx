import React from "react";
import { createRoot } from "react-dom/client";
import { ConfirmProvider } from "../src";
// The library's stylesheet, exactly as a consuming app imports it (there it
// would be `import "urai/styles.css"`).
import "../src/styles/urai.css";
import { App } from "./App";
import "./samples.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* `useConfirm` needs this above anything that calls it, so the gallery
        wraps everything -- the same thing an app does at its root. */}
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </React.StrictMode>,
);
