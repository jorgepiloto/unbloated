# Platform Packages

The [core sources](../src/README.md) own shared design values and semantic CSS.
These packages own platform markup, navigation, and layout. Adapter versions
are independent of the core version recorded in each generated provenance file.

| Package  | Consumer Requirements                                                                                                                                         | Guide                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `sphinx` | Python 3.12+, Sphinx 9.0+, and a browser supporting the adapter CSS. Node is a contributor tool, not a Python installation requirement.                       | [Installation, configuration, and source map](sphinx/README.rst) |
| `hugo`   | Hugo Extended 0.144.1+, a host PostCSS toolchain, and modern browser CSS. Optional widgets also load JavaScript.                                              | [Site configuration and shortcodes](hugo/README.md)              |
| `quarto` | Quarto with Reveal.js support. A staged or packaged extension includes the core CSS.                                                                          | [Installation and slides](quarto/README.md)                      |
| `latex`  | LuaLaTeX and the TeX packages listed in its guide; latexmk for the provided checks. The class consumes generated styles translated from the bundled core CSS. | [Book class and examples](latex/README.md)                       |

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
Hugo's CSS assets, the Quarto extension, and the LaTeX adapter. Each copy includes
`unbloated-core.json` with the core name, version, and SHA-256 digest, plus
`LICENSE`, `COPYING`, and `NOTICE` under `licenses/unbloated/`.

LaTeX also receives `unbloated-tokens.sty`, generated from the built CSS custom
properties. Its provenance adds `texSha256` for that translation.

Generated bundles stay out of Git. Rebuild them after core changes; packaging
rejects missing or stale bytes. `.cache/artifacts/` contains the Sphinx wheel and source
distribution, Hugo npm tarball, Quarto archive, and LaTeX archive. The archive's Quarto filename
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
| `latex/unbloated-book.cls`, `latex/example/`, `latex/tests/` | LuaLaTeX class consuming generated core styles, technical book example, and compilation checks.          |

Keep aliases to core properties in adapter CSS. LaTeX styles use the generated
`\UnbloatedToken` values and `unbloat-*` color names. Do not introduce independent
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
[Rendering Regressions](../CONTRIBUTING.md#rendering-regressions) documents the
consumer checks and their requirements;
the presence of a documented option does not certify accessibility or release
readiness across every generator, browser, or output format.

## Documentation Sites

The workflows publish separate dev and stable documentation under each adapter's project name:

| Adapter | Project Name             | Stable Documentation                                                                                |
| ------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| Sphinx  | `sphinx-unbloated-theme` | [Sphinx documentation](https://jorgemartinez.space/projects/sphinx-unbloated-theme/version/stable/) |
| Hugo    | `unbloated-hugo-theme`   | [Hugo guide](https://jorgemartinez.space/projects/unbloated-hugo-theme/version/stable/)             |
| Quarto  | `quarto-unbloated-theme` | [Quarto guide](https://jorgemartinez.space/projects/quarto-unbloated-theme/version/stable/)         |
| LaTeX   | `unbloated-book`         | [LaTeX guide](https://jorgemartinez.space/projects/unbloated-book/version/stable/)                  |

Replace `stable` with `dev` for development documentation. The core keeps its
existing `unbloated` project section. Publication runs through the gated workflows
described in [Release Setup](../docs/content/releasing.md).
