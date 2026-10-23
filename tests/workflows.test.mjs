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

function dependencies(block) {
  const value = /^ {4}needs:\s*(\[[^\]]*\]|[^\n]+)/m.exec(block)?.[1];
  return value
    ? value
        .replaceAll("[", "")
        .replaceAll("]", "")
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    : [];
}

for (const workflow of ["night", "pull-request", "release"]) {
  test(`${workflow} builds the library only after independent documentation, test, and adapter jobs pass`, async () => {
    const source = await readFile(
      new URL(`../.github/workflows/${workflow}.yml`, import.meta.url),
      "utf8",
    );
    const gates = ["doc-build", "tests", "latex-book", "adapter-packages"];
    const library = job(source, "build-library");
    for (const name of gates) {
      const validation = job(source, name);
      assert.deepEqual(
        dependencies(validation),
        [],
        `${name} must run independently`,
      );
      assert.ok(
        dependencies(library).includes(name),
        `${name} must gate packaging`,
      );
      assert.doesNotMatch(validation, /always\(\)|continue-on-error/);
    }
    if (workflow !== "night") {
      for (const name of ["code-style", "actions-style"])
        assert.ok(dependencies(library).includes(name));
    }
    assert.doesNotMatch(library, /always\(\)|continue-on-error/);
    const documentation = job(source, "doc-build");
    assert.match(documentation, /playwright install --with-deps chromium/);
    assert.match(
      documentation,
      /npm run docs:build[^\n]*\n\s+- run: npm run test:docs\n\s+- uses: actions\/upload-artifact/,
    );
    assert.doesNotMatch(documentation, /actions\/download-artifact/);
    assert.doesNotMatch(
      job(source, "tests"),
      /test:docs|documentation-html|documentation-versioned/,
    );
    assert.match(job(source, "tests"), /npm run test:browser/);
  });
}

test("development publication waits for validation and uses the checked artifact", async () => {
  const source = await readFile(
    new URL("../.github/workflows/night.yml", import.meta.url),
    "utf8",
  );
  const deploy = job(source, "doc-deploy-dev");
  assert.deepEqual(dependencies(deploy), ["build-library"]);
  assert.doesNotMatch(deploy, /always\(\)|continue-on-error/);
  assert.match(deploy, /if: github.ref == 'refs\/heads\/main'/);
  assert.match(
    job(source, "doc-build"),
    /name: documentation-html\n\s+path: site/,
  );
  assert.match(job(source, "tests"), /npm run lint/);
  assert.match(deploy, /name: documentation-html\n\s+path: documentation-html/);
  assert.match(deploy, /publish_dir: documentation-html/);
});

test("both release documentation artifacts are validated before publication", async () => {
  const source = await readFile(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  );
  const validation = job(source, "doc-build");
  assert.match(validation, /name: documentation-html\n\s+path: site/);
  assert.match(validation, /name: documentation-versioned\n\s+path: site/);
  assert.equal([...validation.matchAll(/npm run test:docs/g)].length, 2);
  assert.match(
    validation,
    /name: Build versioned documentation\n\s+run: npm run docs:build[^\n]*\n\s+- run: npm run test:docs\n\s+- uses: actions\/upload-artifact[^]*name: documentation-versioned/,
  );
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
