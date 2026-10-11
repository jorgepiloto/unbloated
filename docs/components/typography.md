# Typography

Headings, paragraphs, lists, links, quotations, and code use semantic HTML.
The font stack ends in `monospace`; no font is downloaded. Body text uses a
line height of `1.6`, and headings use `1.2`.

<div class="component-demo">
  <h2>A Section Heading</h2>
  <h3>A Subsection Heading</h3>
  <p>A paragraph with <strong>strong text</strong>, <em>emphasis</em>, and an <a href="#links-and-focus">underlined link</a>.</p>
  <p><small>Supporting text uses the muted grayscale color.</small></p>
  <ul><li>One shared palette.</li><li>System monospace fonts.</li></ul>
  <blockquote><p>Keep the content readable.</p></blockquote>
  <p>Use <code>unbloat.css</code> and press <kbd>Tab</kbd> to inspect focus.</p>
  <pre><code>npm run build</code></pre>
</div>

```html
<h2>A Section Heading</h2>
<p>A paragraph with <strong>strong text</strong> and <em>emphasis</em>.</p>
<blockquote><p>Keep the content readable.</p></blockquote>
<p>Use <code>unbloat.css</code> and press <kbd>Tab</kbd>.</p>
<pre><code>npm run build</code></pre>
```

## Links and Focus

Links remain underlined. Hover increases the underline thickness to `2px`.
Keyboard focus uses a `2px` outline with a `3px` offset, shared with other
focusable elements. Avoid removing that outline in an adapter.

```html
<a href="../controls/">Inspect Form Controls</a>
```

## Lists and Quotations

Use `ul` for unordered items, `ol` for steps, and `dl` for terms and
definitions. Blockquotes have a `3px` leading border. Inline code has a muted
surface; preformatted blocks have padding, a border, and horizontal scrolling.

## Customize Type

Set `--unbloat-font-family` in your adapter to use another monospace font.
Use a licensed, self-hosted font if you need a specific family. The
`font`, `line-height`, and `heading` groups control type sizes and line spacing.
