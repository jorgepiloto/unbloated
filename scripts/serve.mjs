// SPDX-License-Identifier: LGPL-3.0-only
/** Serve the reference page and generated CSS on loopback at port 4173. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
// Map public URLs to fixed files and MIME types. Request paths never become paths
// on disk, and aliases keep stylesheet URLs valid for both reference-page routes.
const routes = new Map([
  ["/", ["examples/index.html", "text/html"]],
  ["/examples/index.html", ["examples/index.html", "text/html"]],
  ["/examples/example.css", ["examples/example.css", "text/css"]],
  ["/example.css", ["examples/example.css", "text/css"]],
  ...["unbloat.css", "tokens.css", "base.css", "components.css"].map((name) => [
    `/dist/${name}`,
    [`dist/${name}`, "text/css"],
  ]),
]);

// Support only GET and HEAD for the allowlisted routes. Apply restrictive headers
// to successful and rejected requests; the preview page does not need scripts.
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const route = routes.get(pathname);
  const headers = {
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy":
      "default-src 'none'; style-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  };
  if (!route || !["GET", "HEAD"].includes(request.method)) {
    response.writeHead(404, headers).end();
    return;
  }
  try {
    const content = await readFile(new URL(route[0], root));
    response.writeHead(200, {
      ...headers,
      "Content-Type": `${route[1]}; charset=utf-8`,
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    response.writeHead(500, headers).end();
  }
});
server.listen(4173, "127.0.0.1", () =>
  console.log("Preview: http://127.0.0.1:4173"),
);
// Close the listener when the terminal or test runner terminates the preview.
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close());
