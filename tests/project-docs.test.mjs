// SPDX-License-Identifier: LGPL-3.0-only
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  documentationProjects,
  projectDocumentation,
} from "../scripts/project-docs.mjs";
import { docsArtifact } from "../scripts/docs-artifact.mjs";
import { adapters } from "../scripts/adapters.mjs";

test("each adapter has an isolated development and stable documentation prefix", () => {
  const packageDirectories = Object.values(adapters).map((path) =>
    path.split("/").slice(0, 2).join("/"),
  );
  const documentedDirectories = Object.values(documentationProjects)
    .filter((project) => project.builder !== "core")
    .map((project) => project.directory);
  assert.deepEqual(documentedDirectories.sort(), packageDirectories.sort());
  const prefixes = new Set();
  for (const project of Object.keys(documentationProjects))
    for (const channel of ["dev", "stable"]) {
      const target = projectDocumentation(project, channel);
      assert.equal(
        target.baseURL,
        `https://jorgemartinez.space/projects/${project}/version/${channel}/`,
      );
      assert.ok(
        target.directory.pathname.endsWith(
          `/project-docs/${project}/${channel}/`,
        ),
      );
      prefixes.add(target.baseURL);
    }
  assert.equal(prefixes.size, Object.keys(documentationProjects).length * 2);
  for (const [project, channel] of [
    ["../other", "dev"],
    ["unbloated", "../../"],
    ["unbloated-book", "0.1.0"],
  ])
    assert.throws(() => projectDocumentation(project, channel));
  assert.ok(
    projectDocumentation("unbloated", "0.1.0").baseURL.endsWith(
      "/version/0.1.0/",
    ),
  );
});

test("native documentation artifacts retain their declared prefix and reject invalid manifests", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "unbloated-project-docs-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(
    join(directory, "index.html"),
    '<link rel="stylesheet" href="_static/css/unbloat.css">',
  );
  const manifest = {
    baseURL: "https://example.org/projects/sphinx/version/dev/",
    prefix: "/projects/sphinx/version/dev/",
  };
  await writeFile(
    join(directory, "documentation.json"),
    JSON.stringify(manifest),
  );
  assert.equal((await docsArtifact(directory)).prefix, manifest.prefix);
  await writeFile(
    join(directory, "documentation.json"),
    JSON.stringify({ ...manifest, prefix: "/other/" }),
  );
  await assert.rejects(
    docsArtifact(directory),
    /Invalid documentation artifact prefix/,
  );
  assert.match(
    await readFile(join(directory, "index.html"), "utf8"),
    /_static/,
  );
});
