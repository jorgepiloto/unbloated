---
title: Panels and Callouts
---

## Panels

`unbloat-panel` groups related content on a bordered white surface. It uses
`1rem` padding and a hard gray shadow offset by `2px`.

<div class="component-demo">
  <section class="unbloat-panel" aria-labelledby="panel-title">
    <h3 id="panel-title">Build Output</h3>
    <p>The complete stylesheet includes tokens, base styles, and components.</p>
  </section>
</div>

```html
<section class="unbloat-panel" aria-labelledby="panel-title">
  <h3 id="panel-title">Build Output</h3>
  <p>The complete stylesheet includes tokens, base styles, and components.</p>
</section>
```

## Callouts

`unbloat-callout` marks a note with the same surface and padding, plus a `3px`
leading border. It does not have a shadow. The leading edge follows the
document's writing direction.

<div class="component-demo">
  <aside class="unbloat-callout"><p>Load tokens before separate component stylesheets.</p></aside>
</div>

```html
<aside class="unbloat-callout">
  <p>Load tokens before separate component stylesheets.</p>
</aside>
```

## Inverse Surfaces

`unbloat-inverse` sets white text on a black surface. It adds no padding or
layout rules, so combine it with a panel or your own adapter when needed.

<div class="component-demo">
  <section class="unbloat-panel unbloat-inverse" aria-labelledby="inverse-title">
    <h3 id="inverse-title">Inverse Surface</h3>
    <p>White text on a black surface.</p>
  </section>
</div>

```html
<section class="unbloat-panel unbloat-inverse">
  <h3>Inverse Surface</h3>
  <p>White text on a black surface.</p>
</section>
```

Nested elements that set their own background or muted text color need explicit
adapter rules on an inverse surface. The class does not rewrite those styles.
