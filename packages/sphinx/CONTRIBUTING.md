# Contributing

Start with the [monorepo contribution guide](../../CONTRIBUTING.md) for shared
setup, style rules, dependency ownership, and CI. Use Python 3.12 or newer and
Node.js 22.14 or newer (CI uses Node.js 24).

## Set Up and Build

Run these commands from the **monorepo root** in a clean checkout:

```sh
npm ci --ignore-scripts
python3 -m venv .venv
. .venv/bin/activate
python -m pip install build hatchling tox towncrier twine
npm run build:adapters
npm run check:adapters
python -m pip install --editable packages/sphinx
python -m unittest discover -s packages/sphinx/tests/python
python -m build packages/sphinx
python -m twine check packages/sphinx/dist/*
```

Adapter staging copies the exact generated core stylesheet, provenance, and
licenses. Run it after shared CSS changes and before Python installation or
packaging; the build hook rejects stale or missing bundles. Keep authored
`static/css/style.css` readable. The Sphinx package's legacy `npm run build`
minifies that source in place and is not needed for monorepo builds.

## Build Documentation

With the root virtual environment activated and bundles prepared, change into
**packages/sphinx**:

```sh
cd packages/sphinx
python -m tox -e doc-html
```

Tox installs the declared `doc` dependency group. Install Pandoc for notebooks.
Quarto and TinyTeX are needed for PDF downloads. To check remote links, run
`python -m tox -e doc-links` from the same directory. HTML goes to
`packages/sphinx/doc/_build/html` relative to the monorepo root.

Sources live in `packages/sphinx/doc/source`, with AutoAPI reading
`packages/sphinx/src/sphinx_unbloated_theme`. Example scripts live in
`packages/sphinx/examples` and execute during documentation builds. The build
creates exclusive temporary copies under `doc/source/examples` and removes only
its unchanged copies. Existing files and symlinks cause a collision error.
After an interrupted build, inspect and remove leftover generated `.py` copies
before retrying; authored files are preserved.

Use Title Case headings and short paragraphs. Document Python APIs with
NumPy-style docstrings. Theme description, project, and navigation labels are
plain text; `footer_text` remains an explicitly trusted HTML option.

## Test Theme Behavior

From the monorepo root, run shared checks as described in the root guide.
For Sphinx's existing browser suites, first build documentation, then run:

```sh
cd packages/sphinx
npm ci
npx --no-install playwright install --with-deps chromium firefox
npm test
```

The package lockfile pins these browser tools. Puppeteer downloads Chrome during
installation. Check narrow and wide screens, keyboard links, search, notebook
outputs, and API pages. HTML and directory HTML builders are supported. Configure
`html_baseurl` with the deployment prefix for a hosted 404 page, including when
the host serves it at an arbitrary missing URL. The 404 issue action requires an
HTTPS GitHub repository URL and tolerates a trailing slash.

## Release Notes and Distributions

Add a short reStructuredText fragment under `packages/sphinx/doc/source/changelog`,
for example `123.fixed.rst`, using a category in [pyproject.toml](pyproject.toml).
Towncrier renders native headings and lists, without a tabs extension.

For all adapter distributions, run from the monorepo root:

```sh
npm run build:adapters
npm run pack:adapters
python3 scripts/check-adapter-artifacts.py
```

Report bugs through the monorepo issues. Follow the [security policy](SECURITY.md)
for vulnerabilities and the [code of conduct](CODE_OF_CONDUCT.md) for discussions.
