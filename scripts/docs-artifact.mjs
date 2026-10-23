// SPDX-License-Identifier: LGPL-3.0-only
/** Locate existing documentation output without invoking its source build. */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Read an existing artifact and infer its mount path from its core CSS URL.
 * DOCS_ARTIFACT_DIR selects the downloaded directory; no source is rebuilt.
 * @param {string} [artifactDirectory] Directory relative to cwd, defaulting to site.
 * @returns {Promise<{directory: URL, prefix: string}>} Directory and URL prefix.
 * @throws {Error} If the artifact is missing or has no built core stylesheet.
 */
export async function docsArtifact(
  artifactDirectory = process.env.DOCS_ARTIFACT_DIR || "site",
) {
  const directory = pathToFileURL(resolve(artifactDirectory) + "/");
  const html = await readFile(new URL("index.html", directory), "utf8");
  const href = /href="([^"]*\/unbloat\.[a-f0-9]+\.css)"/.exec(html)?.[1];
  if (!href)
    throw new Error(
      "Build or download the documentation artifact before testing it.",
    );
  const pathname = new URL(href, "http://127.0.0.1").pathname;
  return {
    directory,
    prefix: pathname.slice(0, pathname.lastIndexOf("/") + 1),
  };
}
