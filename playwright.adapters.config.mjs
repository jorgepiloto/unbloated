// SPDX-License-Identifier: LGPL-3.0-only
/** Real Sphinx and Quarto consumers. Prepare bundles and install builders first. */
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/adapter-browser",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  use: { ...devices["Desktop Chrome"], trace: "retain-on-failure" },
});
