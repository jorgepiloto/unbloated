// SPDX-License-Identifier: LGPL-3.0-only
/** Package staged adapters with tar, npm, and Python's build frontend. */
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { prepareAdapters, root } from "./adapters.mjs";

const execFile = promisify(execFileCallback);

/**
 * Pack verified bundles into Quarto/LaTeX archives, Hugo tarball, and Sphinx builds.
 * Write to .cache/artifacts/; failures can leave already-created archives in place.
 * PYTHON selects the builder executable; relative paths resolve in packages/sphinx.
 * @param {{directory?: URL}} [options] Checkout root.
 * @returns {Promise<void>}
 * @throws {Error} On invalid bundles, missing tools, I/O errors, or failed builders.
 */
export async function packAdapters({ directory = root } = {}) {
  await prepareAdapters({ directory, check: true });
  const { version } = JSON.parse(
    await readFile(new URL("package.json", directory)),
  );
  const output = fileURLToPath(new URL(".cache/artifacts/", directory));
  await mkdir(output, { recursive: true });
  await execFile("tar", [
    "-czf",
    `${output}unbloated-quarto-${version}.tar.gz`,
    "-C",
    fileURLToPath(new URL("packages/quarto/", directory)),
    "_extensions",
    "template.qmd",
    "README.md",
  ]);
  await execFile("tar", [
    "-czf",
    `${output}unbloated-latex-${version}.tar.gz`,
    "-C",
    fileURLToPath(new URL("packages/", directory)),
    ...[
      "unbloated-book.cls",
      "unbloated-tokens.sty",
      "unbloat.css",
      "unbloated-core.json",
      "licenses",
      "README.md",
      "example",
      "tests",
    ].map((name) => `latex/${name}`),
  ]);
  const args = ["pack", "--ignore-scripts", "--pack-destination", output];
  await execFile(
    process.env.npm_execpath ? process.execPath : "npm",
    process.env.npm_execpath ? [process.env.npm_execpath, ...args] : args,
    { cwd: new URL("packages/hugo/", directory) },
  );
  await execFile(
    process.env.PYTHON || "python3",
    ["-m", "build", "--outdir", output],
    { cwd: new URL("packages/sphinx/", directory) },
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await packAdapters();
}
