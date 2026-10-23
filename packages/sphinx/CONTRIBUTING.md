# Contributing

Use issues to report bugs or discuss changes to the theme. For vulnerabilities,
follow the [security policy](SECURITY.md). Project discussions and contributions
follow the [code of conduct](CODE_OF_CONDUCT.md).

## Set Up Your Environment

Use Python 3.12 or later and Node.js 22.12 or later. CI uses Node.js 22.
With `uv` available, run these commands from the repository root:

```console
uv venv
uv pip install --editable .
uv tool install tox
uv tool install pre-commit
npm ci
```

Install the browsers used by the tests:

```console
npx playwright install --with-deps chromium firefox
```

Puppeteer downloads Chrome during `npm ci`. Install Pandoc to build the
notebook examples. Quarto and TinyTeX are also needed to generate their PDF
downloads.

Commit `package-lock.json` when updating Node.js dependencies. CI uses this
lockfile for CSS builds and browser tests. Run `npm audit` after an update.

## Check Code Style

Run the repository's pre-commit hooks:

```console
pre-commit run --all-files --show-diff-on-failure
```

Some hooks format files in place. Review their changes before committing.
Use NumPy-style docstrings for the Python API.

## Build the Documentation

The documentation source is in `doc/source`. AutoAPI generates the API
reference from `src/sphinx_unbloated_theme` during the build. Edit the source
docstrings or the templates in
`src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/_templates/autoapi`
to change the reference.

Build the CSS, check links, and render the HTML pages:

```console
npm run build
tox -e doc-links,doc-html
```

The CSS build rewrites
`src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/static/css/style.css`
in place. HTML output goes to `doc/_build/html`.

Use Title Case headings and short paragraphs. Explain what the reader needs
to do, and keep equations in display math blocks on their own lines. The ISA,
Monte Carlo pi, and projectile motion examples live in `examples` and run
during documentation builds.

## Run Browser Tests

Build the HTML documentation first, then run:

```console
npm test
```

This runs the Playwright and Puppeteer suites against `doc/_build/html`.
Check theme changes on narrow and wide screens, including navigation, search,
and API pages.

Check generated navigation, deployment paths, and bundled licenses:

```console
tox -e tests-python
```

## Add a Changelog Fragment

Add a reStructuredText fragment to `doc/source/changelog` when a change needs
a release note. Name it with the pull request number and a category from
the Towncrier configuration in [pyproject.toml](pyproject.toml), such as
`123.fixed.rst`.

Describe the behavior that changed and how it affects the reader. Keep the
fragment short. Towncrier combines these files into
`doc/source/changelog.rst` for a release.

## Build a Distribution

After building the CSS, build and check the wheel and source distribution:

```console
uv build
uvx twine check dist/*
```

See [README.rst](README.rst) for the CI workflows and release setup.
