# Unbloated

## About

Monospace grayscale CSS library for engineers.

Unbloated provides shared styles for monospace type, black and white surfaces,
grayscale details, and square corners. It
contains no runtime JavaScript, runtime dependencies, remote fonts, or remote
assets.

The [documentation](docs/content/_index.md) covers installation, design tokens, source
modules, and components with live style examples. Build it locally with Hugo
using the [documentation prerequisites](docs/content/getting-started/prerequisites.md).

Design values live in `src/tokens.json`. A dependency-free build generates CSS
custom properties, Sass variables, and a complete stylesheet. Websites and
themes keep their own layouts and adapters for generated HTML.

The package starts at version `0.1.0`. The npm and CDN examples below become
available after that version is published. You can build and install a local
tarball now.

## Prerequisites

To load the built CSS, you need a browser that supports CSS custom properties,
`:where()`, and `:focus-visible`. No Node.js installation is needed in the browser.
The test suite covers Chromium, Firefox, and WebKit.

To build or contribute, use Node.js 22.14 or newer and npm. Node.js 24 is the
development default in `.nvmrc`. Browser tests also need the Playwright browser
downloads and their operating system dependencies.

## Getting Started

### Install From npm

After publication, install an exact version:

```sh
npm install --save-dev --save-exact unbloated@0.1.0
```

The complete stylesheet is `node_modules/unbloated/dist/unbloat.css`. Copy it to
your public assets directory during the build, or import it through a tool that
supports CSS package imports:

```js
import "unbloated/unbloat.css";
```

For a local asset, add this to your HTML:

```html
<link rel="stylesheet" href="/assets/unbloat.css" />
```

### Download the Stylesheet

After publication, download a pinned version from UNPKG:

```sh
curl -fL https://unpkg.com/unbloated@0.1.0/dist/unbloat.css -o unbloat.css
```

You can also load the same URL directly:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/unbloated@0.1.0/dist/unbloat.css"
/>
```

Serve a local copy if you want the site to work without a CDN request. For CDN
use, a checksum generated from the exact release can be supplied through the
HTML `integrity` attribute with `crossorigin="anonymous"`. Version pinning and
integrity serve different purposes. See the
[Subresource Integrity documentation](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

### Build a Local Package

From this repository:

```sh
npm ci --ignore-scripts
npm run build
npm pack --ignore-scripts
```

From a consuming project, install the generated tarball:

```sh
npm install --save-dev --save-exact /path/to/unbloated/unbloated-0.1.0.tgz
```

Or copy `dist/unbloat.css` directly. Keep `LICENSE`, `COPYING`, and `NOTICE` with
redistributed copies and retain access to the corresponding source.

## User Guide

### Choose the CSS You Need

| File                  | Contents                                              |
| --------------------- | ----------------------------------------------------- |
| `dist/unbloat.css`    | Tokens, semantic HTML styles, and optional components |
| `dist/tokens.css`     | CSS custom properties only                            |
| `dist/base.css`       | Styles for semantic HTML elements                     |
| `dist/components.css` | Optional classes for repeated visual patterns         |
| `dist/_tokens.scss`   | Sass variables, each declared with `!default`         |
| `src/tokens.json`     | Canonical design values                               |

When using individual CSS files, load tokens first, then base styles, then
components. Load the project adapter last. The styles use `:where()` to keep
selector specificity low. Existing framework styles may have higher specificity;
the adapter must handle those selectors explicitly.

The base stylesheet applies to the whole document. For an existing theme,
start with tokens and an adapter if you need to preserve its element styling.
No shared stylesheet sets page width, slide dimensions, navigation layout, or
mobile font scaling.

### Use Semantic HTML

Headings, links, lists, tables, code blocks, and form controls work without
custom classes. Inputs need labels, tables need appropriate header cells, and
buttons need the correct `type` inside forms. Keyboard focus indicators remain
visible. Links remain underlined.

```html
<label for="name">Name</label>
<input id="name" name="name" autocomplete="name" />
<button type="button">Preview</button>
```

### Use Components

| Class             | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `unbloat-panel`   | Bordered surface with a hard shadow           |
| `unbloat-button`  | Button appearance for a native button or link |
| `unbloat-tag`     | Compact label or link                         |
| `unbloat-callout` | Bordered note with a thicker leading edge     |
| `unbloat-tabs`    | Wrapping layout for tab controls              |
| `unbloat-inverse` | White text on a black surface                 |

```html
<aside class="unbloat-callout">
  <p>Build the assets before publishing the site.</p>
</aside>
<a class="unbloat-button" href="/guide/">Read the Guide</a>
```

These classes provide appearance. Tabs still need accessible markup, keyboard
navigation, and selection behavior supplied by the consuming project. The
package does not implement interactions.

### Configure Typography

The default stack uses system monospace fonts. The package does not bundle a
font. A project can supply its own properly licensed, self-hosted font:

```css
:root {
  --unbloat-font-family: "My Mono", monospace;
}
```

Available token groups are `color`, `font`, `line-height`, `heading`, `space`,
`border`, `shadow`, and `focus`. Names follow
`--unbloat-<group>-<name>`, for example `--unbloat-space-3` and
`--unbloat-color-surface`.

Keep fonts monospace, colors grayscale, and `--unbloat-border-radius` at zero.
Changes to text, background, or focus colors must preserve readable contrast.
Consumer overrides are possible; they are not a guarantee that the result still
follows unbloat.

### Use Sass Tokens

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
host tool cannot resolve `@use`, use the generated values through the mechanism
that its Sass compiler supports.

### Develop and Test

```sh
npm ci --ignore-scripts
npx --no-install playwright install --with-deps chromium firefox webkit
npm run build
npm run verify
npm run preview
```

Open `http://127.0.0.1:4173` for the reference page. The preview server binds only
to loopback and serves an explicit list of public files.

Edit `src/`, then run `npm run format` and `npm run build`. Git ignores `dist/`;
commit the source changes. Each CI workflow builds the distribution before
verification. `build:check` compares two builds in temporary directories without
requiring an existing `dist/`. Node tests validate tokens,
Sass consumption, licenses, exports, and installation from the actual tarball.
Browser tests check grayscale colors, typography, square corners, focus,
hover, narrow viewports, and consumer overrides. They save screenshots for
inspection; they do not compare screenshot baselines.

The workflows run on pull requests, version tags, and daily at 08:00 in
`Europe/Madrid`. The npm tarball includes the generated files even though Git
ignores them. Pushing a stable version tag triggers `release.yml`, which checks
the source, builds the tarball, publishes it to npm through trusted publishing,
and creates a GitHub release with the same tarball attached. See
[Contributing](CONTRIBUTING.md), [Release Setup](docs/content/releasing.md), and
[Security](SECURITY.md).

### Build the Documentation

Install the pinned Hugo binary, then build and serve the documentation:

```sh
npm run docs:setup
npm run docs:build
npm run docs:preview
```

On macOS and Windows, install Hugo 0.167.0 from the
[official Hugo installation guide](https://gohugo.io/installation/) instead of
`docs:setup`. Set `HUGO_BIN` if it is not on PATH. Linux setup verifies the archive
against the SHA-256 in `docs/hugo-lock.json`.

Open `http://127.0.0.1:4174`. Use `npm run docs:dev` for Markdown editing with
live reload at `http://127.0.0.1:8000`. The site has Home, Getting Started, and
Components sections. Source comments and the
[Source Reference](docs/content/reference/source.md) describe the implementation.
The footer identifies the package version. The site uses this checkout's generated
CSS with a layout modeled on `web`; heading IDs remain available for links,
without permalink controls. `npm run test:docs` checks navigation, live styles,
tab behavior, and mobile layout.

## License

Unbloated is licensed under the GNU Lesser General Public License, version 3
only (`LGPL-3.0-only`). Read [LICENSE](LICENSE) and the incorporated GNU GPLv3
terms in [COPYING](COPYING). Copyright and warranty notices are in
[NOTICE](NOTICE).

The npm tarball includes the source styles, token definitions, and build script
needed to regenerate its CSS and Sass outputs. No third-party font assets are
included.
