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

The base stylesheet applies to the whole document. To preserve an existing
theme's element styles, start with tokens and an adapter instead. Set page
width, navigation layout, slide dimensions, and mobile font scaling in your
site's stylesheet.

## Supported Markup

Use semantic HTML for headings, lists, links, code, tables, and form controls.
Give inputs labels and tables scoped header cells, and set button types
explicitly inside forms. Keep keyboard focus visible and implement application
actions and tab selection in your own code.

## Use Sass Tokens

For tools that resolve packages through Sass load paths:

```scss
@use "unbloated/dist/tokens" as unbloat;

$body-color: unbloat.$unbloat-color-text;
$body-bg: unbloat.$unbloat-color-surface;
$font-family-monospace: unbloat.$unbloat-font-family;
```

Include `node_modules` in the Sass load path. For Quarto, copy `_tokens.scss`
into the extension and load it within the `scss:defaults` section of the theme.
Keep slide layout and Quarto-specific selectors in that extension. If the
host tool cannot resolve `@use`, load the generated values through its supported
Sass mechanism.

## License

The library is licensed under LGPL-3.0-only. Keep `LICENSE`, `COPYING`, and
`NOTICE` with redistributed copies and retain access to the corresponding
source. Generated CSS and Sass retain the license banner.
