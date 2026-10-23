# Development Roadmap

## Current Status

No implementation findings remain open from the reviewed roadmap. F32-F35 are
fixed, and the ten acceptance checks pass within the browser coverage below.
Completed task descriptions remain in Git; changes are recorded in
[CHANGELOG.md](CHANGELOG.md). The [follow-up report](anti-slop/follow-up-001-2026-10-23.md)
maps all fourteen finding IDs to their implementation and acceptance evidence.
The [LaTeX integration report](anti-slop/follow-up-002-2026-10-23.md) records the
shared-core adapter implementation and its checks.

Preserve the grayscale palette, system monospace typography, square corners,
low-specificity semantic CSS, and appearance-only core. Keep design values in
the core and platform layout and runtime behavior in adapters. Retain exact
adapter bundles, provenance, license notices, native controls, and validation
before publication.

## Verification

| Check                                                    | Result                                                                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core build, adapter staging, ownership, lint, formatting | Pass.                                                                                                                                                     |
| Node and adapter integration tests                       | 34 core/utility tests and 7 adapter tests pass.                                                                                                           |
| Python regressions                                       | 13 Sphinx tests and 7 archive-validation tests pass.                                                                                                      |
| Core/Hugo browser checks                                 | 39 pass across Chromium, Firefox, and mobile Chromium; 3 existing mobile-only keyboard skips.                                                             |
| Exact documentation artifacts                            | 11 Chromium checks pass for each stable and versioned deployment prefix; all 20 files in each artifact retain identical SHA-256 hashes across the checks. |
| Sphinx/Quarto browser consumers                          | 5 Chromium checks pass, including HTML/dirhtml, 320 px, 200% text, keyboard interaction, and repeated print transitions.                                  |
| Quarto compatibility                                     | Image and footer checks pass on 1.9.37 and 1.11.5, including generated PDFs.                                                                              |
| LaTeX adapter                                            | Shared CSS translation, A4/Letter example checks, and 2 isolated consumers with default/modified core CSS pass.                                           |
| Sphinx documentation                                     | Warning-as-error HTML build passes with notebook and PDF exports on Sphinx 9.1.1.                                                                         |
| Distribution checks                                      | Five adapter archives pass bundle/license validation; Sphinx wheel and source distribution pass Twine validation.                                         |

### Remaining Environment Verification

- [ ] Run the WebKit browser project on a host where WebKit can create pages.

WebKit launches here but times out during page initialization, including a blank
page without project content. The unrestricted browser command therefore does
not pass on this host. This limit remains explicit rather than disabling the
project or counting its tests as accepted. Chromium/Firefox/mobile coverage
above does not establish WebKit compatibility.

## Reproduce the Checks

See [CONTRIBUTING.md](CONTRIBUTING.md#rendering-regressions) for builder setup.
Run from the monorepo root after installing dependencies:

```sh
npm run build:adapters
npm run build:check
npm run lint
npm run format:check
npm test
PYTHON="$PWD/.venv/bin/python" npm run test:adapters
.venv/bin/python -m unittest discover -s packages/sphinx/tests/python
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
npm run test:browser
npm run docs:build -- --baseURL https://example.org/project/version/stable/
npm run test:docs
npm run docs:build -- --baseURL https://example.org/project/version/0.1.0/ --destination ../.cache/site-versioned
DOCS_ARTIFACT_DIR=.cache/site-versioned npm run test:docs
PYTHON="$PWD/.venv/bin/python" npm run test:adapter-browser
```

Use `npm run test:browser -- --project chromium --project firefox --project mobile-chromium`
to reproduce the passing subset on this host. Keep the full command in CI.
The adapter suite needs Sphinx installed in the selected Python environment and
Quarto on PATH or selected by `QUARTO_BIN`. Tests serve existing documentation
artifacts without rebuilding them. A build alone does not establish browser or
print acceptance.
