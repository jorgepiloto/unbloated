// SPDX-License-Identifier: LGPL-3.0-only
/** Test the allowlisted reference server in desktop and mobile browser projects. */
import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import { root } from "../../scripts/build.mjs";

export default defineConfig({
  testDir: fileURLToPath(new URL("tests/browser/", root)),
  outputDir: fileURLToPath(new URL(".cache/test-results/browser/", root)),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: {
    cwd: fileURLToPath(root),
    command: "node scripts/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
});
