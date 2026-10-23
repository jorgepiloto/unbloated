# Unbloated

[![Nightly CI](https://github.com/jorgepiloto/unbloated/actions/workflows/night.yml/badge.svg)](https://github.com/jorgepiloto/unbloated/actions/workflows/night.yml)
[![License: LGPL-3.0-only](https://img.shields.io/badge/License-LGPL--3.0--only-white.svg?labelColor=black)](LICENSE)

## About

Monospace grayscale CSS library for engineers.

Unbloated styles semantic HTML with system monospace fonts, grayscale colors,
and square corners. It has no runtime JavaScript, runtime dependencies, remote
fonts, or remote assets. Your site supplies the layout and application behavior.

Design values live in `src/tokens.json`; the build generates CSS custom
properties, Sass variables, and the complete stylesheet.

## Installation

Check the [prerequisites](https://jorgemartinez.space/projects/unbloated/version/stable/getting-started/prerequisites/), then
follow the [installation guide](https://jorgemartinez.space/projects/unbloated/version/stable/getting-started/installation/).
The npm and CDN examples require publication of version `0.1.0`. After
publication, install the package:

```sh
npm install --save-dev --save-exact unbloated@0.1.0
```

Import the stylesheet with a build tool that supports CSS imports:

```js
import "unbloated/unbloat.css";
```

You can also copy `node_modules/unbloated/dist/unbloat.css` into your public
assets and load it with a stylesheet link. To use the package before
publication, [build and install a local tarball](https://jorgemartinez.space/projects/unbloated/version/stable/getting-started/installation/#build-a-local-package).

The repository also contains adapters in `packages/sphinx`, `packages/quarto`,
`packages/hugo`, and `packages/latex`. They bundle the core stylesheet at build
time; consuming projects do not need Node.js at runtime. The LaTeX adapter
translates the built CSS tokens into a TeX style for its technical book class.
See
[Adapter Packages](CONTRIBUTING.md#adapter-packages) for builds and ownership
rules, and the [Hugo adapter](packages/hugo/README.md) for website setup.

The [LaTeX adapter guide](packages/latex/README.md) documents CSS-to-TeX mappings,
compilation, and installation from its packaged archive.

## Documentation

The [documentation](https://jorgemartinez.space/projects/unbloated/version/stable/) covers:

- [Getting Started](https://jorgemartinez.space/projects/unbloated/version/stable/getting-started/): prerequisites,
  installation, stylesheet selection, and Sass tokens.
- [Components](https://jorgemartinez.space/projects/unbloated/version/stable/components/): live examples, HTML markup,
  styling, and keyboard behavior.
- [Source Reference](https://jorgemartinez.space/projects/unbloated/version/stable/reference/source/): build APIs, local
  servers, repository configuration, and verification commands.
- [Contributing](CONTRIBUTING.md): development setup, checks, and pull requests.
- [Release Setup](https://jorgemartinez.space/projects/unbloated/version/stable/releasing/): npm publishing, documentation
  deployment, and CI artifacts.

For local source navigation, see [Core Sources](src/README.md),
[Build and Verification Scripts](scripts/README.md), and
[Platform Packages](packages/README.md). They describe file ownership, API
contracts, commands, environment variables, and package-specific requirements.

See [Preview the Documentation](https://jorgemartinez.space/projects/unbloated/version/stable/getting-started/installation/#preview-the-documentation)
to build and serve the site locally. Package tarballs are available from
successful [workflow runs](https://github.com/jorgepiloto/unbloated/actions);
published releases attach the same tarball to the
[GitHub release](https://github.com/jorgepiloto/unbloated/releases).

## Troubleshooting

[Open an issue](https://github.com/jorgepiloto/unbloated/issues/new) with the
package and browser versions, the steps to reproduce the problem, and the
expected and actual results. Include relevant HTML, CSS, and error messages.

Report vulnerabilities privately as described in [Security](SECURITY.md).

## License

Unbloated is licensed under the GNU Lesser General Public License, version 3
only (`LGPL-3.0-only`). Read [LICENSE](LICENSE) and the incorporated GNU GPLv3
terms in [COPYING](COPYING). Copyright and warranty notices are in
[NOTICE](NOTICE).

The Sphinx adapter retains its GPL-3.0-only license in
`packages/sphinx/LICENSE`. The Hugo adapter uses LGPL-3.0-only.

Keep the license files with redistributed copies and retain access to the
corresponding source. The npm tarball includes the source styles, token
definitions, and build script.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for changes by version.
