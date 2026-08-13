/**
 * @file vitest.config.ts
 * @description Configuration file for Vitest unit testing framework.
 * Configures the testing environment (Node.js), enables global variables,
 * and sets up path alias resolving for source code directories.
 */

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
