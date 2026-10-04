import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Config for the *samples* app only -- urai itself is not bundled.
 *
 * The package ships TypeScript source and lets the consumer compile it (see
 * the README's "Consuming" section), so there is no library build step here
 * and nothing to keep in sync with one. Vite is a dev dependency purely to
 * run the gallery. */
export default defineConfig({
  root: "samples",
  plugins: [react()],
  server: {
    port: 5273,
    open: true,
  },
  build: {
    outDir: "../dist-samples",
    emptyOutDir: true,
  },
});
