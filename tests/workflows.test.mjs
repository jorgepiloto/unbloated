// SPDX-License-Identifier: LGPL-3.0-only
/** Protect publication dependencies and the artifact validation contract. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function job(source, name) {
  const block = source
    .split(`\n  ${name}:\n`)[1]
    ?.split(/\n {2}[a-z][\w-]*:\n/)[0];
  assert.ok(block, `Missing job: ${name}`);
  return block;
}

test("development publication waits for validation and uses the checked artifact", async () => {
  const source = await readFile(
    new URL("../.github/workflows/night.yml", import.meta.url),
    "utf8",
  );
  const deploy = job(source, "doc-deploy-dev");
  const needs = /needs: \[([^\]]+)\]/
    .exec(deploy)[1]
    .split(",")
    .map((value) => value.trim());
  for (const dependency of ["doc-build", "tests", "build-library"])
    assert.ok(needs.includes(dependency));
  assert.doesNotMatch(deploy, /always\(\)|continue-on-error/);
  const validation = job(source, "tests");
  assert.match(validation, /name: documentation-html\n\s+path: site/);
  assert.match(validation, /npm run test:docs/);
  assert.match(validation, /npm run lint/);
  assert.match(deploy, /name: documentation-html\n\s+path: documentation-html/);
  assert.match(deploy, /publish_dir: documentation-html/);
});

test("both release documentation artifacts are validated before publication", async () => {
  const source = await readFile(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  );
  const validation = job(source, "tests");
  assert.match(validation, /name: documentation-html\n\s+path: site/);
  assert.match(
    validation,
    /name: documentation-versioned\n\s+path: site-versioned/,
  );
  assert.equal([...validation.matchAll(/npm run test:docs/g)].length, 2);
  assert.match(validation, /DOCS_ARTIFACT_DIR: site-versioned/);
});

test("publication metadata and lockfile describe the intended repository and dependency graph", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url)),
  );
  const lock = JSON.parse(
    await readFile(new URL("../package-lock.json", import.meta.url)),
  );
  assert.equal(
    manifest.repository.url,
    "git+https://github.com/jorgepiloto/unbloated.git",
  );
  assert.equal(
    manifest.homepage,
    "https://github.com/jorgepiloto/unbloated#readme",
  );
  assert.equal(
    manifest.bugs,
    "https://github.com/jorgepiloto/unbloated/issues",
  );
  assert.deepEqual(lock.packages[""].devDependencies, manifest.devDependencies);
  assert.equal(
    lock.packages["node_modules/postcss"].version,
    manifest.devDependencies.postcss,
  );
});
