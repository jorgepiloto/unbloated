# Unbloated: a Reveal.js theme for Quarto

This adapter uses the Unbloated CSS library for its visual design values.
Reveal.js-specific sizing and layout remain in `unbloated.scss`.

From the Unbloated repository root:

```sh
npm ci --ignore-scripts
npm run build:adapters
npm run check:adapters
```

Install the built extension in a Quarto project:

```sh
quarto add --no-prompt /path/to/unbloated/packages/quarto
```

Use `format: unbloated-revealjs` in the document's YAML front matter.
`npm run pack:adapters` creates a distributable extension archive in
`.artifacts/`. It includes the core CSS, provenance, and license notices, so
rendering needs neither npm nor a CDN connection.
