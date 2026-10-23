---
title: Form Controls
---

Checkboxes distinguish unchecked, checked, and JavaScript-set `indeterminate`
states. Mixed state uses a horizontal mark; forced colors restores native
checkbox and radio appearance.

Inputs, selects, textareas, and buttons inherit the document font. They use a
white surface, a `1px` black border, square corners, and the shared focus outline.
The documentation arranges this form in a grid; the library does not set a
form layout or field width.

<div class="component-demo">
  <form class="demo-controls" aria-label="Example form">
    <label for="demo-name">Name</label>
    <input id="demo-name" name="name" placeholder="Your name" autocomplete="name" />
    <label for="demo-topic">Topic</label>
    <select id="demo-topic" name="topic"><option>Website</option><option>Documentation</option></select>
    <label for="demo-notes">Notes</label>
    <textarea id="demo-notes" name="notes" rows="3"></textarea>
    <label><input type="checkbox" name="preview" /> Show preview</label>
    <label><input type="radio" name="mode" value="light" checked /> Light appearance</label>
    <label><input type="radio" name="mode" value="inverse" /> Inverse appearance</label>
    <div><button type="button">Default Button</button> <button type="button" disabled>Disabled Button</button></div>
  </form>
</div>

```html
<label for="name">Name</label>
<input id="name" name="name" autocomplete="name" />
<label><input type="checkbox" name="preview" /> Show preview</label>
<button type="button">Default Button</button>
<button type="button" disabled>Disabled Button</button>
```

## States

Enabled buttons and submit inputs invert their colors on hover. Disabled
controls use reduced opacity and a `not-allowed` cursor. Placeholders use the
muted text color. Textareas resize vertically.

Checkboxes and radio buttons use square, `1em` controls. Checked controls show
a black fill with an inset white border. Native input semantics preserve
selection and keyboard behavior. In forced-color mode, selected controls use
the system `Highlight` color.

## Accessible Labels

Give each field a label with a matching `for` and `id`, or wrap the control in
its label. Use `type="button"` for buttons that should not submit a form.
Press Tab to move between controls and Space to toggle a focused checkbox.
