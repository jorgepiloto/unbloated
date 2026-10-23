const { defineConfig, devices } = require("@playwright/test");
const path = require("path");

const DOCS_DIR = path.resolve(__dirname, "../../doc/_build/html");

module.exports = defineConfig({
  testDir: ".",
  timeout: 30_000,
  retries: 0,

  use: {
    baseURL: "http://localhost:5000",
  },

  webServer: {
    command: `python3 -m http.server 5000 --directory ${DOCS_DIR}`,
    url: "http://localhost:5000",
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
