---
title: Source Reference
---

The repository keeps design values, semantic styles, optional components, and
site adapters in separate files. The library build uses only Node.js built-ins.
Documentation uses Hugo; the npm package still contains no runtime dependencies.

The independently installable adapters live in `packages/sphinx`,
`packages/quarto`, and `packages/hugo`. `scripts/adapters.mjs` stages and checks
the exact core CSS, version metadata, digest, and license notices.
`scripts/adapter-styles.mjs` enforces style ownership without reading the token
source. `scripts/pack-adapters.mjs` packages verified bundles, and
`scripts/check-adapter-artifacts.py` checks the assets inside the distributions.

Run `npm run build:adapters` to build the core and prepare adapters, then
`npm run check:adapters` to detect stale or modified bundles. These scripts
propagate missing-file, style-contract, and packaging errors. Importing
`prepareAdapters({ directory, check })` or `packAdapters({ directory })` has
no build side effects; both default to this checkout and return `Promise<void>`.

## Source Files

| File                                 | Responsibility                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/tokens.json`                    | Canonical color, font, line-height, heading, spacing, border, shadow, and focus values                |
| `src/base.css`                       | Semantic element styles, native control states, keyboard focus, media sizing, and forced-color rules  |
| `src/components.css`                 | The six optional `unbloat-` appearance classes                                                        |
| `scripts/build.mjs`                  | Token validation, CSS and Sass generation, output checks, and reproducibility checks                  |
| `scripts/serve.mjs`                  | Loopback reference server with fixed routes and restrictive response headers                          |
| `scripts/project-docs.mjs`           | Per-project dev/stable builds, native Sphinx sources, package guide sites, and artifact manifests     |
| `scripts/docs.mjs`                   | Documentation asset preparation, verified Hugo setup, builds, and local servers                       |
| `scripts/latex-tokens.mjs`           | Validated CSS-to-TeX token translation, length mapping, and core digest for the LaTeX adapter         |
| `scripts/adapters.mjs`               | Exact adapter CSS, core provenance, and license staging/checking                                      |
| `scripts/adapter-styles.mjs`         | Ownership validation for authored CSS, compiled SCSS, and template styles                             |
| `scripts/pack-adapters.mjs`          | Verified wheel, source distribution, Quarto/LaTeX archives, and Hugo tarball creation                 |
| `scripts/check-adapter-artifacts.py` | Read-only validation of core bytes, provenance, and licenses inside all five archives                 |
| `scripts/docs-artifact.mjs`          | Existing static artifact directory and deployment-prefix discovery                                    |
| `scripts/serve-docs.mjs`             | Loopback serving of an existing artifact without rebuilding it                                        |
| `examples/index.html`                | Reference markup for manual inspection and library browser tests                                      |
| `examples/example.css`               | Reference-page layout and skip-link adapter                                                           |
| `docs/layouts/`                      | Hugo page shell, navigation, Markdown links, headings, and version footer                             |
| `docs/assets/site.css`               | Centered page, black masthead, navigation buttons, prose styles, preview spacing, and table scrolling |
| `docs/assets/tabs.js`                | Example tab selection, keyboard focus, and panel visibility                                           |

The [Components](../components/_index.md) pages describe the CSS selectors and
their states, and [Design Tokens](tokens.md) documents the JSON schema and defaults.

Each adapter has its own documentation project, registered in `docs/projects.json`.
`npm run docs:project -- <project> <dev|stable>` builds a publishable artifact;
`DOCS_ARTIFACT_DIR=.cache/project-docs/<project>/<channel> npm run test:project-docs`
validates its prefix, links, downloads, bundled core, and layout without rebuilding.
See [Release Setup](../releasing.md#configure-documentation-deployment) for destinations.

## Adapter APIs and Packages

All JavaScript build modules can be imported without running their CLI entry
points. Async operations propagate validation, filesystem, or subprocess errors
unless the HTTP handler converts them into responses.

| API                                               | Contract                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prepareAdapters({ directory, check } = {})`      | Returns `Promise<void>`. Reads the current core build, validates adapter styles and references, and stages CSS/provenance/notices. `check: true` compares existing files without writing. |
| `assertAdapterStyle(source, { from, core } = {})` | Returns `undefined` or throws a source-labelled PostCSS error. Rejects independent design values and core overrides. Optional built `core` text enables undefined-variable checks.        |
| `checkAdapterStyles({ directory, core } = {})`    | Returns `Promise<void>`. Reads authored adapter styles, compiles SCSS in memory, and checks inline template declarations. It skips generated core copies and writes no sources.           |
| `renderLatexTokens(css)`                          | Returns generated `unbloated-tokens.sty` as a string from the built core CSS. Validates the token block before emitting TeX. No filesystem side effects.                                  |
| `packAdapters({ directory } = {})`                | Returns `Promise<void>`. Checks bundles before invoking tar, npm, and Python. Writes five distributions to `.artifacts/`; a later failure can leave earlier archives in place.            |

The adapter `directory` arguments default to this checkout's root and accept
directory URLs with trailing slashes. `adapters.mjs` also exports `root` and an
`adapters` map containing each platform's relative CSS asset directory.
The ownership checker is a contributor check, not a CSS sandbox or accessibility
certification. See the repository's `scripts/README.md` for CLI and environment
contracts.

`pack-adapters.mjs` requires tar, npm, and Python with the `build` frontend. Set
`PYTHON` to an absolute executable path when selecting a virtual environment:
Python packaging runs from `packages/sphinx`. The archive checker uses only
Python's standard library. It requires exactly one distribution of each supported
type under `.artifacts/`; remove old versions before validating a new set.

| Package           | Source and Consumer Contract                                                                                                                                                                                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/sphinx` | Python theme entry point, toctree navigation, Jinja templates, AutoAPI summaries, and version-feed enhancement. Requires Python 3.12 and Sphinx 9.0 or newer. `get_autoapi_templates_dir()` returns the installed template path; `setup(app)` registers the theme and returns Sphinx extension metadata.                                      |
| `packages/hugo`   | Go layouts, shortcodes, search, metadata, discovery rules, and CSS processing. Requires Hugo Extended 0.144.1 or newer and a host PostCSS toolchain. Its README lists site parameters, every shortcode input, and optional CDN scripts.                                                                                                       |
| `packages/quarto` | Reveal.js format manifest, SCSS layout, native footer include, and a slide gallery. Its README covers local installation, generated assets, image limits, and output verification.                                                                                                                                                            |
| `packages/latex`  | LuaLaTeX adapter with generated CSS-derived TeX styles, exact core CSS, provenance, licenses, an example, and compilation checks. Its README documents TeX dependencies, inherited book options, theorem environments, listings, and build limits. Its class applies translated core colors, typography, spacing, heading sizes, and borders. |

All adapters use generated core bundles; consuming projects do not need Node
at runtime. LaTeX loads its generated TeX style, with mappings documented in
its package guide. Adapter versions remain independent from the core
version in provenance. The current Quarto archive filename uses the core version;
read `_extension.yml` for its extension version. The monorepo workflows upload
adapter packages without automatically publishing them to registries.

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
Malformed URLs return 400 and the server continues handling requests.
File-read failures return 500. Responses include `X-Content-Type-Options:
nosniff` and a Content Security Policy that permits local styles and denies
scripts, framing, and form submission. SIGINT and SIGTERM close the listener.

`handlePreviewRequest(request, response)` accepts Node's incoming request and
server response and returns `Promise<void>`. Importing it does not open a socket.

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

`npm run test:docs` serves the existing `site/` artifact with
`scripts/serve-docs.mjs`, without Hugo or source generation. It infers the deployment
prefix from the built core stylesheet URL and serves files only under that prefix.
`DOCS_ARTIFACT_DIR` selects another downloaded artifact directory. Both stable and
versioned release artifacts are checked; `docs:preview` remains a source preview.
The static server accepts GET/HEAD, returns 400 for malformed URLs and 404 for
missing/outside-prefix paths, and preserves the uploaded bytes.

`docsArtifact(artifactDirectory?)` returns
`Promise<{ directory: URL, prefix: string }>`; its argument defaults to
`DOCS_ARTIFACT_DIR` or `site` and resolves relative to the caller's working
directory. Missing HTML or a missing fingerprinted core stylesheet reference
rejects the promise. It does not check or regenerate source files.

`documentationHandler({ directory, prefix })` returns an async Node HTTP request
listener for trusted local artifact output without opening a socket. It preserves
GET/HEAD bytes under that prefix, returns 404 for other methods or missing paths,
and returns 500 for other file-read errors. It sends `nosniff` without the reference
server's script-blocking CSP.

The tab adapter in `docs/assets/tabs.js` applies automatic activation to the
documentation's marked tablist. It updates `aria-selected`, the focusable tab,
and panel visibility together after validating all panels and registering handlers.
Both panels remain visible if enhancement is unavailable. Click, Left Arrow, Right Arrow, Home, and End
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
| `playwright.adapters.config.mjs`                | Real-core Sphinx and Quarto consumer browser checks                                          |
| `.github/workflows/`                            | Pull-request checks, daily checks, package builds, and tag-triggered publication             |
| `.github/dependabot.yml`                        | Dependency updates and seven-day cooldowns                                                   |
| `.github/CODEOWNERS`                            | Repository review ownership                                                                  |
| `.gitignore`                                    | Generated CSS, tarballs, test output, documentation output, and local environments           |

## Verification

| Command                                            | What It Checks                                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run format:check`                             | Prettier formatting for supported source and documentation files                             |
| `npm run lint`                                     | JavaScript and CSS linting, including documentation adapters                                 |
| `npm run build:check`                              | Token validation and independent reproducible builds                                         |
| `npm test`                                         | Build output, unsafe tokens, source-only packaging, exports, licenses, Sass, and contrast    |
| `npm run test:browser`                             | Library styling, focus, native controls, mobile layout, and reference-server routes          |
| `npm run docs:build`                               | Hugo build, warnings, navigation, internal links, and heading references                     |
| `npm run test:docs`                                | Built-site navigation, live component styles, tab keyboard behavior, and narrow layouts      |
| `npm run build:adapters`                           | Core generation, ownership validation, and adapter staging                                   |
| `npm run check:adapters`                           | Exact CSS bytes, provenance, licenses, and known core references                             |
| `npm run test:adapters`                            | Bundle contracts and real distribution builders in isolated fixtures                         |
| `npm run pack:adapters`                            | Validated adapter archives in `.artifacts/`                                                  |
| `python3 scripts/check-adapter-artifacts.py`       | Exact bundled bytes and metadata inside all five archives                                    |
| `npm run test:adapter-browser`                     | Generated Sphinx and Quarto consumers; requires their builders, staged bundles, and browsers |
| `pre-commit run --all-files`                       | Commit-stage file, style, workflow, secret, and build checks                                 |
| `pre-commit run --all-files --hook-stage pre-push` | Push-stage file checks and npm dependency audit                                              |

Library unit tests live in `tests/build.test.mjs` and `tests/package.test.mjs`.
Library browser tests live in `tests/browser/style.spec.mjs`. Documentation
browser tests live in `tests/docs/site.spec.mjs`. Run `npm run build` before
library tests and `npm run docs:build` before documentation browser tests.

## Documentation Conventions

The repository's `src/README.md`, `scripts/README.md`, and `packages/README.md`
provide local entry points. Keep their ownership maps and package guides aligned
with public exports, commands, and consumer behavior. Document token schema and
defaults in [Design Tokens](tokens.md), not JSON comments.

Use JSDoc for JavaScript module APIs and NumPy-style docstrings for Python APIs.
Describe accepted inputs, results, side effects, and errors that callers need
to handle. Keep implementation comments for constraints or decisions that the
code does not explain. Document named shortcode inputs and trusted-HTML options
at the consuming package boundary. Preserve licensed third-party templates,
verbatim samples, and attribution.

Use Title Case headings, meaningful link labels, and executable examples with
explicit working directories and prerequisites. Record incomplete acceptance
checks in the contributor guide; documenting a feature does not establish
passing regression coverage.

## Change the Documentation

Edit the page layout in `docs/layouts/` and `docs/assets/site.css`. The site uses
a centered white page on a gray background, a black masthead and footer, and
square navigation links. Configure the header's Email, GitHub, LinkedIn,
YouTube, and RSS links in `docs/data/social.json`. Their local SVG
icons retain Font Awesome attribution; the generated site includes the license
in `licenses/font-awesome-LICENSE.txt`.

Section overviews show their child buttons below the title. Child pages show
a linked parent title and sibling buttons
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
