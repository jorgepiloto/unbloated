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

Images are capped relative to their column (`min(100%, 800px)`) and preserve
authored width attributes. Captions and figures use Quarto's normal markup.
Footers use Quarto's native lifecycle: configure a global `footer`, add a slide's
`.footer` div for an override, or use `{footer=false}` on a heading to suppress it.
The extension does not relocate footer nodes. Verify slide, scroll, and PDF output
with your installed Quarto version; native footer behavior can vary by version.

To run the real adapter rendering fixtures, install Sphinx and Quarto, prepare
bundles, and run `npm run test:adapter-browser` from the monorepo root. Set `PYTHON`
to the Python environment containing the Sphinx theme and `QUARTO_BIN` to select a
Quarto executable. The fixture covers column images, authored widths, default and
local footers, suppression, absent footers, scroll view, and print view.
