# Core Sources

These files define the shared CSS library. Platform layouts and runtime behavior
belong in [adapters](../packages/README.md). The core uses system monospace fonts,
grayscale colors, square corners, and no runtime JavaScript or dependencies.

| Source                           | Contract                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [tokens.json](tokens.json)       | Canonical design values. Each `group.name` becomes `--unbloat-group-name` in CSS and `$unbloat-group-name` in Sass. |
| [base.css](base.css)             | Semantic HTML styles with low-specificity `:where()` selectors. Requires the generated token properties.            |
| [components.css](components.css) | Optional appearance classes. Requires tokens; supplies no application logic or ARIA behavior.                       |

The [token reference](../docs/content/reference/tokens.md) documents every default,
accepted value, and consumer override. JSON does not support comments; keep schema
explanations in that reference and validation in [build.mjs](../scripts/build.mjs).

## Build and Load

Run from the repository root with Node.js 22.14 or newer:

```sh
node scripts/build.mjs
node scripts/build.mjs --check
```

The build writes `tokens.css`, `_tokens.scss`, `base.css`, `components.css`, and
`unbloat.css` to `dist/`. The check compares two temporary builds without updating
`dist/`. Both commands reject invalid tokens and unknown core variable references.
Do not edit generated output. All distribution files retain the license banner.

Load `unbloat.css` for the complete library. For separate files, load `tokens.css`
before `base.css` and, optionally, `components.css`. Load consumer styles after
the library. Sass tokens expose values without emitting semantic or component
rules. See the [installation guide](../docs/content/getting-started/installation.md)
for package exports and stylesheet examples.

## Semantic Styles

Base rules cover typography, persistent link underlines, visible keyboard focus,
native form controls, disabled states, code, quotations, media, tables, and
disclosure summaries. Checked selection controls use an inset mark; an
indeterminate checkbox uses a horizontal mark. Set the native `indeterminate`
JavaScript property in the consuming application when that state is needed.
Forced-color rules restore native selection-control appearance.

The core does not impose a page width or table wrapper. Preformatted blocks scroll
horizontally; adapters must handle wide tables and other platform content. Keep
labels, accessible names, validation, and widget state in the consuming markup
and application. CSS classes do not replace semantic elements.

## Appearance Classes

| Class             | Responsibility                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `unbloat-panel`   | Bordered surface, padding, and hard shadow.                                                                                           |
| `unbloat-callout` | Bordered surface with a thicker logical leading edge.                                                                                 |
| `unbloat-button`  | Button appearance for an action button or navigation link.                                                                            |
| `unbloat-tag`     | Static or linked tag appearance.                                                                                                      |
| `unbloat-tabs`    | Wrapping tab-control layout and selected appearance; the consumer supplies focus, selection, panel visibility, and keyboard handling. |
| `unbloat-inverse` | Inverse foreground and surface; explicitly colored descendants may need overrides.                                                    |

The [component documentation](../docs/content/components/_index.md) includes
markup and state examples. The [contribution guide](../CONTRIBUTING.md) defines
checks and compatibility requirements for changes to tokens, exports, or classes.
