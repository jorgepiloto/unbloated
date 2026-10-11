# Tables and Details

## Tables

Tables use collapsed borders, `0.5rem` cell padding, start-aligned text, and a
muted header surface. Captions and scoped headers describe the data for readers
and assistive technology. The documentation adapter adds horizontal scrolling
for wide tables.

<div class="component-demo">
  <table>
    <caption>Stylesheet Contents</caption>
    <thead><tr><th scope="col">File</th><th scope="col">Purpose</th></tr></thead>
    <tbody>
      <tr><th scope="row">unbloat.css</th><td>Complete stylesheet</td></tr>
      <tr><th scope="row">tokens.css</th><td>Design values</td></tr>
    </tbody>
  </table>
</div>

```html
<table>
  <caption>
    Stylesheet Contents
  </caption>
  <thead>
    <tr>
      <th scope="col">File</th>
      <th scope="col">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">unbloat.css</th>
      <td>Complete stylesheet</td>
    </tr>
  </tbody>
</table>
```

## Details

Use native `details` and `summary` elements for a disclosure. Summary uses a
pointer cursor and the shared focus indicator. Opening and closing work
without JavaScript.

<div class="component-demo">
  <details>
    <summary>Package Contents</summary>
    <p>CSS, Sass tokens, and the source needed to rebuild them.</p>
  </details>
</div>

```html
<details>
  <summary>Package Contents</summary>
  <p>CSS, Sass tokens, and the source needed to rebuild them.</p>
</details>
```

## Media and Separators

Images, videos, and SVG elements have a maximum width of `100%` and automatic
height. Supply appropriate alternate text for informative images. Figures have
no inline margin. Horizontal rules use a `1px` leading border and the fourth
spacing token for their block margin.
