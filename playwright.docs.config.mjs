// SPDX-License-Identifier: LGPL-3.0-only
/** Check the built MkDocs site and its examples in Chromium. Build docs first. */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/docs",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run docs:preview",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
  },
});
