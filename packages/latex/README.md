# Unbloated: A LaTeX Adapter

Documentation destinations: [stable](https://jorgemartinez.space/projects/unbloated-book/version/stable/)
and [development](https://jorgemartinez.space/projects/unbloated-book/version/dev/).

`unbloated-book` adapts the shared core CSS to LuaLaTeX technical books. It
extends the standard `book` class with core typography, grayscale colors,
spacing, heading sizes, and borders, plus chapter-based equations and theorem
numbering, code listings, and tables.

## Build the Example

Install TeX Live 2023 or newer, or a corresponding MacTeX distribution, with
LuaLaTeX and `latexmk`. A minimal TeX installation needs `fontspec`, Latin Modern
fonts, `iftex`, `geometry`, `microtype`, `ragged2e`, `amsmath`, `amssymb`, `amsfonts`, `amsthm`, `graphicx`,
`booktabs`, `listings`, `titlesec`, `xcolor`, `fix-cm`, and `hyperref`, including their dependencies.

Prepare the adapter from the repository root with Node.js and the locked
contributor dependencies:

```sh
npm ci --ignore-scripts
npm run build:adapters
npm run check:adapters
```

Then, from `packages/latex`, run:

```sh
latexmk -lualatex -no-shell-escape -interaction=nonstopmode \
  -halt-on-error -file-line-error -Werror -outdir=build example/book.tex
```

The result is `build/book.pdf`. The example includes front matter, two chapters,
an appendix, a bibliography, a proof, a code listing, and a convergence table.
`latexmk` reruns LuaLaTeX until cross-references stabilize. Build from this
directory so the example's chapter paths resolve.

## Start a Book

`npm run pack:adapters` produces `.cache/artifacts/unbloated-latex-<core-version>.tar.gz`.
The archive contains a `latex/` directory with the class, generated
`unbloated-tokens.sty`, exact `unbloat.css`, provenance, license notices, examples,
and checks. Extract it and place your main `.tex` file in that directory, or
install its files in a local TeX tree under `tex/latex/unbloated/`.

The class requires the generated style beside it or on the TeX search path.
A packaged adapter compiles without Node, npm, network access, or shell escape.
Keep the CSS, provenance, and `licenses/unbloated/` notices with redistributed
copies. Copying the class alone is insufficient.

```tex
\documentclass[11pt,a4paper,twoside,openright]{unbloated-book}
\title{A Technical Book}
\author{Your Name}
\date{}

\begin{document}
\frontmatter
\maketitle
\tableofcontents
\mainmatter
\chapter{Introduction}
\label{ch:introduction}
Start with the problem and define the notation.
\backmatter
\end{document}
```

The class keeps the standard `book` base-size options: 10-point type, US Letter paper,
two-sided pages, and chapters starting on right-hand pages. The example selects
11-point type and A4 paper. Standard `book` options pass through to the base class.
Use `oneside,openany` for a screen-oriented draft or `letterpaper` for US Letter.
Page margins are 30 mm inside, 25 mm outside and above, and 30 mm below.
You can change them with `\geometry{...}` in the preamble.

Text and code use Latin Modern Mono, an OpenType font distributed with TeX Live.
Prose uses ragged-right alignment. Paragraph spacing and body line height come
from the core; paragraphs have no first-line indentation.
Mathematics keeps LaTeX's standard math fonts so symbols remain distinct.
`fix-cm` makes those fonts scalable when core CSS selects a fractional body size.
No web fonts or network access are needed during compilation.
Load language support such as `babel` in your preamble if needed; the class
doesn't select a language.

## Technical Content

Use `amsmath` environments and `\label`, `\ref`, and `\eqref` for mathematics.
The class supplies `theorem`, `lemma`, `proposition`, `corollary`, `definition`,
and `example`, sharing a chapter-based counter. `exercise` has its own
chapter-based counter; `remark` is unnumbered. Use `proof` for proofs.

Use `lstlisting` or `\lstinputlisting` for code. Listings use monochrome
formatting and don't invoke an external highlighter. The `listings` package
has limited Unicode support inside code, even though LuaLaTeX supports Unicode
in ordinary text.

Use `\includegraphics` for figures and `booktabs` rules for tables. Supply
captions and labels rather than hard-coding numbers. The class doesn't select
a bibliography backend: the example uses `thebibliography`, and you can load
`biblatex` or another system required by your publisher.

## Shared Core CSS

`scripts/latex-tokens.mjs` reads the canonical `:root` custom properties from the
built `dist/unbloat.css`. Adapter staging copies that exact CSS and generates
`unbloated-tokens.sty` from it. The class loads this style and applies its values.
Updating the core CSS and rebuilding adapters changes the LaTeX styles.

| Core CSS Values                                   | LaTeX Mapping                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Text, surface, muted, and border colors           | Page/text colors, listing surfaces/comments/numbers, and listing borders.                |
| Font size and body line height                    | Body font size and baseline spacing.                                                     |
| Heading sizes 1 through 6 and heading line height | Chapter, section, subsection, subsubsection, paragraph, and subparagraph typography.     |
| Spacing scale                                     | Paragraph gaps, heading gaps, table cell padding, and listing padding/number separation. |
| Border width and square corners                   | Table/listing rule widths and rectangular frames.                                        |
| Generic `monospace` font family                   | Latin Modern Mono, including real bold and italic faces available in TeX Live.           |

One CSS `rem` maps to the base font size selected by the `book` class, captured
before core font scaling. One CSS `px` maps to `0.75bp`, or 1/96 inch. The web
font stack maps to the TeX font above; named browser fonts are not installed or
selected automatically. Paper geometry, mathematics, floats, numbering, and
pagination remain TeX responsibilities. Browser selectors, interactions, focus
rings, and screen shadows do not become PDF behavior.

The generated style exposes `\UnbloatedToken{space-3}` for lengths,
`\UnbloatedToken{line-height-body}` for unitless values, named colors such as
`unbloat-color-text`, and `\UnbloatedCoreHash` for the source CSS digest.
Use these when adding book-specific styles. Keep shared values in the core.

`unbloated-core.json` records the core name/version, CSS SHA-256 digest, and
`texSha256` for the generated style. `check:adapters` regenerates the expected
translation in memory and rejects stale or modified CSS, TeX, metadata, or
notices. The packer runs that check before creating the archive, and the archive
checker compares both bundled style files and their provenance.

The bridge accepts the validated core token schema. Missing, duplicate,
unsupported-unit, or unsafe token declarations fail the build. It does not
interpret arbitrary third-party CSS as TeX.

## Checks and Build Limits

The source is [unbloated-book.cls](unbloated-book.cls). It passes options to
the standard `book` class, rejects engines other than LuaLaTeX, and loads the
packages and defaults described above. Chapter sources live under
`example/chapters/`; [example/book.tex](example/book.tex) is the entry document.
[tests/options.tex](tests/options.tex) exercises alternate book options, and
[tests/check.sh](tests/check.sh) runs the compilation checks below.

From `packages/latex`, run:

```sh
bash tests/check.sh
```

After staging the core, the check builds the A4 example and a 12-point US Letter,
single-sided document.
It rejects unresolved references, missing glyphs, overfull boxes, and font
warnings, and checks that pdfLaTeX is rejected.
Generated PDFs and auxiliary files stay in `build/`.

From the repository root, `node --test tests/latex.integration.mjs` compiles
isolated consumers with default and modified core CSS. It verifies the actual
body color, font size, baseline spacing, paragraph gaps, chapter size, and table
rule width. The independent `latex-book` CI job stages the adapter, runs the
example checks, and runs these consumer tests. Adapter packaging CI validates
the LaTeX archive alongside the Sphinx, Hugo, and Quarto distributions.

Compile only trusted sources on your normal account. `-no-shell-escape`
disables external commands but doesn't prevent TeX from reading or writing
files. Untrusted books need an isolated environment with restricted file access,
no secrets or network, and resource limits.

This class doesn't configure tagged PDF or claim PDF/UA conformance. If your
publisher requires a particular class, font, page size, or archival standard,
use that specification rather than assuming this class meets it.

## License

LGPL-3.0-only, matching the core library. See the repository's
[`LICENSE`](../../LICENSE), [`COPYING`](../../COPYING), and
[`NOTICE`](../../NOTICE).
