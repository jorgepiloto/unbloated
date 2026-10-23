# Unbloated: A Reveal.js Theme for Quarto

This adapter uses the Unbloated CSS library for its visual design values.
Reveal.js-specific sizing and layout remain in `unbloated.scss`.

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
`.artifacts/`. It includes the core CSS, provenance, and license notices, so
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
Footers use Quarto's native lifecycle: configure a global `footer`, add a slide's
`.footer` div for an override, or use `{footer=false}` on a heading to suppress it.
The extension does not relocate footer nodes. Verify slide, scroll, and PDF output
with your installed Quarto version; native footer behavior can vary by version.

## Source and Compatibility

| File                                                                    | Responsibility                                                                                                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `_extensions/unbloated/_extension.yml`                                  | Independent extension version and the `unbloated-revealjs` format. Registers the default Reveal theme, SCSS, core CSS, and after-body include. |
| `_extensions/unbloated/unbloated.scss`                                  | Maps core properties to Reveal variables and supplies slide geometry, code, images, tables, captions, and footer styling.                      |
| `_extensions/unbloated/custom.html`                                     | Retained after-body include; footers use the generator's native lifecycle.                                                                     |
| `_extensions/unbloated/unbloat.css`, `unbloated-core.json`, `licenses/` | Generated exact core bundle, provenance, and notices; do not edit.                                                                             |

The source has HTML-generation evidence on Quarto 1.9.37 and 1.11.5; this is not
a declared minimum-version guarantee. The extension currently declares no
minimum Quarto version. Browser layout, native footer handling, scroll view, and
print/PDF checks are tracked separately in [ROADMAP.md](../../ROADMAP.md).
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
