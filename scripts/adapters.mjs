// SPDX-License-Identifier: LGPL-3.0-only
/** Stage or verify core bundles and the LaTeX translation of their CSS tokens. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { checkAdapterStyles } from "./adapter-styles.mjs";
import { renderLatexTokens } from "./latex-tokens.mjs";

/** Checkout root used for source, bundle, and license paths. @type {URL} */
export const root = new URL("../", import.meta.url);
/** Adapter names mapped to asset directories relative to the checkout root. */
export const adapters = {
  sphinx:
    "packages/sphinx/src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/static/css/",
  quarto: "packages/quarto/_extensions/unbloated/",
  hugo: "packages/hugo/assets/css/",
  latex: "packages/latex/",
};

/**
 * Bundle the core build unchanged, or reject missing, stale, or modified bundles.
 * Check style ownership before writing. Check mode reads without updating assets.
 * @param {{directory?: URL, check?: boolean}} [options] Checkout and check mode.
 * @returns {Promise<void>}
 * @throws {Error} On missing sources, invalid adapter styles, stale bytes, or I/O errors.
 */
export async function prepareAdapters({
  directory = root,
  check = false,
} = {}) {
  const manifest = JSON.parse(
    await readFile(new URL("package.json", directory)),
  );
  const css = await readFile(new URL("dist/unbloat.css", directory));
  await checkAdapterStyles({ directory, core: css.toString("utf8") });
  const coreMetadata = {
    name: manifest.name,
    version: manifest.version,
    sha256: createHash("sha256").update(css).digest("hex"),
  };
  const latex = Buffer.from(renderLatexTokens(css.toString("utf8")));
  const licenses = await Promise.all(
    ["LICENSE", "COPYING", "NOTICE"].map(async (name) => [
      name,
      await readFile(new URL(name, directory)),
    ]),
  );
  for (const [name, path] of Object.entries(adapters)) {
    const target = new URL(path, directory);
    const metadata =
      name === "latex"
        ? {
            ...coreMetadata,
            texSha256: createHash("sha256").update(latex).digest("hex"),
          }
        : coreMetadata;
    const files = [
      ["unbloat.css", css],
      [
        "unbloated-core.json",
        Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`),
      ],
      ...(name === "latex" ? [["unbloated-tokens.sty", latex]] : []),
      ...licenses.map(([name, content]) => [
        `licenses/unbloated/${name}`,
        content,
      ]),
    ];
    for (const [name, expected] of files) {
      const destination = new URL(name, target);
      if (check) {
        const actual = await readFile(destination);
        if (!actual.equals(expected)) {
          throw new Error(
            `Stale or modified adapter asset: ${destination.pathname}`,
          );
        }
      } else {
        await mkdir(new URL("./", destination), { recursive: true });
        await writeFile(destination, expected);
      }
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.slice(2).some((arg) => arg !== "--check")) {
    throw new Error("Usage: node scripts/adapters.mjs [--check]");
  }
  await prepareAdapters({ check: process.argv.includes("--check") });
}
