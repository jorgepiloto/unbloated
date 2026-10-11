---
title: Prerequisites
---

## Use the Stylesheet

Use a browser that supports CSS custom properties, `:where()`, and
`:focus-visible`. You do not need Node.js or Hugo to load the built CSS.
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

Use Hugo 0.167.0. On Linux x64 or arm64, install the pinned binary locally:

```sh
npm run docs:setup
```

This downloads the official Hugo release, verifies its SHA-256 against
`docs/hugo-lock.json`, and extracts the binary into `.cache/hugo/`. It does not
install a system package. Initial setup needs network access and `tar`; later
builds use the cached binary.

On macOS and Windows, install the same version from the
[official Hugo installation guide](https://gohugo.io/installation/). The runner
checks `HUGO_BIN`, then the repository cache, then Hugo on PATH. Set `HUGO_BIN`
to another executable path if needed. Documentation needs no Python environment.

## Run Checks

Install pre-commit 4.6.2 and run `pre-commit install` to enable commit and push
checks. To run browser tests, download the browsers and their operating system
dependencies:

```sh
npx --no-install playwright install --with-deps chromium firefox webkit
```

Documentation browser tests use Chromium. The
[Source Reference](../reference/source.md#verification) lists the check commands.
