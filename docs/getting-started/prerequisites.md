# Prerequisites

## Use the Stylesheet

Use a browser that supports CSS custom properties, `:where()`, and
`:focus-visible`. You do not need Node.js or Python to load the built CSS.
The library's browser tests target Chromium, Firefox, and WebKit.

## Build the Library

Use Node.js 22.14 or newer and npm. Node.js 24 is the development default in
`.nvmrc`. Install development dependencies from the committed npm lockfile:

```sh
npm ci --ignore-scripts
```

The project disables automatic lifecycle scripts in `.npmrc`. Explicit
`npm run` commands still work.

## Build the Documentation

Use Python 3.12 or newer for MkDocs. Create an environment and install the
locked documentation dependencies:

```sh
python3 -m venv .venv-docs
.venv-docs/bin/python -m pip install --require-hashes -r docs/requirements.txt
```

On Windows, create the environment with `python -m venv .venv-docs` and use
`.venv-docs\Scripts\python.exe` for the pip command. The npm documentation
commands detect that environment on both platforms. Set `DOCS_PYTHON` to the
path of another Python interpreter if you use a different environment.

## Run Checks

Install pre-commit 4.6.2 and run `pre-commit install` to enable commit and push
checks. To run browser tests, download the browsers and their operating system
dependencies:

```sh
npx --no-install playwright install --with-deps chromium firefox webkit
```

Documentation browser tests use Chromium. The
[Source Reference](../reference/source.md#verification) lists the check commands.
