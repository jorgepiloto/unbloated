// SPDX-License-Identifier: LGPL-3.0-only
/** Compile isolated LaTeX consumers to verify that core CSS changes affect TeX output. */
import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { render } from "../scripts/build.mjs";
import { renderLatexTokens } from "../scripts/latex-tokens.mjs";

const execFile = promisify(execFileCallback);
const core = (await render()).get("unbloat.css");
const classSource = await readFile(
  new URL("../packages/latex/unbloated-book.cls", import.meta.url),
);

for (const changed of [false, true]) {
  test(`isolated LaTeX consumer applies ${changed ? "modified" : "default"} core CSS`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "unbloated-latex-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const css = changed
      ? core
          .replace(
            "--unbloat-color-text: #000000",
            "--unbloat-color-text: #222222",
          )
          .replace("--unbloat-font-size: 1rem", "--unbloat-font-size: 1.1rem")
          .replace(
            "--unbloat-line-height-body: 1.6",
            "--unbloat-line-height-body: 1.8",
          )
          .replace(
            "--unbloat-heading-size-1: 2rem",
            "--unbloat-heading-size-1: 2.5rem",
          )
          .replace("--unbloat-space-3: 1rem", "--unbloat-space-3: 1.25rem")
          .replace("--unbloat-border-width: 1px", "--unbloat-border-width: 2px")
      : core;
    await writeFile(join(directory, "unbloat.css"), css);
    await writeFile(
      join(directory, "unbloated-tokens.sty"),
      renderLatexTokens(css),
    );
    await writeFile(join(directory, "unbloated-book.cls"), classSource);
    await writeFile(
      join(directory, "consumer.tex"),
      String.raw`\documentclass[12pt,oneside,openany]{unbloated-book}
\makeatletter
\newcommand{\AssertDimension}[2]{%
  \ifdim\dimexpr#1-#2\relax<0.01pt
    \ifdim\dimexpr#2-#1\relax<0.01pt\else\errmessage{Core dimension too small}\fi
  \else\errmessage{Core dimension too large}\fi
}
\newcommand{\CheckHeading}{\AssertDimension{\f@size pt}{${changed ? "30" : "24"}pt}}
\AtBeginDocument{%
  \AssertDimension{\f@size pt}{${changed ? "13.2" : "12"}pt}%
  \AssertDimension{\baselineskip}{${changed ? "23.76" : "19.2"}pt}%
  \AssertDimension{\parskip}{${changed ? "15" : "12"}pt}%
  \AssertDimension{\lightrulewidth}{${changed ? "1.5" : "0.75"}bp}%
  \convertcolorspec{named}{.}{HTML}\ActualColor
  \def\ExpectedColor{${changed ? "222222" : "000000"}}%
  \ifx\ActualColor\ExpectedColor\else\errmessage{Core text color was not applied}\fi
}
\makeatother
\begin{document}
\chapter*{\CheckHeading Shared Core}
This isolated document uses the generated adapter without Node or shell escape.
A formula \(x^2 + y^2 = z^2\) retains TeX mathematics.
\begin{lstlisting}
int count = 42;
\end{lstlisting}
\end{document}
`,
    );
    const { stdout } = await execFile(
      "lualatex",
      [
        "-no-shell-escape",
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-file-line-error",
        "consumer.tex",
      ],
      {
        cwd: directory,
        env: { ...process.env, TEXINPUTS: ".:" },
        timeout: 60000,
      },
    );
    assert.match(stdout, /Output written on consumer.pdf/);
    assert.doesNotMatch(
      stdout,
      /Missing character:|Overfull|LaTeX Font Warning:/,
    );
    assert.ok((await readFile(join(directory, "consumer.pdf"))).length > 0);
  });
}
