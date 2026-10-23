// SPDX-License-Identifier: LGPL-3.0-only
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { buildHugo } from "./consumer-fixtures.mjs";

test("real Hugo output preserves discovery, years, locale, links, and shortcode data", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "unbloated-hugo-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const { output, stderr } = await buildHugo(directory);
  assert.doesNotMatch(stderr, /deprecated/i);
  const read = (path) => readFile(join(output, path), "utf8");
  const post = await read("posts/current/index.html");
  assert.match(post, /lang="fr-FR"/);
  assert.match(post, /og:locale" content="fr_FR"/);
  assert.match(post, /href="\/prefix\/favicon.ico"/);
  assert.doesNotMatch(post, /onclick=|id="plant-info"|<button/);
  assert.match(post, /aria-current="true"/);
  const fields = [...post.matchAll(/<dd>([^<]*)<\/dd>/g)].map(
    (match) => match[1],
  );
  assert.equal(fields.length, 16);
  assert.ok(fields.every((value) => value.length > 0));
  assert.match(post, /<dt>Type<\/dt><dd>Perennial<\/dd>/);
  assert.match(post, /id="plotly-2"/);
  assert.match(post, /id="plotly-3"/);
  assert.match(
    post,
    /const dataURL = "\/prefix\/plot.json\?a=1\u0026b=2"|const dataURL = "\/prefix\/plot.json\?a=1\\u0026b=2"/,
  );
  for (const path of [
    "index.json",
    "index.xml",
    "sitemap.xml",
    "index.html",
    "posts/index.html",
    "tags/topic/index.html",
    "categories/topic/index.html",
  ]) {
    const text = await read(path);
    assert.doesNotMatch(text, /PrivateMarker|NoindexMarker/, path);
  }
  for (const path of ["tags/topic/index.html", "categories/topic/index.html"]) {
    const text = await read(path);
    assert.match(text, /Year 2026/);
    assert.match(text, /Year 2022/);
    assert.doesNotMatch(text, /Year 2024|This is layouts/);
  }
  assert.match(
    await read("search/index.html"),
    /data-index-url="\/prefix\/index.json"/,
  );
  assert.match(
    await read("index.xml"),
    /<title>Tools &amp; &lt;Interfaces&gt;<\/title>/,
  );
  const callbacks = [];
  const requests = [];
  const rendered = [];
  const containers = new Map(
    ["plotly-2", "plotly-3"].map((id) => [id, { id }]),
  );
  for (const [, script] of post.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (!script.includes("const plotId")) continue;
    runInNewContext(script, {
      document: {
        addEventListener: (_event, callback) => callbacks.push(callback),
        getElementById: (id) => containers.get(id),
      },
      fetch: async (url) => {
        requests.push(url);
        return { ok: true, json: async () => ({ data: [], layout: {} }) };
      },
      Plotly: { newPlot: async (container) => rendered.push(container.id) },
      console,
    });
  }
  await Promise.all(callbacks.map((callback) => callback()));
  assert.deepEqual(requests, [
    "/prefix/plot.json?a=1&b=2",
    "/prefix/plot.json?a=1&b=2",
  ]);
  assert.deepEqual(rendered, ["plotly-2", "plotly-3"]);
  const index = JSON.parse(await read("index.json"));
  assert.ok(index.some((item) => item.title === 'Vector<T> & Buffer "$&"'));
});
