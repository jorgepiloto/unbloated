// SPDX-License-Identifier: LGPL-3.0-only
/** Check the Hugo site and its examples in Chromium. Build docs first. */
import { docsArtifact } from "../../scripts/docs-artifact.mjs";
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { root } from "../../scripts/build.mjs";

const { prefix } = await docsArtifact();

export default defineConfig({
  testDir: fileURLToPath(new URL("tests/docs/", root)),
  outputDir: fileURLToPath(new URL(".cache/test-results/docs/", root)),
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
    cwd: fileURLToPath(root),
    command: "node scripts/serve-docs.mjs",
    url: `http://127.0.0.1:4174${prefix}`,
    reuseExistingServer: false,
  },
});
