# Build and Verification Scripts

Run commands from the monorepo root. Node.js 22.14 or newer is required; shared
development uses Node.js 24. Install the locked tools with `npm ci --ignore-scripts`.
The core build itself uses only Node built-ins. These scripts are contributor
tools, not browser runtime dependencies.

## Commands

| Script                                                   | Command                                                           | Requirements and Effects                                                                                                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [build.mjs](build.mjs)                                   | `npm run build` or `node scripts/build.mjs --check`               | Renders five files in `dist/`; `--check` instead compares two temporary builds and removes them.                                                                                                          |
| [adapters.mjs](adapters.mjs)                             | `npm run build:adapters` and `npm run check:adapters`             | The npm build first generates the core. The script stages exact CSS, provenance, and license files; `--check` compares without writing.                                                                   |
| [latex-tokens.mjs](latex-tokens.mjs)                     | Imported by adapter staging                                       | Translates validated `:root` properties from built CSS into `unbloated-tokens.sty`; maps CSS units to TeX lengths without writing files.                                                                  |
| [adapter-styles.mjs](adapter-styles.mjs)                 | `npm run lint:adapters`                                           | Requires the root PostCSS and Sass dependencies. Parses authored adapter CSS, compiled SCSS, and template styles without modifying them.                                                                  |
| [pack-adapters.mjs](pack-adapters.mjs)                   | `npm run pack:adapters`                                           | Requires staged bundles, npm, tar, and Python with the `build` frontend. Writes five distributions to `.artifacts/`.                                                                                      |
| [check-adapter-artifacts.py](check-adapter-artifacts.py) | `python3 scripts/check-adapter-artifacts.py`                      | Uses Python's standard library to inspect all five archives without extracting them to disk. Requires current `dist/` and exactly one artifact of each supported type.                                    |
| [serve.mjs](serve.mjs)                                   | `npm run preview`                                                 | Serves the reference page and generated CSS at `http://127.0.0.1:4173`; build the core first.                                                                                                             |
| [project-docs.mjs](project-docs.mjs)                     | `npm run docs:project -- <project> <dev\|stable>`                 | Builds one allowlisted project at its own URL prefix under `.cache/project-docs/`; Sphinx requires its native documentation tools. Writes `documentation.json` for exact-artifact serving and validation. |
| [docs.mjs](docs.mjs)                                     | `npm run docs:setup`, `docs:build`, `docs:dev`, or `docs:preview` | Setup downloads and verifies the locked Hugo binary. Other modes rebuild documentation assets and stage exact core license notices before running Hugo.                                                   |
| [docs-artifact.mjs](docs-artifact.mjs)                   | Imported by the artifact server and Playwright config             | Reads a project artifact manifest, or infers a legacy core artifact prefix from its fingerprinted CSS URL. Does not rebuild files.                                                                        |
| [serve-docs.mjs](serve-docs.mjs)                         | `node scripts/serve-docs.mjs`                                     | Serves an existing documentation artifact at `http://127.0.0.1:4174` under its inferred deployment prefix.                                                                                                |

Build `site/` before `npm run test:docs`, or point `DOCS_ARTIFACT_DIR` at downloaded
static output. `docs:preview` rebuilds from source; the artifact server preserves
the downloaded bytes. Both loopback servers close on SIGINT or SIGTERM. Their
ports are fixed; stop a conflicting listener before starting them.

Scripts fail with a nonzero exit status for rejected input, missing files, failed
validation, or failed subprocesses. Packaging validates bundles before writing
archives but is not transactional: a later failure can leave earlier artifacts.
Remove obsolete distributions from `.artifacts/` when versions change so the
archive checker can require one of each type.

## Environment and Paths

| Variable            | Used By                                                    | Meaning                                                                                                                                       |
| ------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOCS_SOURCE_REF`   | `project-docs.mjs`                                         | Git revision used in relative source links from package guide sites; defaults to `main`, while CI uses the checked-out commit.                |
| `HUGO_BIN`          | `docs.mjs`                                                 | Hugo executable path or command name. Otherwise uses `.cache/hugo/hugo`, then PATH. Build modes require the version in `docs/hugo-lock.json`. |
| `DOCS_ARTIFACT_DIR` | `docs-artifact.mjs`, `serve-docs.mjs`, documentation tests | Existing artifact directory, defaulting to `site`, resolved from the current working directory.                                               |
| `PYTHON`            | `pack-adapters.mjs`                                        | Python executable, defaulting to `python3`. Use an absolute virtual-environment path because packaging runs in `packages/sphinx`.             |

Core and adapter source paths resolve from the script's repository root. An
explicit build destination is relative to the caller's working directory when
it is not absolute. Alternate checkout `directory` arguments are directory URLs
with trailing slashes, not filesystem strings. Packaging changes its child
process working directories to the adapter roots.

```sh
PYTHON="$PWD/.venv/bin/python" npm run pack:adapters
DOCS_ARTIFACT_DIR=site-versioned npm run test:docs
npm run docs:build -- --baseURL https://example.org/project/version/stable/
```

## Module APIs

Importing a JavaScript script does not start a server, download tools, or write
build output. Its CLI entry point runs only when invoked directly. Async
operations reject on filesystem or tool failures unless a handler translates
the error into an HTTP response.

| Export                                            | Input and Result                                                                                                                                                                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build.mjs`: `root`                               | Repository-root `URL`, independent of the caller's working directory.                                                                                                                                                       |
| `validateTokens(tokens)`                          | Accepts parsed JSON, returns the same validated object, and throws on invalid groups, names, values, or radius.                                                                                                             |
| `render()`                                        | Returns `Promise<Map<string, string>>` for five distribution files; reads sources without writing output.                                                                                                                   |
| `build({ directory } = {})`                       | Returns `Promise<void>` after writing the distribution. Defaults to this checkout's `dist/`; unexpected destination entries cause failure after writing.                                                                    |
| `checkBuild()`                                    | Returns `Promise<void>` after comparing two independent builds; removes temporary directories in `finally`.                                                                                                                 |
| `adapters.mjs`: `root`, `adapters`                | Repository-root URL and adapter-name to relative asset-directory map.                                                                                                                                                       |
| `prepareAdapters({ directory, check } = {})`      | Returns `Promise<void>`. Checks style ownership and known core tokens, then stages bundles (including CSS-derived TeX styles) or compares existing bytes when `check` is true. LaTeX includes generated TeX and its digest. |
| `assertAdapterStyle(source, { from, core } = {})` | Returns `undefined` or throws a PostCSS error. `from` names the source; optional built-core text enables unknown-token checks.                                                                                              |
| `checkAdapterStyles({ directory, core } = {})`    | Returns `Promise<void>` after checking authored adapter styles. Omitting `core` skips unknown-token validation. This is an ownership check, not a CSS sandbox.                                                              |
| `renderLatexTokens(css)`                          | Returns generated TeX as a string from one canonical built-CSS token block. Rejects unsafe, missing, duplicate, or unsupported tokens; reads and writes no files.                                                           |
| `packAdapters({ directory } = {})`                | Returns `Promise<void>` after checking bundles and running tar, npm, and Python builders. Uses `PYTHON` for the Python child.                                                                                               |
| `project-docs.mjs`: `documentationProjects`       | Registry loaded from `docs/projects.json`, with project titles, builders, descriptions, and source directories.                                                                                                             |
| `projectDocumentation(project, channel)`          | Resolves an allowlisted project and channel to its deployment URL, cache output directory, and configuration; rejects invalid inputs without writes.                                                                        |
| `buildProjectDocumentation(project, channel)`     | Returns artifact metadata after staging the core and building the selected native Sphinx site or Hugo-rendered guide. Errors propagate; failed builds can leave partial cache output.                                       |
| `prepareDocs()`                                   | Returns `Promise<void>` after building the core and writing generated CSS, package data, and exact license notices under `docs/`.                                                                                           |
| `setupHugo()`                                     | Returns `Promise<void>` after downloading, checking SHA-256, and extracting the locked Linux x64/arm64 binary. Requires network access and tar; other platforms install Hugo themselves.                                    |
| `runDocs(mode, extraArgs = [])`                   | Accepts `setup`, `build`, `serve`, or `preview`; returns `Promise<number>`, the child exit code or 1 if terminated. Additional arguments go to Hugo without a shell.                                                        |
| `docsArtifact(artifactDirectory?)`                | Returns `Promise<{ directory: URL, prefix: string }>` from an existing artifact. Throws on missing HTML, invalid artifact metadata, or a missing legacy CSS fingerprint. Project manifests support native Sphinx output.    |
| `documentationHandler({ directory, prefix })`     | Returns an async Node HTTP request listener without opening a socket. The artifact root must be trusted local build output.                                                                                                 |
| `handlePreviewRequest(request, response)`         | Returns `Promise<void>` after handling a Node HTTP request against the fixed reference-route allowlist.                                                                                                                     |

`check-adapter-artifacts.py` exposes `check_files(files, core, metadata, latex_tokens=None)` for
in-memory archive validation. It returns `None` or raises on missing or mismatched
CSS, provenance, generated TeX, or notices. `main()` reads this checkout's distributions and
prints one verification line per archive; it writes no files.

The reference server accepts GET/HEAD on fixed routes, returns 400 for malformed
URLs, 404 for missing routes or other methods, and 500 for file-read failures. It
sends restrictive CSP and `nosniff` headers. The artifact server accepts GET/HEAD
within its prefix, rejects malformed URL encoding with 400, rejects missing or
outside-prefix paths with 404, and returns 500 for other read failures. It sends
`nosniff`; it does not impose the reference page's script-blocking CSP.

See the [Source Reference](../docs/content/reference/source.md) for the build
implementation and the [contribution guide](../CONTRIBUTING.md) for validation
and distribution workflows.
