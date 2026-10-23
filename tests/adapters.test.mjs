// SPDX-License-Identifier: LGPL-3.0-only
import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { adapters, prepareAdapters } from "../scripts/adapters.mjs";
import {
  assertAdapterStyle,
  checkAdapterStyles,
} from "../scripts/adapter-styles.mjs";
import { fixture } from "./adapters-fixture.mjs";

test("all adapters bundle the exact core CSS, version, and license notices", async (t) => {
  const directory = await fixture(t);
  await prepareAdapters({ directory });
  await prepareAdapters({ directory, check: true });
  const core = await readFile(new URL("dist/unbloat.css", directory));
  for (const path of Object.values(adapters)) {
    assert.deepEqual(
      await readFile(new URL(`${path}unbloat.css`, directory)),
      core,
    );
    const metadata = JSON.parse(
      await readFile(new URL(`${path}unbloated-core.json`, directory)),
    );
    assert.equal(metadata.name, "unbloated");
    assert.equal(metadata.version, "0.1.0");
    assert.match(metadata.sha256, /^[a-f0-9]{64}$/);
  }
});

test("core changes invalidate every adapter until assets are rebuilt", async (t) => {
  const directory = await fixture(t);
  await prepareAdapters({ directory });
  await writeFile(
    new URL("dist/unbloat.css", directory),
    "/* Changed test fixture. */",
  );
  await assert.rejects(
    prepareAdapters({ directory, check: true }),
    /Stale or modified/,
  );
  await prepareAdapters({ directory });
  await prepareAdapters({ directory, check: true });
});

test("tampered or missing CSS, provenance, and licenses fail validation", async (t) => {
  const directory = await fixture(t);
  for (const path of Object.values(adapters)) {
    for (const file of [
      "unbloat.css",
      "unbloated-core.json",
      "licenses/unbloated/LICENSE",
    ]) {
      await prepareAdapters({ directory });
      await writeFile(new URL(`${path}${file}`, directory), "modified");
      await assert.rejects(
        prepareAdapters({ directory, check: true }),
        /Stale or modified/,
      );
    }
  }
  await prepareAdapters({ directory });
  await rm(new URL(`${adapters.sphinx}unbloat.css`, directory));
  await assert.rejects(prepareAdapters({ directory, check: true }), {
    code: "ENOENT",
  });
});

test("adapters cannot introduce their own palette, fonts, or core definitions", () => {
  for (const source of [
    "a { color: #ffffff; }",
    "a { color: rebeccapurple; }",
    "a { color: rgb(0 0 0); }",
    "a { --accent: #fff; }",
    ":root { --accent: rebeccapurple; }",
    "a { box-shadow: 2px 2px var(--unbloat-color-shadow); }",
    ":root { --h1-font-size: 4rem; }",
    "a { border: thin solid var(--unbloat-color-border); }",
    "a { border-radius: 4px; }",
    "a { font-family: monospace; }",
    ":root { --unbloat-color-text: inherit; }",
    "a { color: var(--unbloat-color-text, red); }",
  ])
    assert.throws(() => assertAdapterStyle(source));
  assertAdapterStyle(
    "a { color: var(--unbloat-color-text); font-family: var(--unbloat-font-family); border: var(--unbloat-border-width) solid currentColor; width: 800px; }",
  );
});

test("undefined core variable names fail before assets are staged", () => {
  assert.throws(
    () =>
      assertAdapterStyle("a { color: var(--unbloat-missing); }", {
        core: ":root { --unbloat-color-text: initial; }",
      }),
    /Unknown core variable/,
  );
});

test("authored adapter styles obey the single-source contract", async () => {
  await checkAdapterStyles();
});
