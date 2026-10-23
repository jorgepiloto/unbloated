# Changelog

## Unreleased

- Build, validate, and deploy independent dev/stable documentation sites for each
  extension, preserving the core site and versioned release snapshots.

- Integrate the LaTeX adapter with core CSS-derived TeX styles, exact bundles,
  provenance, license checks, distribution packaging, and consumer regressions.
- Restore Sphinx prose-link decoration and reflow header controls at narrow widths.
- Match documentation versions at URL boundaries and show unmatched pages honestly.
- Print all documentation and AutoAPI tab content without changing screen selection.
- Preserve Quarto footer ownership with global footer copies in scroll slides
  and local/default footer copies anchored inside PDF pages.
- Add browser regressions for header geometry, visited links, version navigation,
  repeated print transitions, and generated PDFs.
- Remove redundant top-level Hugo license copies and Sphinx author/contributor
  lists; retain bundled license texts, attribution, and manifest author metadata.
- Add source, script, and platform directory guides; document script APIs,
  environment variables, shortcode inputs, and adapter build requirements.
- Correct Sphinx monorepo workflow instructions and Quarto's math example.
- Filter private and noindex translations from sitemap alternates and fix locale
  partials on Hugo 0.144.1 and 0.154.5.
- Skip Sphinx download exports after failed builds and for non-HTML builders.
- Exclude generated Sphinx documentation and tox environments from shared linters.
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
