# Tool Configuration

Run tooling through the root npm scripts so each tool loads its configuration:

| File                             | Used By                                           |
| -------------------------------- | ------------------------------------------------- |
| `pre-commit.yaml`                | `npm run hooks:install` and `npm run hooks:check` |
| `gitleaks.toml`                  | The Gitleaks hook in `pre-commit.yaml`            |
| `prettierignore`                 | `npm run format` and `npm run format:check`       |
| `playwright/browser.config.mjs`  | `npm run test:browser`                            |
| `playwright/docs.config.mjs`     | `npm run test:docs`                               |
| `playwright/adapters.config.mjs` | `npm run test:adapter-browser`                    |
| `playwright/projects.config.mjs` | `npm run test:project-docs`                       |

After updating an existing checkout, run `npm run hooks:install` again. Installed
Git hooks store their config path and need the new `config/pre-commit.yaml` path.
Pre-commit must be installed separately as described in
[Contributing](../CONTRIBUTING.md).

Prettier exclusions resolve relative to `config/prettierignore`. The npm scripts
also load `.gitignore`. Configure editor integrations to use this ignore file;
for the VS Code Prettier extension, set `prettier.ignorePath` to
`config/prettierignore` in your workspace settings.

Playwright resolves test directories, output directories, and preview-server
working directories from the repository root. Reports and traces go to
`.cache/test-results/<suite>/`. Adapter distributions go to `.cache/artifacts/`.
For optional HTML reports, set
`PLAYWRIGHT_HTML_OUTPUT_DIR=.cache/playwright-report` when using
`--reporter=html`. For ad hoc Ruff runs, set `RUFF_CACHE_DIR=.cache/ruff`.

The root `.editorconfig`, `.gitignore`, `.npmrc`, and `.nvmrc` remain in place
for automatic discovery by editors, Git, npm, and Node version managers.
`eslint.config.mjs` and `biome.json` also retain their standard locations so
editor integrations can discover them without extra settings.
