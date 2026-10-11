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
    ".venv-docs/",
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
      "docs/assets/*.js",
    ],
    languageOptions: { globals: globals.browser },
  },
]);
