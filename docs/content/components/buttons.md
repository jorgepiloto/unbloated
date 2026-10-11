---
title: Buttons and Tags
---

## Buttons

`unbloat-button` gives a native button or link a bordered surface and a hard
shadow. Its padding uses the first two spacing tokens. Hover uses inverse text
and surface colors. A disabled button keeps its base colors and native disabled
behavior.

<div class="component-demo">
  <button type="button" class="unbloat-button">Preview</button>
  <button type="button" class="unbloat-button" disabled>Unavailable</button>
  <a class="unbloat-button" href="../panels/">Read the Guide</a>
</div>

```html
<button type="button" class="unbloat-button">Preview</button>
<button type="button" class="unbloat-button" disabled>Unavailable</button>
<a class="unbloat-button" href="/guide/">Read the Guide</a>
```

Use a button for an action and a link for navigation. The CSS does not disable
links; use a native disabled button when an action is unavailable.

## Tags

`unbloat-tag` is a compact label with a border and hard shadow. A tag on an
anchor inverts on hover. A tag on a span stays a static label.

<div class="component-demo">
  <span class="unbloat-tag">CSS</span>
  <a class="unbloat-tag" href="../">Components</a>
</div>

```html
<span class="unbloat-tag">CSS</span>
<a class="unbloat-tag" href="/components/">Components</a>
```

Both classes inherit the document font. Their shadow uses
`--unbloat-shadow-offset` and `--unbloat-color-shadow`.
