// SPDX-License-Identifier: LGPL-3.0-only
/** Serve exact documentation bytes at their deployment prefix on loopback. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { docsArtifact } from "./docs-artifact.mjs";

/**
 * Create a static handler without opening a listener or rebuilding the artifact.
 * Translate malformed URLs, missing paths, and read errors to HTTP responses.
 * @param {{directory: URL, prefix: string}} artifact Directory and URL prefix.
 * @returns {import("node:http").RequestListener} GET/HEAD handler for trusted local output.
 */
export function documentationHandler({ directory, prefix }) {
  const root = fileURLToPath(directory);
  const mime = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".xml": "application/xml",
    ".pdf": "application/pdf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };
  return async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://127.0.0.1").pathname,
      );
    } catch {
      response.writeHead(400).end();
      return;
    }
    if (
      !["GET", "HEAD"].includes(request.method) ||
      !pathname.startsWith(prefix)
    ) {
      response.writeHead(404).end();
      return;
    }
    const relative = pathname.slice(prefix.length);
    const path = resolve(
      root,
      relative + (pathname.endsWith("/") ? "index.html" : ""),
    );
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) {
      response.writeHead(404).end();
      return;
    }
    try {
      const content = await readFile(path);
      response.writeHead(200, {
        "Content-Type": mime[extname(path)] || "application/octet-stream",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch (error) {
      response
        .writeHead(
          error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 500,
        )
        .end();
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const artifact = await docsArtifact();
  const { prefix } = artifact;
  const server = createServer(documentationHandler(artifact));
  server.listen(4174, "127.0.0.1", () =>
    console.log(`Artifact: http://127.0.0.1:4174${prefix}`),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => server.close());
}
