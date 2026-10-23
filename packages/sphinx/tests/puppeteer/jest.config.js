const path = require("path");

module.exports = {
  rootDir: path.resolve(__dirname, "../../"),
  roots: ["<rootDir>/tests/puppeteer"],
  testMatch: ["<rootDir>/tests/puppeteer/**/*.test.js"],
  testEnvironment: "node",
  testTimeout: 30_000,
  testPathIgnorePatterns: ["/node_modules/", "/.venv/"],
  watchPathIgnorePatterns: ["/.venv/"],
  modulePathIgnorePatterns: ["/.venv/"],
  globalSetup: "<rootDir>/tests/puppeteer/setup.js",
  globalTeardown: "<rootDir>/tests/puppeteer/teardown.js",
};
