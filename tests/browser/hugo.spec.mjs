// SPDX-License-Identifier: LGPL-3.0-only
/** Exercise a real Hugo consumer with bundled CSS and offline script fixtures. */
import { expect, test } from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { buildHugo } from "../consumer-fixtures.mjs";

let directory;
let output;
test.beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), "unbloated-hugo-browser-"));
  ({ output } = await buildHugo(directory));
});
test.afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});

async function routeSite(page) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "cdnjs.cloudflare.com") {
      const body = url.pathname.includes("fuse")
        ? "window.Fuse = class { constructor(data) { this.data = data; } search(query) { window.searchedQuery = query; return this.data.map(item => ({item, matches: []})); } };"
        : "window.Mark = class { mark() {} };";
      await route.fulfill({ contentType: "text/javascript", body });
      return;
    }
    if (
      url.origin !== "https://example.org" ||
      !url.pathname.startsWith("/prefix/")
    ) {
      await route.abort();
      return;
    }
    const relative = url.pathname.slice("/prefix/".length);
    const file = join(
      output,
      relative + (url.pathname.endsWith("/") ? "index.html" : ""),
    );
    try {
      const contentType =
        {
          ".html": "text/html",
          ".css": "text/css",
          ".js": "text/javascript",
          ".json": "application/json",
        }[extname(file)] || "text/plain";
      await route.fulfill({ contentType, body: await readFile(file) });
    } catch {
      await route.fulfill({ status: 404, body: "Not found" });
    }
  });
}

test("prefixed navigation and repeated plant cards work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await routeSite(page);
    await page.goto("https://example.org/prefix/posts/current/");
    await expect(page.locator(".plant-fields dd")).toHaveCount(16);
    await expect(page.locator(".plant-fields dd").first()).toHaveText(
      "Perennial",
    );
    expect(
      await page.locator("[id]").evaluateAll((elements) => {
        const ids = elements.map((element) => element.id);
        return new Set(ids).size === ids.length;
      }),
    ).toBe(true);
    const about = page
      .locator("body > nav")
      .getByRole("link", { name: "À propos" });
    await about.focus();
    await about.press("Enter");
    await expect(page).toHaveURL("https://example.org/prefix/about/");
    await expect(about).toHaveAttribute("aria-current", "page");
    await expect(page.locator("body > nav button")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("wide tables and prose links stay reachable at narrow and enlarged sizes", async ({
  page,
}) => {
  await routeSite(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("https://example.org/prefix/posts/current/");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  const cell = page.locator("table tbody td").first();
  await expect(cell).toBeVisible();
  expect(
    await cell.evaluate((cell) => cell.scrollWidth <= cell.clientWidth + 1),
  ).toBe(true);
  const link = page.getByRole("link", { name: "Prose link" });
  await expect(link).toHaveCSS("text-decoration-line", "underline");
  await link.focus();
  await expect(link).toHaveCSS("outline-style", "solid");
});

test("search parses URL parameters, preserves literal text, and uses the prefixed index", async ({
  page,
}) => {
  await routeSite(page);
  const title = 'Vector<T> & Buffer "$&" ユニコード';
  const contents = 'Literal <Tag> & "$&" content';
  const requests = [];
  await page.route("**/index.json", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({
      json: [
        {
          title,
          contents,
          permalink: "https://example.org/prefix/posts/current/",
        },
      ],
    });
  });
  for (const [query, expected] of [
    ["s=%", "%"],
    ["s=one%26two", "one&two"],
    ["s=one+two", "one two"],
    ["s=first&s=second", "first"],
    ["s=%2B", "+"],
  ]) {
    await page.goto(`https://example.org/prefix/search/?${query}`);
    await expect(page.locator("#search-results h3 a")).toHaveText(title);
    await expect(page.locator(".search-snippet")).toHaveText(contents);
    expect(await page.evaluate(() => window.searchedQuery)).toBe(expected);
    await expect(
      page.locator("#search-results t, #search-results tag"),
    ).toHaveCount(0);
  }
  expect(
    requests.every((url) => url === "https://example.org/prefix/index.json"),
  ).toBe(true);
  await page.goto("https://example.org/prefix/search/?s=&s=ignored");
  await expect(page.locator("#search-results")).toContainText("Please enter");
});

test("search reports failures and excludes destinations outside its site", async ({
  page,
}) => {
  await routeSite(page);
  await page.route("**/index.json", (route) => route.fulfill({ status: 500 }));
  await page.goto("https://example.org/prefix/search/?s=test");
  await expect(page.locator("#search-results")).toContainText(
    "Could not load search index",
  );
  await page.route("**/index.json", (route) =>
    route.fulfill({
      json: [
        {
          title: "Other site",
          contents: "test",
          permalink: "https://example.org/other/",
        },
        { title: "Script", contents: "test", permalink: "javascript:alert(1)" },
      ],
    }),
  );
  await page.reload();
  await expect(page.locator("#search-results")).toHaveText("No matches found");
});

test("repeated Plotly URLs render in separate containers and retain ampersands", async ({
  page,
}) => {
  await routeSite(page);
  await page.addInitScript(() => {
    window.plotCalls = [];
    window.Plotly = {
      newPlot: async (container) => {
        window.plotCalls.push(container.id);
        container.textContent = "Rendered plot";
      },
    };
  });
  const requests = [];
  await page.route("**/plot.json?*", (route) => {
    requests.push(route.request().url());
    return route.fulfill({ json: { data: [], layout: {} } });
  });
  await page.goto("https://example.org/prefix/posts/current/");
  await expect(page.locator(".plotly")).toHaveText([
    "Rendered plot",
    "Rendered plot",
  ]);
  expect(await page.evaluate(() => new Set(window.plotCalls).size)).toBe(2);
  expect(requests).toEqual([
    "https://example.org/prefix/plot.json?a=1&b=2",
    "https://example.org/prefix/plot.json?a=1&b=2",
  ]);
});
