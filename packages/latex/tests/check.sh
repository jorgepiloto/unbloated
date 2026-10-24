#!/usr/bin/env bash
# SPDX-License-Identifier: LGPL-3.0-only
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

for source in example/book.tex tests/options.tex tests/layout.tex; do
  latexmk -lualatex -no-shell-escape -interaction=nonstopmode \
    -halt-on-error -file-line-error -Werror -outdir=build "$source"
done

if grep -En 'undefined|multiply defined|Missing character:|Overfull|LaTeX Font Warning:' \
  build/book.log build/options.log build/layout.log; then
  printf '%s\n' 'LaTeX output contains unresolved references or typography errors.' >&2
  exit 1
else
  status=$?
  if (( status != 1 )); then
    exit "$status"
  fi
fi

mkdir -p build/wrong-engine
if pdflatex -no-shell-escape -interaction=nonstopmode -halt-on-error \
  -output-directory=build/wrong-engine example/book.tex > build/wrong-engine/output.txt 2>&1; then
  printf '%s\n' 'The class unexpectedly accepted pdfLaTeX.' >&2
  exit 1
fi
if ! grep -Fq 'LuaLaTeX is required' build/wrong-engine/output.txt; then
  printf '%s\n' 'pdfLaTeX failed without the expected engine diagnostic.' >&2
  exit 1
fi
