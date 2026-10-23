# Development Roadmap

This roadmap records the HTML, CSS, JavaScript, Sphinx, Hugo, and Quarto review
from 2026-10-23. It covers 31 confirmed findings: one P1, 27 P2, and three P3.
All tasks are open. Recording a task does not mean its fix has been implemented
or approved for release.

P1 means a high-priority blocker. P2 means a correctness, accessibility,
integration, or verification defect. P3 means a lower-impact defect. Finding
IDs preserve the review's numbering.

The workstreams below give a proposed implementation order, not a schedule.
Independent tasks can proceed in parallel. Fix the documentation cleanup before
running full Sphinx documentation builds. Check the actual deployment artifact
before treating deployment checks as a release gate.

## Preserve the Existing Architecture

Keep the documented grayscale palette, system monospace typography, square
corners, and content-first layouts. These are intentional design choices.
This review does not call for a framework migration, a new palette, additional
animation, or a mandatory theme toggle.

Preserve these foundations while making changes:

- Low-specificity semantic CSS and appearance-only components.
- Shared design-value ownership, with platform layout in adapters.
- A core package without runtime JavaScript or runtime dependencies.
- Exact adapter CSS bundles, provenance digests, and license notices.
- Explicit package exports and inspected distribution contents.
- Native controls, visible focus, and links that work without scripts.
- Pinned tools, reproducible builds, and separated validation/publication jobs.
- Sphinx toctree-based navigation, progressively enhanced AutoAPI summaries,
  and defensive version-feed handling.

## Workstream 1: Make Development and Publication Safe

### F01: Update the Vulnerable PostCSS Dependency

- [ ] P1: Update the direct PostCSS dependency and lockfile to a reviewed patched version.

Evidence: `package.json:84` pins `8.5.6`. The review's dependency audit reported
one high-severity direct development dependency and identified `8.5.31` as an
available non-major remediation. Recheck advisories when implementing.

Done when the configured dependency audit passes and adapter parsing and
packaging retain their behavior. This is a build-tool advisory finding, not
proof of runtime exploitation in the published CSS.

### F25: Stop Sphinx Cleanup From Deleting Existing Source

- [ ] P2: Isolate generated example sources or track exactly which files each build creates.

Evidence: `packages/sphinx/doc/source/conf.py:174-203,265-270` reuses and then
recursively removes `doc/source/examples`. An isolated reproduction deleted a
pre-existing `authored.rst`; copying can also overwrite same-named files.

Done when existing files survive successful, failed, and interrupted builds,
and filename collisions cannot silently overwrite source.

### F15: Correct Publication Metadata

- [ ] P2: Reconcile npm repository, homepage, and issue URLs with this repository.

Evidence: `package.json:7-12` points to `jorgepiloto/unbloated-css`, while this
repository is `jorgepiloto/unbloated`. The release guide already notes the
unresolved setup step.

Done when manifest and lockfile metadata agree and package links resolve to
the intended project. Verify the external trusted-publisher/provenance setup
separately before publication.

### F30: Update Sphinx Contributor Instructions

- [ ] P2: Replace standalone-repository commands with explicit monorepo working directories.

Evidence: `packages/sphinx/CONTRIBUTING.md:9-17,44-61,97-106` gives root-relative
Python commands and old source paths. Python metadata lives in
`packages/sphinx`, and its build requires the generated adapter bundle.

Done when a clean-checkout smoke test follows the documented setup,
bundle preparation, Python installation, and distribution commands without
guessing directories. Reuse the root contribution guide for shared setup.

## Workstream 2: Preserve Content and Native Interaction

### F03: Make Wide Hugo Content Reachable

- [ ] P2: Remove content clipping and provide appropriate table scrolling or wrapping.

Evidence: `packages/hugo/assets/css/style.css:64,284,438` hides or clips
horizontal overflow. A 320-pixel fixture cut off an approximately 8,908-pixel
table rather than containing it.

Done when long table cells and identifiers remain reachable at narrow widths
and enlarged text sizes. Check keyboard access to scrollable content rather
than asserting only that the page has no horizontal scrollbar.

### F23: Make Wide Sphinx Content Reachable

- [ ] P2: Isolate decorative heading overflow without clipping whole content sections.

Evidence: the Sphinx theme's `static/css/style.css:323-327,718-732` clipped a
roughly 1,036-pixel table inside both desktop and mobile sections.

Done when wide tables, nested content, long URLs, and focus indicators remain
reachable. Add bounded scrolling or deliberate wrapping where appropriate.

### F24: Keep Notebook Output Visible

- [ ] P2: Remove the blanket rule that hides arbitrary siblings after notebook images.

Evidence: the Sphinx theme's `static/css/style.css:831-840` applies
`.nboutput img + * { display: none; }`. A numerical-result paragraph following
an image became invisible.

Done when image-plus-text, image-plus-table, captions, and multiple outputs
retain all meaningful content. Target only a documented redundant label if
one genuinely needs suppression.

### F28: Respect Quarto Image Containers

- [ ] P2: Replace absolute image limits that override responsive column sizing.

Evidence: `packages/quarto/_extensions/unbloated/unbloated.scss:79-85`
forces `max-width: 800px !important` and `width: auto !important`.
A large image exceeded its column on desktop and mobile.

Done when large intrinsic images fit columns, authored image sizes remain
effective where intended, and figures/captions work in mobile and print views.
A container-relative cap such as `min(100%, 800px)` is one candidate.

### F29: Preserve Quarto Footer Ownership

- [ ] P2: Stop moving the first slide-local footer into a global container.

Evidence: `packages/quarto/_extensions/unbloated/custom.html:2-12` selects the
first `.footer`. A per-slide override appeared on unrelated slides and
overlapped the default footer in print.

Done when global footers, local overrides, suppressed footers, and absent
footers work through slide transitions, scroll view, and print/PDF output.
Prefer Quarto's native footer lifecycle over DOM relocation.

### F11: Show the Mixed Checkbox State

- [ ] P2: Restore a distinct visual indicator for indeterminate checkboxes.

Evidence: `src/base.css:111-123` removes native appearance and styles checked
controls but not `:indeterminate`. The mixed and unchecked states looked alike
in the source-rule fixture.

Done when checked, unchecked, and mixed states are distinguishable with the
real core stylesheet, including forced colors and keyboard interaction.

### F21: Escape Sphinx Plain-Text Labels

- [ ] P2: Escape project names, descriptions, and navigation labels at template boundaries.

Evidence: the Sphinx theme's `layout.html:14-16,71-74,103-107,116-119`
interpreted `Tools & <Interfaces>` and `Vector <T> & Buffer` as markup,
losing literal text in generated pages.

Done when angle brackets, ampersands, quotes, and Unicode survive as text in
supported builders. Preserve separately documented trusted-HTML options
instead of indiscriminately escaping all theme content.

### F22: Use One Interactive Element per Sphinx Destination

- [ ] P2: Replace anchors containing buttons with styled anchors.

Evidence: the Sphinx theme's `layout.html:71-74,103-107,116-119` and
`packages/sphinx/doc/source/conf.py:106-116` nest interactive elements.
Three primary destinations produced six keyboard stops.

Done when each destination creates one logical focus stop, retains visible
focus and link behavior, and exposes current-page semantics. Update tests
that currently preserve the nested-button structure.

### F06: Make Hugo Navigation Work Without JavaScript

- [ ] P2: Replace inline navigation handlers with real links.

Evidence: `packages/hugo/layouts/_default/baseof.html:34-37` renders buttons
with `onclick` navigation. The About control did not navigate with scripts
disabled.

Done when primary navigation works without JavaScript and supports opening,
copying, and inspecting link destinations. Derive active state from page/menu
relationships and expose `aria-current`.

### F07: Keep Hugo Prose Links Discoverable

- [ ] P2: Restore persistent non-color distinction for inline links.

Evidence: `packages/hugo/assets/css/style.css:328-343` removes underlines
while assigning links the ordinary text-color alias.

Done when readers can identify prose links without hovering over each word.
Keep decoration-free styling scoped to explicit navigation/button components.
Do not label this automatically as a WCAG color-only failure.

### F12: Enhance Documentation Tabs Without Losing the Fallback

- [ ] P2: Hide inactive documentation panels only after successful widget initialization.

Evidence: `docs/content/components/tabs.md:18` ships the Tokens panel hidden.
Without the tab script, selecting its control cannot reveal its content.

Done when all content remains available if the script fails, while successful
enhancement retains roving focus, selected-state updates, panel relationships,
and Arrow/Home/End behavior.

### F13: Render Plant Information During Generation

- [ ] P2: Emit visible semantic fields and remove the repeated plant-card ID.

Evidence: `packages/hugo/layouts/shortcodes/card_plant.html:16-29` emits empty
fields containing only data attributes and repeats `id="plant-info"`.
Two cards produced 16 empty field texts without JavaScript.

Done when every field remains readable without scripts and repeated cards
have unique identifiers or no unnecessary IDs. Use CSS rather than script
to align labels and values.

## Workstream 3: Correct URLs, Search, and Generated Metadata

### F04: Resolve Hugo Search Within the Site Base Path

- [ ] P2: Pass the generated search-index URL to JavaScript.

Evidence: `packages/hugo/static/js/search.js:26-30` fetches `/index.json`.
A site below `/prefix/` therefore requested the origin's root index.
The root-absolute favicon paths in `layouts/partials/head.html:15-16`
have the same portability problem.

Done when a prefixed deployment loads its own index and assets, without
accidentally consuming another site's root resources.

### F05: Handle Malformed Search Queries

- [ ] P2: Replace manual query splitting with deliberate URL parameter parsing.

Evidence: `packages/hugo/static/js/search.js:105-108` calls
`decodeURIComponent` before the error handler exists. `?s=%` produced
`URI malformed` and an empty results region.

Done when malformed escapes, encoded delimiters, plus signs, empty input,
and repeated parameters have documented behavior and visible recovery.
Use `URLSearchParams` rather than duplicating its parsing rules.

### F19: Preserve Literal Search Result Text

- [ ] P2: Construct result elements with safe text insertion instead of HTML substitution.

Evidence: `packages/hugo/static/js/search.js:82-93,111-129` rendered the
benign title `Vector<T>` as `Vector` with an unintended element.

Done when titles and snippets preserve angle brackets, ampersands, quotes,
and dollar-sign sequences. Keep destinations separate from text and validate
their URL contract. Assess exploitability separately if an untrusted index
source is introduced.

### F09: Apply Discoverability Flags Consistently

- [ ] P2: Define and enforce private/noindex behavior across generated outputs.

Evidence: `packages/hugo/layouts/_default/index.json:1-5` indexes all regular
pages, including a fixture excluded by private/noindex flags from the sitemap.

Done when the documented search, feed, collection, and sitemap rules agree.
Make clear that these flags are not access control; genuinely nonpublic
content must stay out of the public build.

### F14: Separate Plotly Container IDs From Data URLs

- [ ] P2: Generate independent per-shortcode IDs and rely on contextual escaping.

Evidence: `packages/hugo/layouts/shortcodes/plotly.html:4,7-8` double-escapes
ampersands in the ID while JavaScript searches for the original URL.
Repeated dataset URLs also reuse an ID.

Done when URLs with query strings and multiple embeds of the same dataset
render into distinct valid containers, and failure feedback does not
dereference a missing element.

### F08: Use Actual Archive Years

- [ ] P2: Render date-group keys and remove the category template's diagnostic text.

Evidence: `packages/hugo/layouts/_default/tags.html:12-17` and
`categories.html:13-15` subtract group positions from 2024. A 2026 post
appeared under `Year 2024`; `categories.html:4` exposes an internal message.

Done when consecutive and nonconsecutive publication years produce accurate
headings and no internal diagnostic reaches the page.

### F10: Emit the Configured Hugo Document Language

- [ ] P2: Derive the document language from the active site's language/locale.

Evidence: `packages/hugo/layouts/_default/baseof.html:2` hardcodes English,
including for the French fixture.

Done when supported language configurations produce correct `lang` metadata.
Add direction support where the supported locale set requires it.

### F26: Fix Sphinx Directory-HTML 404 Resolution

- [ ] P2: Make 404 base, navigation, and asset URLs share a builder-aware reference frame.

Evidence: the Sphinx theme's `404.html:3-6` and navigation context in
`packages/sphinx/src/sphinx_unbloated_theme/__init__.py:82-85` combine
`<base href="/docs/">` with `../` paths in `dirhtml`, escaping the docs prefix.

Done when supported HTML builders resolve 404 resources and navigation
correctly, including when a host serves the error page at a missing nested URL.
If only one builder is supported, state and enforce that contract.

### F31: Hide Unconfigured Sphinx Issue Actions

- [ ] P3: Render the 404 issue link only when a valid report destination exists.

Evidence: the Sphinx theme's `404.html:10-12` appends `/issues` to an optional
GitHub URL whose `theme.toml:10` default is empty.

Done when default options do not advertise a dead documentation-host `/issues`
link and repository URLs with trailing slashes produce the intended destination.

### F18: Migrate Hugo Locale APIs Deliberately

- [ ] P3: Replace deprecated SEO locale access within an explicit supported Hugo range.

Evidence: `packages/hugo/layouts/partials/seo.html:119,174,192` uses
`.Site.LanguageCode`, which Hugo 0.167.0 warns is deprecated.

Done when the minimum and pinned/current supported versions build without
relevant warnings. Account for the theme's declared 0.144.1 minimum before
adopting an API available only in newer releases.

## Workstream 4: Make Verification Match Published Behavior

### F02: Check the Exact Documentation Artifact

- [ ] P2: Serve downloaded static output without rebuilding it for deployment checks.

Evidence: `playwright.docs.config.mjs:17-20` starts a source-rebuilding preview.
`scripts/docs.mjs:110-128` prepares assets and starts Hugo at a root loopback
base URL, replacing the deployed-shape behavior the checks should exercise.

Done when checks cover the exact uploaded stable/versioned artifacts,
including their deployment prefixes, assets, fragments, and representative
controls. Keep live-source preview checks separate if they remain useful.

### F16: Gate Development Documentation Deployment

- [ ] P2: Make development deployment wait for required validation.

Evidence: `.github/workflows/night.yml:35-36` depends only on `doc-build`,
so deployment can finish before the independent checks fail.

Done when a failing required job prevents publication and the deployed artifact
is the artifact that passed validation. Alternatively, explicitly distinguish
an intentionally unverified preview from a validated deployment.

### F20: Cover CSS Shorthands in Adapter Ownership Checks

- [ ] P2: Reject independent font stacks and palettes in supported CSS forms.

Evidence: `scripts/adapter-styles.mjs:19-20,76-82,104-110` accepted
`font: 16px serif` and `background-image: linear-gradient(red, blue)`.

Done when negative tests cover font shorthands and named-color gradients,
alongside supported color functions/properties, without rejecting legitimate
adapter geometry. Treat the validator as an ownership check, not a sandbox.

### F27: Build a Nonempty Generated Changelog

- [ ] P2: Emit supported changelog markup or declare its required extension.

Evidence: `packages/sphinx/doc/source/changelog/template:1-10` generates
`tab-set`/`tab-item`, but the documentation extension/dependency lists do not
provide them. A nonempty rendering failed a warning-strict Sphinx build.

Done when the real Towncrier template renders at least one entry and the
result builds with the declared documentation environment. Prefer native
headings/lists if tabs do not justify another extension.

### F17: Keep the Preview Server Alive After Invalid Requests

- [ ] P3: Handle request URL parsing errors inside the request boundary.

Evidence: `scripts/serve.mjs:22-23` parses outside its error handler.
The literal request path `//[` terminated the loopback process.

Done when malformed URLs receive a controlled client-error response and a
subsequent valid request still succeeds. Preserve repository-standard logging
without exposing sensitive request data.

## Follow-Up Assessment

These recommendations and conditional risks are separate from the 31 confirmed
findings. Assess them before selecting implementation scope; do not turn them
into unconditional defects or dependencies.

| Area                        | Planned Assessment                                                                                                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility               | Combine representative automated checks with keyboard, screen-reader, forced-color, 200% text-resize, 400% zoom/reflow, and mobile-touch checks. Existing focus assertions do not certify WCAG conformance.                       |
| Touch targets               | Measure real controls and spacing. Consider 44-pixel targets for touch comfort, but distinguish this preference from WCAG 2.2 AA's 24-pixel minimum and exceptions. Documentation social links declare 1.75rem minimum hit areas. |
| Search states               | Add perceivable loading/status feedback, check HTTP failures, and exercise empty results, index failures, and missing third-party libraries. Preserve existing recovery messages.                                                 |
| Navigation and localization | Evaluate skip/bypass navigation, translatable labels, RTL, and page-title hierarchy. Multiple `h1` elements alone do not establish a WCAG failure.                                                                                |
| Browser support             | Document adapter requirements for native CSS nesting, container units, and container queries. Add representative adapter fixtures before expanding browser matrices.                                                              |
| Runtime support             | Exercise the advertised Node >=22.14.0 floor, Python 3.12 floor, and minimum Sphinx/Hugo versions, or narrow the declarations. Grammar checks and one installed runtime are not a compatibility matrix.                           |
| Print and motion            | Check reduced motion, forced colors, adapter print styles, and AutoAPI summary tabs. Inactive summary panels remained hidden under print emulation in an independent fixture; validate complete output before choosing a fix.     |
| Optional downloads          | Verify advertised PDF files exist when Quarto/TinyTeX are unavailable. Either hide unavailable formats or require generation for deployed documentation.                                                                          |
| Images and visualizations   | Make leading-image loading priority contextual, reserve dimensions where possible, and provide meaningful alternatives for charts/3D content. Test figure, column, and stretch structures.                                        |
| Third-party scripts         | Pin supported Plotly/Three.js versions, avoid duplicate classic/module loads, and document offline/CSP behavior. The core's no-remote-assets contract does not describe every adapter.                                            |
| Attribution                 | Confirm the source and redistribution requirements of Hugo's inlined SVGs. Documentation retains Font Awesome notices; corresponding theme attribution needs review. Do not infer legal approval from a build.                    |
| Contributor tooling         | Consider separate generated CSS output instead of minifying over authored Sphinx `style.css`. Keep local build commands explicit and preserve readable source.                                                                    |
| Consumer contracts          | Document standalone Hugo configuration, required parameters, search outputs, shortcode inputs, error behavior, and supported builder formats.                                                                                     |
| Dependency maintenance      | Inventory independent adapter lockfiles, Python tools, CDN scripts, and generator pins. Root Dependabot coverage does not maintain every adapter dependency.                                                                      |
| Adapter releases            | Align Quarto archive naming with the documented independent-version policy when adapter and core versions diverge. Check historical standalone-repository links and release instructions.                                         |
| Scientific examples         | Add numerical boundary tests for the ISA, Monte Carlo, and projectile examples if they are intended as reusable APIs. The review checked syntax, not numerical correctness.                                                       |
| Performance                 | Establish representative page-weight, LCP, INP, CLS, and build-time baselines before setting budgets or claiming improvements.                                                                                                    |

## Verification Plan

Add each defect's regression with its fix. Use existing tooling where it covers
the requirement; avoid expanding infrastructure before reproducing the behavior.

Once authorized source access and dependencies are available:

1. Run formatting, JavaScript/CSS linting, adapter ownership checks, and the
   dependency gate.
2. Build the real core and verify deterministic output, Sass consumption,
   package exports, and canonical color contrast.
3. Stage/check all adapter bundles, build their distributions, and inspect
   CSS bytes, provenance, license notices, and intended archive contents.
4. Build representative Sphinx, Hugo, and Quarto consumers with their real
   bundled core CSS. Cover supported versions and output formats.
5. Check generated semantics, escaping, links, metadata, feeds, sitemaps,
   prefixed deployments, 404 pages, and changelog output.
6. Exercise controls, keyboard focus, disabled-script fallbacks, empty/loading/
   error paths, mobile layouts, enlarged text, supported themes, and print.
7. Check the exact static deployment artifacts before publication.

Preserve the existing useful checks: the review passed six JavaScript adapter
contract tests, one synthetic real-builder packaging test, six Python bundle
tests, and seven Sphinx Python regressions in isolated fixtures. These successes
do not replace real-core rendering or the new regression cases.

## Review Limits and Completion Criteria

Organization policy excluded `src/tokens.json`, `.npmrc`, and
`packages/sphinx/src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/theme.conf`
from the review. The separately readable `theme.toml` was inspected. Excluded
files were not retried or reconstructed; complete token-based builds and
default-palette contrast remain unverified.

Other limits:

- Browser reproductions used Chromium and independent fixture styles.
  Firefox launched, but the complete suite did not run. WebKit lacked host
  libraries. Full assistive-technology, real-touch, and zoom matrices remain open.
- Focused builds used Hugo 0.167.0, Sphinx 9.2.0, AutoAPI 3.8.1, and Quarto
  1.11.5. They do not prove minimum-version compatibility.
- Full notebook documentation, TinyTeX/PDF generation, numerical examples,
  packaged Quarto installation, and real-token adapter rendering were not
  certified.
- Public Sphinx/Quarto documentation retrieval had a TLS certificate-verification
  limitation. Confirmed findings also relied on source or local reproductions.
- No published-package settings, external deployment configuration, legal
  compliance, exploitability, or field-performance claims were certified.

Close a confirmed task only after its acceptance criteria pass with persistent
regression coverage and directly related documentation updates. Record changed
behavior and compatibility decisions. Keep unresolved access/environment limits
explicit instead of reporting an all-green release.

Roadmap handoff: evidence and uncertainty are preserved, no new visual assets
or product claims were introduced, and no defect is marked fixed. This document
does not approve the unchanged interface for release.
