# Source Reference

The repository keeps design values, semantic styles, optional components, and
site adapters in separate files. The library build uses only Node.js built-ins.
Documentation uses MkDocs; the npm package still contains no runtime dependencies.

## Source Files

| File                   | Responsibility                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/tokens.json`      | Canonical color, font, line-height, heading, spacing, border, shadow, and focus values               |
| `src/base.css`         | Semantic element styles, native control states, keyboard focus, media sizing, and forced-color rules |
| `src/components.css`   | The six optional `unbloat-` appearance classes                                                       |
| `scripts/build.mjs`    | Token validation, CSS and Sass generation, output checks, and reproducibility checks                 |
| `scripts/serve.mjs`    | Loopback reference server with fixed routes and restrictive response headers                         |
| `scripts/docs.mjs`     | Documentation asset preparation, Python selection, strict builds, and local servers                  |
| `examples/index.html`  | Reference markup for manual inspection and library browser tests                                     |
| `examples/example.css` | Reference-page layout and skip-link adapter                                                          |
| `docs/theme/main.html` | MkDocs page template, navigation, relative asset links, and footer                                   |
| `docs/assets/site.css` | Documentation layout, responsive navigation, preview spacing, and table scrolling                    |
| `docs/assets/tabs.js`  | Example tab selection, keyboard focus, and panel visibility                                          |

Each source module has an inline description. Exported build and documentation
functions document their inputs, return values, side effects, and errors.
The [Components](../components/index.md) pages describe the CSS selectors and
their states, and [Design Tokens](tokens.md) documents the JSON schema and defaults.

## Build API

Import build functions from `scripts/build.mjs`. Importing the module does not
write files.

```js
import { build, checkBuild, render, validateTokens } from "./scripts/build.mjs";

await build();
await checkBuild();
const files = await render();
```

### `root`

A `URL` pointing to the repository root. Build paths resolve relative to this
URL, so generation does not depend on the shell's working directory.

### `validateTokens(tokens)`

Accepts parsed JSON and returns the same object after validation. It requires
the eight supported groups, safe token names and values, and a zero border
radius. It throws when a constraint fails. It does not clone the input or write
files. See [Validation Rules](tokens.md#validation-rules).

### `render()`

Reads the canonical JSON and both CSS sources. It returns a
`Promise<Map<string, string>>` with `tokens.css`, `_tokens.scss`, `base.css`,
`components.css`, and `unbloat.css`. Every output includes the license banner.
Unknown `unbloat-` token references in the shared CSS cause an error. Source-read
and validation errors propagate to the caller. The function does not write files.

### `build({ directory } = {})`

Writes the rendered files into `directory`, which defaults to `dist/`. It
creates the directory if needed. After writing, it rejects any unexpected file
in the output directory. It returns `Promise<void>`; validation, read, write,
and output-check errors propagate to the caller.

```js
await build({ directory: "/tmp/unbloated-output" });
```

### `checkBuild()`

Builds twice in independent temporary directories and compares filenames and
contents byte for byte. It returns `Promise<void>` and removes the temporary
directory in a `finally` block. It throws if outputs differ or a build fails.
It does not require or update an existing `dist/`.

The CLI accepts `node scripts/build.mjs` to write the distribution and
`node scripts/build.mjs --check` to check reproducibility. Other arguments fail.

## Reference Server

`scripts/serve.mjs` binds to `127.0.0.1:4173`. It serves the reference page,
its adapter stylesheet, and the four generated CSS files. Root and example-page
aliases keep relative stylesheet links valid. Requests never become filesystem
paths; a fixed route map resolves them.

Only GET and HEAD are accepted. Unknown routes and other methods return 404.
File-read failures return 500. Responses include `X-Content-Type-Options:
nosniff` and a Content Security Policy that permits local styles and denies
scripts, framing, and form submission. SIGINT and SIGTERM close the listener.

## Documentation Runner

`prepareDocs()` builds the library and copies `dist/unbloat.css` to
`docs/assets/unbloat.css`. It returns `Promise<void>` and propagates filesystem
and build errors. The copy is generated and ignored by Git.

`runDocs(mode)` accepts `build`, `serve`, or `preview`. Build and serve prepare
the stylesheet before running MkDocs with strict validation. Preview serves
the existing `site/` directory using Python's HTTP server. The servers bind to
loopback at ports 8000 and 4174, respectively. The function returns the child
process exit code, or 1 when it is terminated, and rejects unsupported modes
or process-start errors.

Python selection checks `DOCS_PYTHON`, then `.venv-docs`, then Python on PATH.
Commands are passed as arguments to `spawn` without a shell. Install the locked
requirements as shown in [Prerequisites](../getting-started/prerequisites.md).

The tab adapter in `docs/assets/tabs.js` applies automatic activation to the
documentation's marked tablist. It updates `aria-selected`, the focusable tab,
and panel visibility together. Click, Left Arrow, Right Arrow, Home, and End
change the active tab. See [Tabs](../components/tabs.md) for the markup contract.

## Repository Configuration

| File                                               | Responsibility                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `package.json` and `package-lock.json`             | Package exports, published files, npm scripts, and exact development dependencies               |
| `.npmrc` and `.nvmrc`                              | Disable implicit lifecycle scripts and select the Node.js development version                   |
| `.editorconfig` and `.prettierignore`              | Text conventions and formatter exclusions                                                       |
| `eslint.config.mjs`                                | Recommended JavaScript checks, Node and browser globals, and dynamic-evaluation restrictions    |
| `biome.json`                                       | CSS lint rules for shared styles, examples, and documentation adapters                          |
| `.pre-commit-config.yaml`                          | File checks, formatting, linting, workflow validation, secret scans, builds, and push audits    |
| `.gitleaks.toml`                                   | Default secret-detection rules with dependency and generated-output exclusions                  |
| `mkdocs.yml`                                       | Site navigation, custom theme, Markdown extensions, relative assets, and strict link validation |
| `docs/requirements.in` and `docs/requirements.txt` | MkDocs input requirement and the dependency lock with package hashes                            |
| `playwright.config.mjs`                            | Library browser projects and the reference server                                               |
| `playwright.docs.config.mjs`                       | Documentation browser checks and the built-site preview server                                  |
| `.github/workflows/`                               | Pull-request checks, daily checks, package builds, and tag-triggered publication                |
| `.github/dependabot.yml`                           | Dependency updates and seven-day cooldowns                                                      |
| `.github/CODEOWNERS`                               | Repository review ownership                                                                     |
| `.gitignore`                                       | Generated CSS, tarballs, test output, documentation output, and local environments              |

## Verification

| Command                                            | What It Checks                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run format:check`                             | Prettier formatting for supported source and documentation files                          |
| `npm run lint`                                     | JavaScript and CSS linting, including documentation adapters                              |
| `npm run build:check`                              | Token validation and independent reproducible builds                                      |
| `npm test`                                         | Build output, unsafe tokens, source-only packaging, exports, licenses, Sass, and contrast |
| `npm run test:browser`                             | Library styling, focus, native controls, mobile layout, and reference-server routes       |
| `npm run docs:build`                               | Strict MkDocs build, navigation, internal links, and anchors                              |
| `npm run test:docs`                                | Built-site navigation, live component styles, tab keyboard behavior, and narrow layouts   |
| `pre-commit run --all-files`                       | Commit-stage file, style, workflow, secret, and build checks                              |
| `pre-commit run --all-files --hook-stage pre-push` | Push-stage file checks and npm dependency audit                                           |

Library unit tests live in `tests/build.test.mjs` and `tests/package.test.mjs`.
Library browser tests live in `tests/browser/style.spec.mjs`. Documentation
browser tests live in `tests/docs/site.spec.mjs`. Run `npm run build` before
library tests and `npm run docs:build` before documentation browser tests.

## Change the Documentation

Edit Markdown in `docs/`. Keep source comments, token tables, and component
examples consistent with behavior changes. Run `npm run docs:build` to catch
broken links and missing anchors, then `npm run test:docs` to check the live
examples. The build writes `site/`; deploy that directory with your static host.

To update documentation dependencies, edit `docs/requirements.in` and regenerate
the lock with `uv pip compile --generate-hashes --no-header --no-annotate
--universal --python-version 3.12 --output-file docs/requirements.txt
docs/requirements.in`. Install it again with `--require-hashes` and rebuild.
