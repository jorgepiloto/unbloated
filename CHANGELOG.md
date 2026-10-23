# Changelog

## Unreleased

- Apply the 2026-10-23 roadmap fixes across core controls, Hugo, Sphinx, and Quarto.
- Update PostCSS to 8.5.31 and correct npm project links.
- Preserve authored Sphinx sources, literal labels, and notebook outputs; use native links.
- Wrap wide content, distinguish mixed checkboxes, and retain tab content without scripts.
- Correct prefixed search, literal results, discovery flags, archive years, and locale metadata.
- Give Plotly embeds independent IDs and render plant information during generation.
- Preserve Quarto image containers and native footer ownership.
- Validate exact stable/versioned documentation artifacts and gate development deployment.
- Expand ownership checks and regressions; document remaining environment verification limits in ROADMAP.md.

- Add a standalone LuaLaTeX class and example for technical books.
- Make Sphinx, Quarto, and Hugo adapters consume the same generated core CSS.
- Add bundle provenance, source ownership checks, package checks, and adapter CI.
- Replace adapter palettes and font defaults with core variables.
- Extract Hugo presentation files for the website consumer.

## 0.1.0

- Add shared grayscale tokens, semantic HTML styles, and optional components.
- Generate CSS and Sass from one token source without build dependencies.
- Add a reference page, Node tests, package installation checks, and browser tests.
- Add pull request, main, nightly, and npm release workflows.
- Keep generated distributions out of Git and build release artifacts in CI.
- License the package under LGPLv3 only and include the corresponding source.
