// SPDX-License-Identifier: LGPL-3.0-only
/** Check the Hugo site and its examples in Chromium. Build docs first. */
import { docsArtifact } from "./scripts/docs-artifact.mjs";
import { defineConfig, devices } from "@playwright/test";

const { prefix } = await docsArtifact();

export default defineConfig({
  testDir: "./tests/docs",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:4174${prefix}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve-docs.mjs",
    url: `http://127.0.0.1:4174${prefix}`,
    reuseExistingServer: false,
  },
});
