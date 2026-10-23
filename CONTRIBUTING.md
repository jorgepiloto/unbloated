# Contributing

Use Node.js 24 and the committed npm lockfile. Install dependencies with
`npm ci --ignore-scripts`. The project disables automatic lifecycle scripts in
`.npmrc`; explicit `npm run` commands still work.

Install pre-commit and enable the commit and push hooks:

```sh
python -m pip install pre-commit==4.6.2
pre-commit install
```

The hooks use the project's installed Prettier, ESLint, and Biome versions.
Pre-commit installs the pinned file checks, actionlint, zizmor, and Gitleaks
in isolated environments. The first run downloads those tools.

Commit hooks check file names, whitespace, file size, JSON, YAML, TOML,
JavaScript, CSS, workflow syntax and security, secrets, and reproducible builds.
Gitleaks scans the current files with redacted output. It excludes dependencies
and generated files through `.gitleaks.toml`; it does not scan Git history.
Push hooks also run `npm audit --audit-level=high`, which needs registry access.

Run both hook stages locally:

```sh
pre-commit run --all-files --show-diff-on-failure
pre-commit run --all-files --hook-stage pre-push
```

Update remote hooks with `pre-commit autoupdate --freeze` to keep their
revisions pinned to commit hashes.

Pull-request and Release workflows run the commit hooks in `code-style` and
check workflow security with zizmor in `actions-style`. The local zizmor hook
runs offline; the action also runs online audits. Validation jobs run
independently; `build-library` waits for style, documentation, test, and adapter
checks before packaging. Dependency audits also run in the CI test jobs.

Edit design values in `src/tokens.json`, semantic element rules in
`src/base.css`, and optional component rules in `src/components.css`. Keep
layouts and selectors specific to Hugo, Sphinx, or Reveal.js in their adapters.

Run these checks before opening a pull request. The Hugo consumer regressions use
the pinned binary; install it first with `npm run docs:setup` (or set `HUGO_BIN`).

```sh
npx --no-install playwright install --with-deps chromium firefox webkit
npm run format
npm run lint
npm run build
npm run verify
npm audit --audit-level=high
```

Do not add runtime dependencies, remote asset requests, rounded components,
or colored accents to the shared styles. Use logical CSS properties where
possible. Preserve visible keyboard focus and native element semantics.

Commit source changes. Git ignores generated `dist/` files and npm tarballs.
CI builds distributions from the source before testing, and `release.yml`
publishes the verified CI artifact. `npm run build:check` compares two fresh
builds in temporary directories. Add tests
when a change affects supported behavior. Treat exported paths, token names,
and documented classes as the public interface. Changes to those names require
a migration note. Record intentional visual changes in the changelog and
inspect the reference page on desktop and mobile.

Keep documentation beside the contract it describes. Use JSDoc for JavaScript
module APIs and NumPy-style docstrings for Python APIs, including caller inputs,
results, side effects, and meaningful errors. Comments should explain constraints
and decisions rather than restating code. Keep JSON schema explanations in the
token reference, named shortcode inputs in the Hugo guide, and installation and
configuration in each package guide. Preserve third-party text and attribution.
The directory guides in [src](src/README.md), [scripts](scripts/README.md), and
[packages](packages/README.md) link these references together.

Documentation uses Hugo and the generated library stylesheet. Install the
pinned Hugo version as shown in
[Documentation Prerequisites](docs/content/getting-started/prerequisites.md), then run
`npm run docs:dev` to edit pages with live reload. Restart that command after
changing the shared CSS or tokens so it rebuilds the stylesheet.

Document public inputs, return values, errors, and side effects in source
comments. Update the [Source Reference](docs/content/reference/source.md), token table,
and component examples when behavior changes. Run `npm run docs:build` and
`npm run test:docs` before submitting documentation changes. CI runs both checks
in each `doc-build` job. Generated documentation assets and `site/` stay out of Git.

The package includes full source and build instructions for its LGPLv3 license.
Keep the license banner in distributed CSS and Sass files.

### Container Browser Checks

On Linux hosts where native WebKit hangs during page initialization, run the
full browser suite in the [Playwright Docker image](https://playwright.dev/docs/docker).
Use the same Playwright version as the locked npm dependency. Prepare the core,
npm dependencies, and pinned Hugo binary with the contributor setup above first.

Run from the repository root:

```sh
playwright_version="$(node -p 'require("./package.json").devDependencies["@playwright/test"]')"
mkdir -p .cache/browser-container
docker run --rm --init --user "$(id -u):$(id -g)" --shm-size=1g \
  --env HOME=/tmp \
  --mount "type=bind,source=$PWD,target=/repo,readonly" \
  --mount "type=bind,source=$PWD/.cache/browser-container,target=/results" \
  --workdir /repo "mcr.microsoft.com/playwright:v${playwright_version}-noble" \
  npm run test:browser -- --workers=3 --output=/results/run
```

The checkout is mounted read-only. Browser output goes into
`.cache/browser-container/run/`; the child output directory lets Playwright
clean previous results without removing the mount itself. The image supplies
browsers and system libraries; the mounted checkout supplies its locked npm
dependencies and Hugo binary. No engine is excluded and no rendering flags are
overridden. Native browser execution remains available through
`npm run test:browser`.

## Project Documentation

Every extension has its own documentation site. Project identifiers and sources
live in `docs/projects.json`. Build and validate one site from the repository root:

```sh
npm run docs:setup
npm run docs:project -- unbloated-hugo-theme dev
DOCS_ARTIFACT_DIR=.cache/project-docs/unbloated-hugo-theme/dev npm run test:project-docs
```

Replace the project with `unbloated`, `sphinx-unbloated-theme`,
`quarto-unbloated-theme`, or `unbloated-book`, and use `stable` for a release
preview. Output stays under `.cache/project-docs/<project>/<channel>/`.
`documentation.json` records the project, channel, version, and deployment URL.
The artifact server accepts this manifest and retains compatibility with older
core artifacts identified by their fingerprinted CSS.

Sphinx builds its native sources and requires the package's `doc` dependency
group, Pandoc, Quarto, and LuaLaTeX for notebook/PDF downloads. Use an absolute
virtual-environment executable path through `PYTHON`; do not resolve its symlink
to the system Python. Its CI matrix entry installs these tools before building.
`DOCUMENTATION_VERSIONS_URL` optionally supplies a Sphinx version-selector feed;
it defaults to empty rather than requesting a global or localhost feed.
The other extension sites render their package READMEs without duplicating guide
content. Relative source links resolve to the monorepo; code examples retain
literal Hugo shortcode syntax. `DOCS_SOURCE_REF` selects the source revision in
those links, defaulting to `main`; CI uses the checked-out commit.

Dev and stable artifacts publish to each project's own version directory. See
[Release Setup](docs/content/releasing.md#configure-documentation-deployment) for
all destination paths and deployment gates. Updating this code configures future
workflow runs; local preview commands do not publish to the website.

## Adapter Packages

The [LaTeX adapter](packages/latex/README.md) participates in the same staging,
provenance, license, and packaging pipeline. Its generated `unbloated-tokens.sty`
translates custom properties from the built core CSS to TeX. After staging,
run `bash tests/check.sh` from `packages/latex` to compile its example and check
class options and engine errors. From the repository root, run
`node --test tests/latex.integration.mjs` to compile isolated consumers with
default and modified CSS. These checks require LuaLaTeX. Keep PDFs and TeX
auxiliary files in the ignored `build/` directory.

The CSS library at the repository root owns the design values and shared
semantic styles. The four platform packages own markup, navigation, slide or
page geometry, and layout-specific spacing. LaTeX maps the core monospace family
to Latin Modern Mono and core CSS units to TeX lengths.
The imported Sphinx browser suites retain their existing test tooling rather
than the core's ESLint configuration. Hugo's Go templates and Sphinx's Jinja
templates are excluded from Prettier's HTML parser.
The imported layout styles retain their existing specificity order and
`!important` declarations; Biome exempts only those two rules for adapter
stylesheets. Changing the cascade requires a separate visual review.
Existing Sphinx and Hugo customization names are aliases for core variables,
not independent palettes or font stacks. The adapters use the core's grayscale
links and system monospace stack instead of their former blue links and bundled
font defaults.

Build and package all adapters from the repository root:

```sh
npm ci --ignore-scripts
python3 -m pip install build hatchling
npm run build:adapters
npm run check:adapters
npm run test:adapters
python3 -m unittest discover -s tests -p test_adapter_bundles.py
npm run pack:adapters
python3 scripts/check-adapter-artifacts.py
```

Use Python 3.12 or newer. Set `PYTHON` to a virtual environment's Python
executable when it is not available as `python3`. Package tests invoke npm, tar,
and Python's build frontend against isolated fixtures. They do not replace a
build and rendering check with the real core stylesheet.

`build:adapters` builds the core once and copies `dist/unbloat.css` unchanged
into each adapter, with its package name, version, SHA-256 digest, and license
notices. Generated files stay out of Git. `check:adapters` compares every
bundled asset with the current core build; it fails on missing, modified, or
stale files. It also validates core variable references and the generated TeX
translation. LaTeX provenance includes `texSha256` alongside the CSS digest.

`lint:adapters` parses authored CSS, compiled SCSS, and template style
declarations. It rejects literal colors, independent font stacks, independent
shadow offsets, and definitions of core `--unbloat-*` variables. Keep visual
values in the core; adapter-specific dimensions and widget sizing may remain
local. This is an ownership check, not a general accessibility or CSS audit.

`pack:adapters` refuses stale bundles and writes a Sphinx wheel and source
distribution, Quarto extension archive, Hugo npm tarball, and LaTeX archive to
`.artifacts/`. The artifact checker compares each bundled CSS file with the core
and checks the LaTeX translation and its digest.
The Sphinx build hook also rejects missing assets or a mismatched digest, so
building a wheel directly cannot silently omit the core.

The `adapter-packages` job in the pull-request, Night, and Release workflows
runs these checks, tests the installed Sphinx wheel, and uploads distributions
on pull requests, nightly runs, and core release tags. It does not publish
adapters to PyPI or npm. Keep adapter versions
independent; each generated provenance file records the bundled core version.
Publish matching core source with releases and retain all bundled notices.

Use the copies inside this repository for further adapter development. The
former standalone Sphinx and Quarto repositories remain intact as migration
sources, not additional sources of theme design values.

### Rendering Regressions

`npm run test:browser` also builds a real Hugo consumer and checks prefixed search,
script-free links and plant fields, wide content, and repeated plots using local
script fixtures. `npm run test:docs` serves already built documentation at its
actual prefix; it does not rebuild the downloaded artifact. Set `DOCS_ARTIFACT_DIR`
for a different stable or versioned artifact directory.

For Sphinx and Quarto, prepare bundles and install their builders, then run:

```sh
PYTHON=.venv/bin/python npm run test:adapter-browser
```

The Python environment must contain the Sphinx adapter. Quarto must be on PATH
(or selected through `QUARTO_BIN`). These fixtures use the real bundled core CSS.
They cover notebook outputs, table wrapping, focus, column images, and native
footer ownership in slide, scroll, and print views. To check only Sphinx when
Quarto is unavailable, add `-- --grep Sphinx`. Browser checks need an environment
that permits Chromium and loopback servers; failed launches are not passing tests.
