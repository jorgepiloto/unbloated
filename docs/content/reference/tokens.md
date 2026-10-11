---
title: Design Tokens
---

`src/tokens.json` is the canonical design source. The build turns each
`group.name` into a CSS property `--unbloat-group-name` and a Sass variable
`$unbloat-group-name`. The table lists the defaults in this checkout.

## Default Values

| Group         | Name              | Value                                                                          |
| ------------- | ----------------- | ------------------------------------------------------------------------------ |
| `color`       | `text`            | `#000000`                                                                      |
| `color`       | `surface`         | `#ffffff`                                                                      |
| `color`       | `surface-muted`   | `#ededed`                                                                      |
| `color`       | `canvas`          | `#dddddd`                                                                      |
| `color`       | `muted`           | `#555555`                                                                      |
| `color`       | `border`          | `#000000`                                                                      |
| `color`       | `shadow`          | `#bbbbbb`                                                                      |
| `color`       | `inverse-text`    | `#ffffff`                                                                      |
| `color`       | `inverse-surface` | `#000000`                                                                      |
| `font`        | `family`          | `ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace` |
| `font`        | `size`            | `1rem`                                                                         |
| `line-height` | `body`            | `1.6`                                                                          |
| `line-height` | `heading`         | `1.2`                                                                          |
| `heading`     | `size-1`          | `2rem`                                                                         |
| `heading`     | `size-2`          | `1.5rem`                                                                       |
| `heading`     | `size-3`          | `1.3rem`                                                                       |
| `heading`     | `size-4`          | `1.17rem`                                                                      |
| `heading`     | `size-5`          | `1.1rem`                                                                       |
| `heading`     | `size-6`          | `1rem`                                                                         |
| `space`       | `1`               | `0.25rem`                                                                      |
| `space`       | `2`               | `0.5rem`                                                                       |
| `space`       | `3`               | `1rem`                                                                         |
| `space`       | `4`               | `1.5rem`                                                                       |
| `space`       | `5`               | `2rem`                                                                         |
| `border`      | `width`           | `1px`                                                                          |
| `border`      | `radius`          | `0`                                                                            |
| `shadow`      | `offset`          | `2px`                                                                          |
| `focus`       | `width`           | `2px`                                                                          |
| `focus`       | `offset`          | `3px`                                                                          |

## Override CSS Properties

Load your adapter after the library:

```css
:root {
  --unbloat-font-family: "My Mono", monospace;
  --unbloat-space-3: 1.25rem;
}
```

The default font stack uses installed fonts and falls back to monospace. Keep
consumer fonts monospace, colors grayscale, and the radius at zero. Check text,
background, and focus contrast after changing color values.

## Use Sass Variables

Include `node_modules` in your Sass load path:

```scss
@use "unbloated/dist/tokens" as unbloat;

.example {
  color: unbloat.$unbloat-color-text;
  font-family: unbloat.$unbloat-font-family;
}
```

The generated variables use `!default`, so Sass consumers can configure them
with `@use ... with (...)`. Sass variables expose values; they do not generate
the base or component styles on their own.

## Validation Rules

All eight supported groups must exist, and unknown groups are rejected. Names
use lowercase letters, digits, and hyphen-separated segments. Values are strings.
Colors must be grayscale hex values with equal red, green, and blue channels.
The font-family value must follow the supported comma-separated grammar and
end in `monospace`. Line heights use unitless values from `1` up to, but not
including, `3`. Other values use zero or nonnegative `rem` and `px` lengths.
`border.radius` must be `0`.

The validator checks these constraints before writing values into CSS or Sass.
It also rejects references to undefined `unbloat-` tokens in the shared CSS.
Consumer overrides happen after the build and are not checked by this validator.
