// SPDX-License-Identifier: LGPL-3.0-only
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { docsArtifact } from "../scripts/docs-artifact.mjs";
import { documentationHandler } from "../scripts/serve-docs.mjs";
import { handlePreviewRequest } from "../scripts/serve.mjs";

async function request(handler, url, method = "GET") {
  const response = {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    writeHead(code, headers) {
      this.code = code;
      Object.assign(this.headers, headers);
      return this;
    },
    end(body) {
      this.body = body;
    },
  };
  await handler({ url, method }, response);
  return response;
}

test("malformed preview requests are bounded and subsequent valid requests work", async () => {
  const invalid = await request(handlePreviewRequest, "//[");
  assert.equal(invalid.code, 400);
  assert.equal(invalid.headers["X-Content-Type-Options"], "nosniff");
  const valid = await request(handlePreviewRequest, "/");
  assert.equal(valid.code, 200);
  assert.deepEqual(
    valid.body,
    await readFile(new URL("../examples/index.html", import.meta.url)),
  );
});

test("stable and versioned artifact checks serve exact bytes only at the built prefix", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "unbloated-artifact-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const version of ["stable", "0.1.0"]) {
    const prefix = `/projects/unbloated/version/${version}/`;
    const root = join(directory, version);
    await mkdir(root);
    const html = `<link rel="stylesheet" href="${prefix}unbloat.abc123.css"><p id="content">Exact ${version} artifact</p>`;
    const css = "/* exact uploaded bytes */";
    await writeFile(join(root, "index.html"), html);
    await writeFile(join(root, "unbloat.abc123.css"), css);
    const artifact = await docsArtifact(root);
    assert.equal(artifact.prefix, prefix);
    const handler = documentationHandler(artifact);
    assert.equal((await request(handler, prefix)).body.toString(), html);
    assert.equal(
      (await request(handler, prefix + "unbloat.abc123.css")).body.toString(),
      css,
    );
    assert.equal((await request(handler, "/unbloat.abc123.css")).code, 404);
    assert.equal(
      (await request(handler, prefix + "%2e%2e%2fpackage.json")).code,
      404,
    );
    assert.equal((await request(handler, "//[")).code, 400);
    assert.equal((await request(handler, prefix)).code, 200);
    assert.equal(await readFile(join(root, "index.html"), "utf8"), html);
    assert.equal((await request(handler, prefix, "HEAD")).body, undefined);
  }
});
