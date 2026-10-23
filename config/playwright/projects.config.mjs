// SPDX-License-Identifier: LGPL-3.0-only
/** Validate existing project artifacts without rebuilding their sources. */
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { root } from "../../scripts/build.mjs";
import { docsArtifact } from "../../scripts/docs-artifact.mjs";
const { prefix } = await docsArtifact();
export default defineConfig({
  testDir: fileURLToPath(new URL("tests/project-docs/", root)),
  outputDir: fileURLToPath(new URL(".cache/test-results/projects/", root)),
  workers: 1,
  timeout: 120_000,
  forbidOnly: Boolean(process.env.CI),
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
