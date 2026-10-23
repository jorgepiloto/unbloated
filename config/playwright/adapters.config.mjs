// SPDX-License-Identifier: LGPL-3.0-only
/** Real Sphinx and Quarto consumers. Prepare bundles and install builders first. */
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { root } from "../../scripts/build.mjs";
export default defineConfig({
  testDir: fileURLToPath(new URL("tests/adapter-browser/", root)),
  outputDir: fileURLToPath(new URL(".cache/test-results/adapters/", root)),
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" },
});
