# Unbloated: A Reveal.js Theme for Quarto

Documentation destinations: [stable](https://jorgemartinez.space/projects/quarto-unbloated-theme/version/stable/)
and [development](https://jorgemartinez.space/projects/quarto-unbloated-theme/version/dev/).

This adapter uses the Unbloated CSS library for its visual design values.
Reveal.js-specific sizing and layout remain in `unbloated.scss`.

The published guide includes a **Rendered Example** link to a working slideshow.
Its source is [example/slides.qmd](example/slides.qmd). Documentation builds
render it with this extension and embed its scripts and styles in the HTML.
Equations use native MathML, so the slideshow needs no runtime CDN connection.

## Build and Install

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
`.cache/artifacts/`. It includes the core CSS, provenance, and license notices, so
rendering needs neither npm nor a CDN connection.

## Author Slides

After installing the extension, create `slides.qmd`:

```markdown
---
title: Technical Notes
format:
  unbloated-revealjs:
    footer: Project notes
---

## Introduction

Write slide content in Markdown.
```

Run `quarto render slides.qmd` from the project directory. Open the generated
HTML with its accompanying files. For a single HTML file, use Quarto's
`embed-resources: true` option. Locally bundled styles do not make authored remote
images or other remote document dependencies available offline.

Use [template.qmd](template.qmd) as a content gallery. Replace its title, author,
institute, footer, and example content before using it for a presentation.
Quarto supplies mathematical rendering; the Hugo adapter's `math: true` page
flag is not a Quarto option.

Images are capped relative to their column (`min(100%, 800px)`) and preserve
authored width attributes. Captions and figures use Quarto's normal markup.
Configure a global `footer`, add a slide's `.footer` div for an override, or use
`{footer=false}` on a heading to suppress it. Normal slides use Quarto's native
footer lifecycle. For scroll view, the after-body script copies the configured
global footer into slides without an override or suppression. After Reveal's
`pdf-ready` event, it places a copy of each page's local or default footer inside
that PDF page, outside the clipped slide frame. CSS hides the fixed screen footer
in both views. Empty global footers produce no copies, and authored local footer
nodes stay in their slides.

## Source and Compatibility

| File                                                                    | Responsibility                                                                                                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `_extensions/unbloated/_extension.yml`                                  | Independent extension version and the `unbloated-revealjs` format. Registers the default Reveal theme, SCSS, core CSS, and after-body include. |
| `_extensions/unbloated/unbloated.scss`                                  | Maps core properties to Reveal variables and supplies slide geometry, code, images, tables, captions, and footer styling.                      |
| `_extensions/unbloated/custom.html`                                     | Copies global footers into scroll slides and local/default footers into PDF pages, preserving authored nodes and native screen behavior.       |
| `_extensions/unbloated/unbloat.css`, `unbloated-core.json`, `licenses/` | Generated exact core bundle, provenance, and notices; do not edit.                                                                             |

Browser layout, native footer handling, scroll view, and print/PDF checks pass
on Quarto 1.9.37 and 1.11.5. The extension currently declares no minimum Quarto
version; these checks do not establish compatibility with every version or
presentation configuration. See [Rendering Regressions](../../CONTRIBUTING.md#rendering-regressions) for
verification commands and requirements.
Use a browser supporting the core CSS and Reveal output, including the adapter's
container-relative image limits. PDF output needs Quarto's browser/PDF tooling.

The extension version in `_extension.yml` and core version in provenance can
differ. The monorepo packer currently names the Quarto archive using the core
version, so inspect the manifest rather than treating the archive filename as
the extension version.

## Verification

To run the real adapter rendering fixtures, install Sphinx and Quarto, prepare
bundles, and run `npm run test:adapter-browser` from the monorepo root. Set `PYTHON`
to the Python environment containing the Sphinx theme and `QUARTO_BIN` to select a
Quarto executable. The fixture covers column images, authored widths, default and
local footers, suppression, absent footers, scroll view, and print view. Use an
absolute `PYTHON` path when sharing the setting with adapter packaging, which
changes its subprocess working directory.
