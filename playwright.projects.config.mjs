// SPDX-License-Identifier: LGPL-3.0-only
/** Validate existing project artifacts without rebuilding their sources. */
import { defineConfig, devices } from "@playwright/test";
import { docsArtifact } from "./scripts/docs-artifact.mjs";
const { prefix } = await docsArtifact();
export default defineConfig({
  testDir: "./tests/project-docs",
  workers: 1,
  timeout: 120_000,
  forbidOnly: Boolean(process.env.CI),
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
