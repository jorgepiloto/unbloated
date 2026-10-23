// SPDX-License-Identifier: LGPL-3.0-only
/** Lint source and test JavaScript with recommended checks and no dynamic eval. */
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores([
    "dist/",
    "node_modules/",
    "playwright-report/",
    "test-results/",
    "coverage/",
    "site/",
    ".cache/",
    "docs/resources/",
    ".venv*/",
    "packages/sphinx/tests/",
    "packages/sphinx/.tox/",
    "packages/sphinx/doc/_build/",
    "packages/sphinx/dist/",
  ]),
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
  {
    files: [
      "tests/browser/**/*.mjs",
      "tests/docs/**/*.mjs",
      "tests/adapter-browser/**/*.mjs",
      "docs/assets/*.js",
      "packages/hugo/assets/js/*.js",
      "packages/hugo/static/js/*.js",
      "packages/sphinx/src/**/static/js/*.js",
    ],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["packages/hugo/static/js/search.js"],
    languageOptions: {
      globals: { Fuse: "readonly", Mark: "readonly" },
    },
  },
]);
