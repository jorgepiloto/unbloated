---
title: Source Reference
---

The repository keeps design values, semantic styles, optional components, and
site adapters in separate files. The library build uses only Node.js built-ins.
Documentation uses Hugo; the npm package still contains no runtime dependencies.

## Source Files

| File                   | Responsibility                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/tokens.json`      | Canonical color, font, line-height, heading, spacing, border, shadow, and focus values                |
| `src/base.css`         | Semantic element styles, native control states, keyboard focus, media sizing, and forced-color rules  |
| `src/components.css`   | The six optional `unbloat-` appearance classes                                                        |
| `scripts/build.mjs`    | Token validation, CSS and Sass generation, output checks, and reproducibility checks                  |
| `scripts/serve.mjs`    | Loopback reference server with fixed routes and restrictive response headers                          |
| `scripts/docs.mjs`     | Documentation asset preparation, verified Hugo setup, builds, and local servers                       |
| `examples/index.html`  | Reference markup for manual inspection and library browser tests                                      |
| `examples/example.css` | Reference-page layout and skip-link adapter                                                           |
| `docs/layouts/`        | Hugo page shell, navigation, Markdown links, headings, and version footer                             |
| `docs/assets/site.css` | Centered page, black masthead, navigation buttons, prose styles, preview spacing, and table scrolling |
| `docs/assets/tabs.js`  | Example tab selection, keyboard focus, and panel visibility                                           |

Each source module has an inline description. Exported build and documentation
functions document their inputs, return values, side effects, and errors.
The [Components](../components/_index.md) pages describe the CSS selectors and
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

`prepareDocs()` also writes the package version and description to
`docs/data/package.json`. Hugo fingerprints the CSS and tab script, so asset URLs
change when their contents change. The footer displays the package version.

`setupHugo()` installs the locked Linux x64 or arm64 binary into `.cache/hugo/`.
It fetches the official release archive, verifies the committed SHA-256, and
extracts only `hugo`. Download, checksum, and extraction failures propagate.
Other platforms use a manually installed binary.

`runDocs(mode, extraArgs)` accepts `setup`, `build`, `serve`, or `preview`.
Setup installs Hugo. The other modes validate the Hugo version and prepare the
stylesheet and package data. Build writes `site/` and treats warnings as failures.
Serve and preview run Hugo's loopback server on ports 8000 and 4174. Serve watches
Markdown and adapter assets with live reload; preview disables watching and live
reload. Restart either command after changing shared CSS or tokens.

The function returns the child process exit code, or 1 when terminated. It
rejects unsupported modes, version mismatches, and process-start errors.
`HUGO_BIN` overrides the executable; otherwise the runner uses `.cache/hugo/hugo`,
then Hugo on PATH. Commands use argument arrays without a shell. Additional
arguments pass through to Hugo, including a deployment base URL:

```sh
npm run docs:build -- --baseURL https://example.org/unbloated/
```

The link render hook resolves Markdown file links to Hugo pages and rejects
missing pages or heading fragments. Heading IDs remain available for links;
headings have no permalink controls. Trusted repository HTML is enabled for
live examples, and syntax highlighting adds no inline colors.

The tab adapter in `docs/assets/tabs.js` applies automatic activation to the
documentation's marked tablist. It updates `aria-selected`, the focusable tab,
and panel visibility together. Click, Left Arrow, Right Arrow, Home, and End
change the active tab. See [Tabs](../components/tabs.md) for the markup contract.

## Repository Configuration

| File                                            | Responsibility                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `package.json` and `package-lock.json`          | Package exports, published files, npm scripts, and exact development dependencies            |
| `.npmrc` and `.nvmrc`                           | Disable implicit lifecycle scripts and select the Node.js development version                |
| `.editorconfig` and `.prettierignore`           | Text conventions and formatter exclusions                                                    |
| `eslint.config.mjs`                             | Recommended JavaScript checks, Node and browser globals, and dynamic-evaluation restrictions |
| `biome.json`                                    | CSS lint rules for shared styles, examples, and documentation adapters                       |
| `.pre-commit-config.yaml`                       | File checks, formatting, linting, workflow validation, secret scans, builds, and push audits |
| `.gitleaks.toml`                                | Default secret-detection rules with dependency and generated-output exclusions               |
| `docs/hugo.yaml`                                | Hugo settings, output, trusted HTML, and code rendering                                      |
| `docs/data/social.json`                         | Header social destinations, accessible names, and local icon selection                       |
| `docs/static/licenses/font-awesome-LICENSE.txt` | Attribution and license for the documentation icons                                          |
| `docs/data/navigation.yaml`                     | Main sections, overview pages, and child-page links                                          |
| `docs/hugo-lock.json`                           | Hugo version and verified Linux release archive checksums                                    |
| `playwright.config.mjs`                         | Library browser projects and the reference server                                            |
| `playwright.docs.config.mjs`                    | Documentation browser checks and the built-site preview server                               |
| `.github/workflows/`                            | Pull-request checks, daily checks, package builds, and tag-triggered publication             |
| `.github/dependabot.yml`                        | Dependency updates and seven-day cooldowns                                                   |
| `.github/CODEOWNERS`                            | Repository review ownership                                                                  |
| `.gitignore`                                    | Generated CSS, tarballs, test output, documentation output, and local environments           |

## Verification

| Command                                            | What It Checks                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run format:check`                             | Prettier formatting for supported source and documentation files                          |
| `npm run lint`                                     | JavaScript and CSS linting, including documentation adapters                              |
| `npm run build:check`                              | Token validation and independent reproducible builds                                      |
| `npm test`                                         | Build output, unsafe tokens, source-only packaging, exports, licenses, Sass, and contrast |
| `npm run test:browser`                             | Library styling, focus, native controls, mobile layout, and reference-server routes       |
| `npm run docs:build`                               | Hugo build, warnings, navigation, internal links, and heading references                  |
| `npm run test:docs`                                | Built-site navigation, live component styles, tab keyboard behavior, and narrow layouts   |
| `pre-commit run --all-files`                       | Commit-stage file, style, workflow, secret, and build checks                              |
| `pre-commit run --all-files --hook-stage pre-push` | Push-stage file checks and npm dependency audit                                           |

Library unit tests live in `tests/build.test.mjs` and `tests/package.test.mjs`.
Library browser tests live in `tests/browser/style.spec.mjs`. Documentation
browser tests live in `tests/docs/site.spec.mjs`. Run `npm run build` before
library tests and `npm run docs:build` before documentation browser tests.

## Change the Documentation

The Hugo templates and site stylesheet follow the layout of `web`: a centered
white page on a gray background, a black masthead and footer, and square
navigation links. The header includes the Email, GitHub, LinkedIn, YouTube, and
RSS links from `web`, configured in `docs/data/social.json`. Their local SVG
icons retain Font Awesome attribution; the generated site includes the license
in `licenses/font-awesome-LICENSE.txt`.

Navigation follows `sphinx-theme`: section overviews show their child buttons
below the title. Child pages show a linked parent title and sibling buttons
above the page heading, with the current page highlighted. A Back to link
returns to the section overview, or Home from an overview. The markup works
without JavaScript. Prose headings use uppercase black labels; these
overrides exclude the live component previews, which use the library's styles.

Each page has one `h1` from its front matter title. Start Markdown sections
with `##` and nest subsections without skipping levels. Heading sizes use
the matching library tokens from `h1` through `h6`. Parent navigation labels
are smaller than the page title, and inline code inherits the heading's size
and contrast.

Edit Markdown in `docs/content/`. Keep source comments, token tables, and component
examples consistent with behavior changes. Run `npm run docs:build` to catch
broken links and missing anchors, then `npm run test:docs` to check the live
examples. The build writes `site/`; deploy that directory with your static host.

To update Hugo, change `docs/hugo-lock.json` with the version and checksums from
the official release, run `npm run docs:setup`, and update the documented version.
Use the same Hugo version locally and in CI. The template and layout adapter
load the current library build; component previews retain the shared styles.
