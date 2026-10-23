// SPDX-License-Identifier: LGPL-3.0-only
/** Run the shipped search script against the DOM methods it is allowed to use. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setImmediate } from "node:timers/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const script = await readFile(
  new URL("../packages/hugo/static/js/search.js", import.meta.url),
  "utf8",
);
class Element {
  children = [];
  dataset = {};
  ownText = "";
  constructor(tagName) {
    this.tagName = tagName;
  }
  set textContent(value) {
    this.ownText = String(value);
    this.children = [];
  }
  get textContent() {
    return (
      this.ownText + this.children.map((child) => child.textContent).join("")
    );
  }
  get childElementCount() {
    return this.children.length;
  }
  set innerHTML(_value) {
    throw new Error("Search strings must remain literal text");
  }
  append(...children) {
    this.children.push(...children);
  }
  replaceChildren(...children) {
    this.ownText = "";
    this.children = children;
  }
}

async function search(parameters, { data, ok = true, fuse = true } = {}) {
  const container = new Element("div");
  container.dataset.indexUrl = "/prefix/index.json";
  const input = new Element("input");
  const queries = [];
  const requests = [];
  runInNewContext(script, {
    URL,
    URLSearchParams,
    location: {
      href: `https://example.org/prefix/search/?${parameters}`,
      search: `?${parameters}`,
      origin: "https://example.org",
    },
    document: {
      getElementById: (id) => (id === "search-results" ? container : input),
      createElement: (tag) => new Element(tag),
    },
    fetch: async (url) => {
      requests.push(url.href);
      return { ok, json: async () => data || [] };
    },
    ...(fuse
      ? {
          Fuse: class {
            constructor(items) {
              this.items = items;
            }
            search(query) {
              queries.push(query);
              return this.items.map((item) => ({ item, matches: [] }));
            }
          },
        }
      : {}),
  });
  await setImmediate();
  return { container, input, queries, requests };
}

test("search parses malformed escapes, encoded separators, plus signs, and repeated parameters", async () => {
  for (const [parameter, query] of [
    ["s=%", "%"],
    ["s=one%26two", "one&two"],
    ["s=one+two", "one two"],
    ["s=%2B", "+"],
    ["s=first&s=second", "first"],
  ]) {
    const result = await search(parameter);
    assert.equal(result.input.value, query);
    assert.deepEqual(result.queries, [query]);
    assert.deepEqual(result.requests, [
      "https://example.org/prefix/index.json",
    ]);
    assert.equal(result.container.textContent, "No matches found");
  }
  const empty = await search("s=&s=second");
  assert.equal(
    empty.container.textContent,
    "Please enter a word or phrase above",
  );
  assert.deepEqual(empty.requests, []);
});

test("search result strings preserve literal text and reject other-site and script destinations", async () => {
  const title = 'Vector<T> & Buffer "$&" ユニコード';
  const contents = 'Literal <Tag> & "$&"';
  const result = await search("s=Vector", {
    data: [
      {
        title,
        contents,
        tags: ["A<B>"],
        categories: ["C&D"],
        permalink: "https://example.org/prefix/post/",
      },
      {
        title: "Wrong prefix",
        contents,
        permalink: "https://example.org/other/",
      },
      {
        title: "Wrong origin",
        contents,
        permalink: "https://other.example/prefix/",
      },
      { title: "Script", contents, permalink: "javascript:alert(1)" },
    ],
  });
  assert.equal(result.container.children.length, 1);
  const card = result.container.children[0];
  assert.equal(card.children[0].children[0].textContent, title);
  assert.equal(
    card.children[0].children[0].href,
    "https://example.org/prefix/post/",
  );
  assert.equal(card.children[1].textContent, contents);
  assert.equal(card.children[2].textContent, "Categories: C&D");
  assert.equal(card.children[3].textContent, "Tags: A<B>");
});

test("index failures and missing search libraries provide visible recovery", async () => {
  for (const options of [{ ok: false }, { fuse: false }]) {
    const result = await search("s=test", options);
    assert.match(result.container.textContent, /Could not load search index/);
  }
});
