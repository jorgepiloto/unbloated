---
title: Tabs
---

`unbloat-tabs` lays out tab controls in a wrapping flex row with a `0.5rem` gap.
Controls with `aria-selected="true"` use inverse colors. The CSS package does
not implement tab selection, focus movement, or panel visibility.

The example below adds those behaviors with `docs/assets/tabs.js`. Click a tab
or use Left Arrow, Right Arrow, Home, and End while a tab has focus.
Both panels are visible until the script successfully initializes, so their
content remains readable when JavaScript is disabled or fails to load.

<div class="component-demo">
  <div class="unbloat-tabs" role="tablist" aria-label="Stylesheet example" data-demo-tabs>
    <button type="button" id="tab-complete" role="tab" aria-selected="true" aria-controls="panel-complete" tabindex="0">Complete</button>
    <button type="button" id="tab-tokens" role="tab" aria-selected="false" aria-controls="panel-tokens" tabindex="-1">Tokens</button>
  </div>
  <div id="panel-complete" role="tabpanel" aria-labelledby="tab-complete" tabindex="0"><h2 class="tab-panel-title">Complete</h2><p>Load <code>unbloat.css</code> for tokens, base styles, and components.</p></div>
  <div id="panel-tokens" role="tabpanel" aria-labelledby="tab-tokens" tabindex="0"><h2 class="tab-panel-title">Tokens</h2><p>Load <code>tokens.css</code> when your adapter supplies the element styles.</p></div>
</div>

```html
<div class="unbloat-tabs" role="tablist" aria-label="Stylesheet example">
  <button
    type="button"
    id="tab-complete"
    role="tab"
    aria-selected="true"
    aria-controls="panel-complete"
    tabindex="0"
  >
    Complete
  </button>
  <button
    type="button"
    id="tab-tokens"
    role="tab"
    aria-selected="false"
    aria-controls="panel-tokens"
    tabindex="-1"
  >
    Tokens
  </button>
</div>
<div
  id="panel-complete"
  role="tabpanel"
  aria-labelledby="tab-complete"
  tabindex="0"
>
  <h2 class="tab-panel-title">Complete</h2>
  Complete stylesheet content.
</div>
<div
  id="panel-tokens"
  role="tabpanel"
  aria-labelledby="tab-tokens"
  tabindex="0"
>
  <h2 class="tab-panel-title">Tokens</h2>
  Token stylesheet content.
</div>
```

## Interaction Contract

Keep exactly one tab selected and reachable through the normal Tab sequence.
Update `aria-selected`, `tabindex`, and the associated panels' `hidden`
attributes together. Each tab's `aria-controls` points to a panel with a matching
`aria-labelledby` value. Left and Right Arrow move between tabs and wrap at the
ends; Home selects the first tab and End selects the last.

The documentation adapter uses automatic activation when focus moves. It is
an example for this small tab set, not a general interaction library. Supply
your own tested behavior in the consuming application.

The documentation's print styles show both panels and their headings and hide
the tab controls. These CSS rules leave screen selection unchanged, including
after repeated print transitions. They also apply when the tab script is unavailable.
The core supplies appearance only; consumers own equivalent print behavior.
