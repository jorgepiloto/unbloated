// SPDX-License-Identifier: LGPL-3.0-only
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { prepareAdapters } from "../scripts/adapters.mjs";
import { render } from "../scripts/build.mjs";
import { renderLatexTokens } from "../scripts/latex-tokens.mjs";
import { fixture } from "./adapters-fixture.mjs";

const css = (await render()).get("unbloat.css");

test("LaTeX maps built CSS colors, dimensions, and typography without copying CSS selectors", () => {
  const modified = css
    .replace("--unbloat-color-text: #000000", "--unbloat-color-text: #222222")
    .replace(
      "--unbloat-heading-size-1: 2rem",
      "--unbloat-heading-size-1: 2.5rem",
    )
    .replace("--unbloat-border-width: 1px", "--unbloat-border-width: 2px");
  const tex = renderLatexTokens(modified);
  assert.ok(tex.includes("\\definecolor{unbloat-color-text}{HTML}{222222}"));
  assert.ok(
    tex.includes("unbloat@heading-size-1\\endcsname{2.5\\UnbloatedRootSize}"),
  );
  assert.ok(tex.includes("unbloat@border-width\\endcsname{1.5bp}"));
  assert.ok(tex.includes(createHash("sha256").update(modified).digest("hex")));
  assert.doesNotMatch(tex, /:where\(|ui-monospace|Cascadia Code/);
});

test("LaTeX rejects missing, duplicate, unsupported, and executable CSS tokens", () => {
  for (const source of [
    "/* No tokens. */",
    css + "\n:root { --unbloat-space-3: 2rem; }",
    css.replace(
      "--unbloat-space-3: 1rem;",
      "--unbloat-space-3: 1rem; --unbloat-space-3: 2rem;",
    ),
    css.replace("--unbloat-space-3: 1rem;", ""),
    css.replace("--unbloat-color-inverse-text: #ffffff;", ""),
    css.replace("--unbloat-color-inverse-surface: #000000;", ""),
    css.replace("--unbloat-space-3: 1rem;", "--unbloat-space-3: 1em;"),
    css.replace(
      "--unbloat-space-3: 1rem;",
      "--unbloat-space-3: 1rem !important;",
    ),
    css.replace(
      "--unbloat-color-text: #000000;",
      "--unbloat-color-text: \\input{secret};",
    ),
  ])
    assert.throws(() => renderLatexTokens(source));
});

test("LaTeX staging rejects modified or missing TeX tokens and records both bundle digests", async (t) => {
  const directory = await fixture(t);
  await prepareAdapters({ directory });
  const styleURL = new URL("packages/latex/unbloated-tokens.sty", directory);
  const style = await readFile(styleURL);
  const metadata = JSON.parse(
    await readFile(new URL("packages/latex/unbloated-core.json", directory)),
  );
  assert.equal(
    metadata.texSha256,
    createHash("sha256").update(style).digest("hex"),
  );
  await writeFile(styleURL, "% Modified fixture\n");
  await assert.rejects(
    prepareAdapters({ directory, check: true }),
    /Stale or modified/,
  );
  await prepareAdapters({ directory });
  await rm(styleURL);
  await assert.rejects(prepareAdapters({ directory, check: true }), {
    code: "ENOENT",
  });
});
