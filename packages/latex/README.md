# Unbloated for LaTeX

`unbloated-book` is a LuaLaTeX class for technical books. It extends the
standard `book` class with monospace text, black-and-white output, chapter-based
equations and theorem numbering, code listings, and tables.

## Build the Example

Install TeX Live 2023 or newer, or a corresponding MacTeX distribution, with
LuaLaTeX and `latexmk`. A minimal TeX installation needs `fontspec`, Latin Modern
fonts, `geometry`, `microtype`, `ragged2e`, `amsmath`, `amsfonts`, `amsthm`, `graphicx`,
`booktabs`, `listings`, and `hyperref`, including their dependencies.

From `packages/latex`, run:

```sh
latexmk -lualatex -no-shell-escape -interaction=nonstopmode \
  -halt-on-error -file-line-error -Werror -outdir=build example/book.tex
```

The result is `build/book.pdf`. The example includes front matter, two chapters,
an appendix, a bibliography, a proof, a code listing, and a convergence table.
`latexmk` reruns LuaLaTeX until cross-references stabilize. Build from this
directory so the example's chapter paths resolve.

## Start a Book

Copy `unbloated-book.cls` beside your main `.tex` file, or install it in a local
TeX tree under `tex/latex/unbloated/`. Keep the repository's `LICENSE`, `COPYING`,
and `NOTICE` with redistributed copies of the class.

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

The class keeps the standard `book` defaults: 10-point type, US Letter paper,
two-sided pages, and chapters starting on right-hand pages. The example selects
11-point type and A4 paper. Standard `book` options pass through to the base class.
Use `oneside,openany` for a screen-oriented draft or `letterpaper` for US Letter.
Page margins are 30 mm inside, 25 mm outside and above, and 30 mm below.
You can change them with `\geometry{...}` in the preamble.

Text and code use Latin Modern Mono, an OpenType font distributed with TeX Live.
Prose uses ragged-right alignment with paragraph indentation to avoid uneven
justification in a fixed-width font.
Mathematics keeps LaTeX's standard math fonts so symbols remain distinct.
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

## Relationship to the JS Build

The root library contains CSS and a Node.js build, not a runtime JavaScript
API. LaTeX can't apply its CSS. LuaLaTeX embeds Lua, not JavaScript, so directly
importing an npm package isn't an option.

A build-time bridge is viable: the Node build could export selected shared
design tokens as a `.sty` file. That would keep Node outside the TeX process
and let distributed books compile without Node or shell escape. Font stacks
and browser dimensions would need explicit mappings to TeX fonts and units;
HTML layout and interactive behavior wouldn't transfer.

This first version is standalone. It doesn't consume the shared tokens or
claim parity with the CSS theme. The build-time bridge isn't implemented yet.
The class uses black text and TeX-distributed fonts rather than a separate
theme palette.

## Checks and Build Limits

From `packages/latex`, run:

```sh
bash tests/check.sh
```

The check builds the A4 example and a 12-point US Letter, single-sided document.
It rejects unresolved references, missing glyphs, overfull boxes, and font
warnings, and checks that pdfLaTeX is rejected.
Generated files stay in `build/`.

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
