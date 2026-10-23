// SPDX-License-Identifier: LGPL-3.0-only
/** Protect publication dependencies and the artifact validation contract. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { documentationProjects } from "../scripts/project-docs.mjs";

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
    const gates = ["doc-build", "tests", "adapter-latex", "adapter-packages"];
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
      /npm run docs:project[^\n]*\n\s+- run: npm run test:project-docs/,
    );
    assert.doesNotMatch(documentation, /actions\/download-artifact/);
    for (const project of Object.keys(documentationProjects))
      assert.ok(
        documentation.includes(`- ${project}\n`),
        `${project} must have its own documentation build`,
      );
    assert.match(documentation, /fail-fast: false/);
    assert.doesNotMatch(
      job(source, "tests"),
      /test:docs|documentation-html|documentation-versioned/,
    );
    assert.match(job(source, "tests"), /npm run test:browser/);
    const latex = job(source, "adapter-latex");
    assert.match(latex, /npm run build:adapters/);
    assert.match(latex, /npm run check:adapters/);
    assert.match(latex, /node --test tests\/latex.integration.mjs/);
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
  assert.ok(
    job(source, "doc-build").includes(
      "name: documentation-${{ matrix.project }}-dev",
    ),
  );
  assert.match(job(source, "tests"), /npm run lint/);
  assert.match(deploy, /pattern: documentation-\*/);
  for (const project of Object.keys(documentationProjects)) {
    assert.ok(
      deploy.includes(
        `publish_dir: documentation/documentation-${project}-dev`,
      ),
    );
    assert.ok(
      deploy.includes(`destination_dir: projects/${project}/version/dev`),
    );
  }
  assert.doesNotMatch(deploy, /destination_dir: projects\s*$/m);
});

test("both release documentation artifacts are validated before publication", async () => {
  const source = await readFile(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  );
  const validation = job(source, "doc-build");
  assert.ok(
    validation.includes("name: documentation-${{ matrix.project }}-stable"),
  );
  assert.match(validation, /name: documentation-unbloated-versioned/);
  assert.equal(
    [...validation.matchAll(/npm run test:project-docs/g)].length,
    2,
  );
  assert.equal([...validation.matchAll(/npm run test:docs/g)].length, 2);
  const deploy = job(source, "doc-deploy-stable");
  for (const project of Object.keys(documentationProjects)) {
    assert.ok(
      deploy.includes(
        `publish_dir: documentation/documentation-${project}-stable`,
      ),
    );
    assert.ok(
      deploy.includes(`destination_dir: projects/${project}/version/stable`),
    );
  }
  assert.ok(
    deploy.includes(
      "publish_dir: documentation/documentation-unbloated-versioned",
    ),
  );
  assert.deepEqual(dependencies(deploy), ["release-github", "doc-build"]);
  assert.doesNotMatch(
    deploy,
    /always\(\)|continue-on-error|destination_dir: projects\s*$/m,
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
