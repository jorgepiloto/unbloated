# Unbloated

## About

Monospace grayscale CSS library for engineers.

Unbloated styles semantic HTML with system monospace fonts, grayscale colors,
and square corners. It has no runtime JavaScript, runtime dependencies, remote
fonts, or remote assets. Your site supplies the layout and application behavior.

The [documentation](docs/content/_index.md) includes installation instructions,
design tokens, and live component examples. Design values live in
`src/tokens.json`; the build generates CSS custom properties, Sass variables,
and the complete stylesheet.

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

Serve a local copy to avoid a CDN request at page load. To verify CDN assets,
set the HTML `integrity` attribute to a checksum of the exact release and add
`crossorigin="anonymous"`. Pinning selects the version; integrity checks the
downloaded bytes. See the
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

Use `unbloat.css` for the complete library, or load tokens, base styles, and
components separately. See [Stylesheets](docs/content/getting-started/about.md#stylesheets)
for the files, load order, and guidance for existing themes.

Native HTML elements need no classes. The optional classes add panels,
buttons, tags, callouts, tabs, and inverse surfaces. The
[component pages](docs/content/components/_index.md) show their markup and states.

To customize the library, see
[Typography](docs/content/components/typography.md#customize-type) and
[Sass Tokens](docs/content/getting-started/about.md#use-sass-tokens).

## Development

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
commit the source changes. The [Source Reference](docs/content/reference/source.md#verification)
describes the checks. Browser tests save screenshots for inspection, not baseline
comparison.

CI runs on pull requests, version tags, and daily at 08:00 in `Europe/Madrid`.
Stable version tags trigger npm publication and a GitHub release. See
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
live reload at `http://127.0.0.1:8000`. The site uses this checkout's generated
CSS. Run `npm run test:docs` to check navigation, live styles, tab behavior,
and mobile layout.

## License

Unbloated is licensed under the GNU Lesser General Public License, version 3
only (`LGPL-3.0-only`). Read [LICENSE](LICENSE) and the incorporated GNU GPLv3
terms in [COPYING](COPYING). Copyright and warranty notices are in
[NOTICE](NOTICE).

The npm tarball includes the source styles, token definitions, and build script
needed to regenerate its CSS and Sass outputs. No third-party font assets are
included.
