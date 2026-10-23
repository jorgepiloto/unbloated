# Platform Packages

The [core sources](../src/README.md) own shared design values and semantic CSS.
These packages own platform markup, navigation, and layout. Adapter versions
are independent of the core version recorded in each generated provenance file.

| Package  | Consumer Requirements                                                                                                                   | Guide                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `sphinx` | Python 3.12+, Sphinx 9.0+, and a browser supporting the adapter CSS. Node is a contributor tool, not a Python installation requirement. | [Installation, configuration, and source map](sphinx/README.rst) |
| `hugo`   | Hugo Extended 0.144.1+, a host PostCSS toolchain, and modern browser CSS. Optional widgets also load JavaScript.                        | [Site configuration and shortcodes](hugo/README.md)              |
| `quarto` | Quarto with Reveal.js support. A staged or packaged extension includes the core CSS.                                                    | [Installation and slides](quarto/README.md)                      |
| `latex`  | LuaLaTeX and the TeX packages listed in its guide; latexmk for the provided checks. This standalone class does not consume core tokens. | [Book class and examples](latex/README.md)                       |

## Build and Distribution

Run from the monorepo root with the locked npm dependencies and Python build
tools installed:

```sh
npm run build:adapters
npm run check:adapters
npm run pack:adapters
python3 scripts/check-adapter-artifacts.py
```

`build:adapters` copies `dist/unbloat.css` unchanged to Sphinx's static CSS,
Hugo's CSS assets, and the Quarto extension. Each copy includes
`unbloated-core.json` with the core name, version, and SHA-256 digest, plus
`LICENSE`, `COPYING`, and `NOTICE` under `licenses/unbloated/`.

Generated bundles stay out of Git. Rebuild them after core changes; packaging
rejects missing or stale bytes. `.artifacts/` contains the Sphinx wheel and source
distribution, Hugo npm tarball, and Quarto archive. The archive's Quarto filename
currently uses the core version; the extension version remains in `_extension.yml`.
The workflows upload adapter distributions without publishing them to package
registries. See [shared setup and checks](../CONTRIBUTING.md#adapter-packages)
and [script contracts](../scripts/README.md).

## Source Ownership

| Location                                                     | Responsibility                                                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `sphinx/src/sphinx_unbloated_theme/__init__.py`              | Theme registration, AutoAPI template location, toctree navigation, and builder-aware 404 context.        |
| `sphinx/src/sphinx_unbloated_theme/theme/`                   | Jinja templates, Sphinx layout CSS, AutoAPI templates, browser enhancement scripts, and bundled notices. |
| `sphinx/hatch_build.py`                                      | Validate staged CSS provenance before Python builds.                                                     |
| `sphinx/doc/`, `sphinx/examples/`, `sphinx/tests/`           | Sphinx documentation, executable scientific demonstrations, and builder/browser regressions.             |
| `hugo/layouts/`                                              | Go templates, metadata, discovery filters, feeds, sitemaps, and shortcodes.                              |
| `hugo/assets/`, `hugo/static/`                               | Host-processed CSS and tabs; static search and legacy navigation scripts.                                |
| `quarto/_extensions/unbloated/`                              | Format manifest, Reveal SCSS, generated core bundle, and scoped footer preparation for scroll/print.     |
| `quarto/template.qmd`                                        | Starter slide document.                                                                                  |
| `latex/unbloated-book.cls`, `latex/example/`, `latex/tests/` | LuaLaTeX class, technical book example, and compilation checks.                                          |

Keep aliases to core properties in adapter CSS. Do not introduce independent
palettes, font stacks, shadows, or definitions of `--unbloat-*` properties.
Adapter-specific geometry remains local. Source comments explain platform
constraints; package guides document installation and consumer inputs. Preserve
third-party templates, fonts, icons, and their existing licenses and attribution.

The root `LICENSE`, `COPYING`, and `NOTICE` are the canonical core/Hugo terms
and notice. Generated adapter bundles carry exact copies in their license
directories; Hugo does not maintain another top-level copy. Sphinx retains its
own GPL license and third-party notices. Its author metadata lives in
`pyproject.toml`; contribution history lives in Git.

Browser builds and automated tests establish only their tested configurations.
[ROADMAP.md](../ROADMAP.md) records remaining acceptance checks and known defects;
the presence of a documented option does not certify accessibility or release
readiness across every generator, browser, or output format.
