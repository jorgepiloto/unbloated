---
title: About
---

Monospace grayscale CSS library for engineers.

Unbloated provides a shared appearance for websites, documentation, and
presentation themes. Its design uses system monospace fonts, black and white
surfaces, grayscale details, and square corners.

The distributed library contains no runtime JavaScript, runtime dependencies,
remote fonts, or remote assets. The documentation adds a small script for its
interactive tab example. That script is an example adapter and is not included
in the npm package.

## Stylesheets

| File                  | Contents                                                  |
| --------------------- | --------------------------------------------------------- |
| `dist/unbloat.css`    | Tokens, semantic HTML styles, and all optional components |
| `dist/tokens.css`     | CSS custom properties                                     |
| `dist/base.css`       | Styles for semantic HTML elements                         |
| `dist/components.css` | Optional component classes                                |
| `dist/_tokens.scss`   | Sass variables with `!default`                            |
| `src/tokens.json`     | Canonical design values                                   |

Load tokens first when using separate stylesheets. Load base styles and
components next, then your own adapter. The selectors use `:where()` to keep
specificity low, so ordinary selectors can override the shared styles.

The base stylesheet applies to the whole document. For an existing theme,
start with tokens and an adapter if you need to preserve its element styling.
The library does not set page width, navigation layout, or slide dimensions.

## Supported Markup

Use semantic HTML for headings, lists, links, code, tables, and form controls.
Classes add repeated visual patterns; they do not replace accessible markup or
interaction behavior. Labels, focus order, tab selection, and application
actions belong to the consuming project.

## License

The library is licensed under LGPL-3.0-only. Keep `LICENSE`, `COPYING`, and
`NOTICE` with redistributed copies and retain access to the corresponding
source. Generated CSS and Sass retain the license banner.
