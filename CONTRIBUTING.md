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
runs offline; the action also runs online audits. Tests wait for `code-style`;
the package build waits for both tests and `actions-style`. Dependency audits
also run in the CI test jobs.

Edit design values in `src/tokens.json`, semantic element rules in
`src/base.css`, and optional component rules in `src/components.css`. Keep
layouts and selectors specific to Hugo, Sphinx, or Reveal.js in their adapters.

Run these checks before opening a pull request:

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

Documentation uses Hugo and the generated library stylesheet. Install the
pinned Hugo version as shown in
[Documentation Prerequisites](docs/content/getting-started/prerequisites.md), then run
`npm run docs:dev` to edit pages with live reload. Restart that command after
changing the shared CSS or tokens so it rebuilds the stylesheet.

Document public inputs, return values, errors, and side effects in source
comments. Update the [Source Reference](docs/content/reference/source.md), token table,
and component examples when behavior changes. Run `npm run docs:build` and
`npm run test:docs` before submitting documentation changes. CI runs both checks
in each test job. Generated documentation assets and `site/` stay out of Git.

The package includes full source and build instructions for its LGPLv3 license.
Keep the license banner in distributed CSS and Sass files.

## Adapter Packages

The CSS library at the repository root owns the design values and shared
semantic styles. `packages/sphinx`, `packages/quarto`, and `packages/hugo` own
platform markup, navigation, slide geometry, and layout-specific spacing.
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
stale files. It also validates core variable references.

`lint:adapters` parses authored CSS, compiled SCSS, and template style
declarations. It rejects literal colors, independent font stacks, independent
shadow offsets, and definitions of core `--unbloat-*` variables. Keep visual
values in the core; adapter-specific dimensions and widget sizing may remain
local. This is an ownership check, not a general accessibility or CSS audit.

`pack:adapters` refuses stale bundles and writes a Sphinx wheel and source
distribution, Quarto extension archive, and Hugo npm tarball to `.artifacts/`.
The artifact checker compares the files inside each archive with the core.
The Sphinx build hook also rejects missing assets or a mismatched digest, so
building a wheel directly cannot silently omit the core.

The `adapter-packages` workflow runs these checks, tests the installed Sphinx
wheel, and uploads distributions on pull requests, main pushes, and core release
tags. It does not publish adapters to PyPI or npm. Keep adapter versions
independent; each generated provenance file records the bundled core version.
Publish matching core source with releases and retain all bundled notices.

Use the copies inside this repository for further adapter development. The
former standalone Sphinx and Quarto repositories remain intact as migration
sources, not additional sources of theme design values.
