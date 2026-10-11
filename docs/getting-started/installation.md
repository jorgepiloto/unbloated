# Installation

Version `0.1.0` is the initial package version. The npm and CDN examples work
after that version is published. You can build and install a local tarball now.

## Install From npm

After publication, install an exact version:

```sh
npm install --save-dev --save-exact unbloated@0.1.0
```

Import the complete stylesheet with a build tool that supports CSS imports:

```js
import "unbloated/unbloat.css";
```

Or copy `node_modules/unbloated/dist/unbloat.css` into your public assets and
load it from HTML:

```html
<link rel="stylesheet" href="/assets/unbloat.css" />
```

## Load Separate Stylesheets

Load the token definitions before the rules that use them:

```html
<link rel="stylesheet" href="/assets/tokens.css" />
<link rel="stylesheet" href="/assets/base.css" />
<link rel="stylesheet" href="/assets/components.css" />
<link rel="stylesheet" href="/assets/adapter.css" />
```

Copy those files from `node_modules/unbloated/dist/`. Your adapter owns page
layout and integration with other themes.

## Build a Local Package

From this repository:

```sh
npm ci --ignore-scripts
npm run build
npm pack --ignore-scripts
```

From a consuming project:

```sh
npm install --save-dev --save-exact /path/to/unbloated/unbloated-0.1.0.tgz
```

You can also copy `dist/unbloat.css` directly. Keep the license files and source
access when redistributing it.

## Download From a CDN

After publication, download a pinned version:

```sh
curl -fL https://unpkg.com/unbloated@0.1.0/dist/unbloat.css -o unbloat.css
```

Serve the local copy if you want to avoid a CDN request at page load.

## Preview the Documentation

After installing the [documentation prerequisites](prerequisites.md#build-the-documentation):

```sh
npm run docs:dev
```

Open `http://127.0.0.1:8000`. To build and inspect the static site:

```sh
npm run docs:build
npm run docs:preview
```

The preview runs at `http://127.0.0.1:4174`. The generated `site/` directory can
be served by a static host. Nothing is published by these commands.
