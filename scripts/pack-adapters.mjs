// SPDX-License-Identifier: LGPL-3.0-only
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { prepareAdapters, root } from "./adapters.mjs";

const execFile = promisify(execFileCallback);

/**
 * Pack verified bundles into the Quarto archive, Hugo tarball, and Sphinx builds.
 * @param {{directory?: URL}} [options] Checkout root.
 * @returns {Promise<void>}
 */
export async function packAdapters({ directory = root } = {}) {
  await prepareAdapters({ directory, check: true });
  const { version } = JSON.parse(
    await readFile(new URL("package.json", directory)),
  );
  const output = fileURLToPath(new URL(".artifacts/", directory));
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
