// SPDX-License-Identifier: LGPL-3.0-only
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setImmediate } from "node:timers/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const script = await readFile(
  new URL(
    "../packages/sphinx/src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/static/js/version-switcher.js",
    import.meta.url,
  ),
  "utf8",
);

async function versions(path, feed, { ok = true } = {}) {
  const callbacks = {};
  const wrapper = { style: {} };
  const select = {
    dataset: { versionsUrl: "/versions.json" },
    options: [],
    replaceChildren() {
      this.options = [];
    },
    appendChild(option) {
      this.options.push(option);
    },
    prepend(option) {
      this.options.unshift(option);
    },
    addEventListener(event, callback) {
      callbacks[event] = callback;
    },
    closest() {
      return wrapper;
    },
  };
  const location = new URL(path, "https://example.org");
  const navigated = [];
  location.assign = (url) => navigated.push(url);
  runInNewContext(script, {
    URL,
    document: {
      baseURI: location.href,
      addEventListener: (_event, callback) => callback(),
      getElementById: () => select,
      createElement: () => ({}),
    },
    window: { location },
    fetch: async () => ({ ok, json: async () => feed }),
  });
  await setImmediate();
  return { select, wrapper, callbacks, navigated };
}

test("version matching uses path boundaries and the longest root independently of feed ordering", async () => {
  for (const feed of [
    ["/docs/v1", "/docs/v10", "/docs/v10/preview/"],
    ["/docs/v10/preview/", "/docs/v10", "/docs/v1"],
  ]) {
    const entries = feed.map((url) => ({ name: url, url }));
    for (const [page, expected] of [
      ["/docs/v10/guide.html", "/docs/v10"],
      ["/docs/v10/preview/guide.html", "/docs/v10/preview/"],
      ["/docs/v1", "/docs/v1"],
      ["/docs/v1/guide/?query=1#section", "/docs/v1"],
    ]) {
      const { select } = await versions(page, entries);
      assert.equal(select.value, "https://example.org" + expected);
    }
  }
});

test("directory roots allow trailing slashes and dotted version names; HTML destinations match exact pages", async () => {
  for (const [page, destination, selected] of [
    ["/docs/v1/guide", "/docs/v1/", true],
    ["/docs/v1/", "/docs/v1", true],
    ["/docs/v1", "/docs/v1/", true],
    ["/docs/v1.0/guide", "/docs/v1.0", true],
    ["/docs/guide.html?local=1#part", "/docs/guide.html?feed=1#top", true],
    ["/docs/guide.html/child", "/docs/guide.html", false],
    ["/docs/v10/guide", "/docs/v1", false],
    ["/docs/v10/guide.html", "../v1/", false],
    ["/other/", "/docs/", false],
    ["/docs/content.html", "/", true],
  ]) {
    const { select } = await versions(page, [
      { name: "Version", url: destination },
    ]);
    assert.equal(
      select.value,
      selected ? new URL(destination, "https://example.org" + page).href : "",
    );
    if (!selected) {
      assert.equal(select.options[0].textContent, "Current page (unlisted)");
      assert.equal(select.options[0].disabled, true);
    }
  }
});

test("version feeds retain literal labels and validated navigation, with visible unmatched state", async () => {
  const label = 'Version <T> & "$&"';
  const { select, callbacks, navigated } = await versions(
    "/docs/content.html",
    [
      { name: "Other site", url: "https://other.example/docs/" },
      { name: "Credentials", url: "https://user:password@example.org/docs/" },
      { name: "Script", url: "javascript:alert(1)" },
      { name: label, url: "/docs/index.html?version=1#section" },
      null,
    ],
  );
  assert.equal(select.options.length, 2);
  assert.equal(select.value, "");
  assert.equal(select.options[1].textContent, label);
  select.value = select.options[1].value;
  callbacks.change();
  assert.deepEqual(navigated, [
    "https://example.org/docs/index.html?version=1#section",
  ]);
  select.value = "javascript:alert(1)";
  callbacks.change();
  assert.equal(navigated.length, 1);
});

test("failed, malformed, empty, and invalid-only feeds hide the version selector", async () => {
  for (const [feed, options] of [
    [[], {}],
    [{}, {}],
    [[{ name: "Invalid", url: "ftp://example.org/docs/" }], {}],
    [[], { ok: false }],
  ]) {
    const { wrapper } = await versions("/docs/", feed, options);
    assert.equal(wrapper.style.display, "none");
  }
});
