// SPDX-License-Identifier: LGPL-3.0-only
import { cp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile as callback } from "node:child_process";
import { promisify } from "node:util";
import { checkout } from "./consumer-fixtures.mjs";
const execFile = promisify(callback);

/** Build real Reveal.js slides with images and all native footer modes. */
export async function buildQuarto(directory, { footer = true } = {}) {
  await cp(
    join(checkout, "packages/quarto/_extensions"),
    join(directory, "_extensions"),
    { recursive: true },
  );
  await writeFile(
    join(directory, "wide.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1200"><rect width="2400" height="1200" fill="black"/></svg>',
  );
  await writeFile(
    join(directory, "slides.qmd"),
    `---
title: Roadmap Fixture
format:
  unbloated-revealjs:
    embed-resources: false
${footer ? "    footer: Global footer" : ""}
---

## Global

::: {.columns}
::: {.column width="40%"}
![Column caption](wide.svg){width=2400}
:::
::: {.column width="60%"}
![Authored size](wide.svg){width=120}
:::
:::

## Local

Local content

${footer ? "::: {.footer}\nLocal footer\n:::" : ""}

## Suppressed {footer=false}

No footer

## Default Again

Default content
`,
  );
  await execFile(process.env.QUARTO_BIN || "quarto", [
    "render",
    join(directory, "slides.qmd"),
  ]);
  return directory;
}
