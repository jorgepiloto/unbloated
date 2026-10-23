// SPDX-License-Identifier: LGPL-3.0-only
import { expect, test } from "@playwright/test";
import { mkdtemp, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { execFile as callback } from "node:child_process";
import { promisify } from "node:util";
import { checkout } from "../consumer-fixtures.mjs";
import { buildQuarto } from "../quarto-consumer.mjs";
const execFile = promisify(callback);
let root;

test.beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "unbloated-consumers-"));
});
test.afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

async function routeFiles(page, directory, prefix) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (
      url.origin !== "https://example.org" ||
      !url.pathname.startsWith(prefix)
    )
      return route.abort();
    const relative =
      url.pathname.slice(prefix.length) +
      (url.pathname.endsWith("/") ? "index.html" : "");
    const file = join(directory, relative);
    try {
      const contentType = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      }[extname(file)];
      await route.fulfill({ body: await readFile(file), contentType });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });
}

test("Sphinx keeps wide tables, notebook siblings, focus, and escaped labels visible", async ({
  page,
}) => {
  const directory = join(root, "sphinx");
  await execFile(process.env.PYTHON || "python3", [
    join(checkout, "tests/sphinx-consumer.py"),
    directory,
  ]);
  for (const builder of ["html", "dirhtml"]) {
    await routeFiles(page, join(directory, builder), "/docs/");
    for (const width of [1000, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(
        `https://example.org/docs/${builder === "html" ? "content.html" : "content/"}`,
      );
      await page.addStyleTag({ content: "html { font-size: 200%; }" });
      await expect(page.locator("header .title")).toHaveText(
        "Tools & <Interfaces>",
      );
      for (const text of [
        "Numerical result: 42",
        "Visible output",
        "Output caption",
        "Second output",
      ]) {
        await expect(page.getByText(text, { exact: true })).toBeVisible();
      }
      expect(
        await page
          .locator("main table")
          .first()
          .evaluate((table) => table.scrollWidth <= table.clientWidth + 1),
      ).toBe(true);
      const link = page.getByRole("link", { name: "Focus target" });
      await link.focus();
      await expect(link).toHaveCSS("outline-style", "solid");
      await expect(page.locator("nav a button")).toHaveCount(0);
    }
  }
});

test("Quarto preserves column image limits and native footer lifecycle in slide, scroll, and print views", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const footer of [true, false]) {
    const directory = join(root, footer ? "quarto-footer" : "quarto-no-footer");
    await mkdir(directory);
    await buildQuarto(directory, { footer });
    await routeFiles(page, directory, "/slides/");
    await page.goto("https://example.org/slides/slides.html");
    await page.waitForFunction(() => window.Reveal?.isReady());
    expect(await page.locator("#local > .footer").count()).toBe(footer ? 1 : 0);
    expect(await page.locator(".footer-default").count()).toBe(footer ? 1 : 0);
    for (const width of [1200, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.Reveal.slide(1));
      const image = page.locator("#global .column").first().locator("img");
      expect(
        await image.evaluate(
          (image) =>
            image.getBoundingClientRect().width <=
            image.closest(".column").getBoundingClientRect().width + 1,
        ),
      ).toBe(true);
      await expect(
        page.locator("#global .column").nth(1).locator("img"),
      ).toHaveCSS("width", "120px");
      await page.evaluate(() => window.Reveal.slide(2));
      if (footer)
        await expect(
          page.locator(".reveal > .footer:not(.footer-default)"),
        ).toHaveText("Local footer");
      await page.evaluate(() => window.Reveal.slide(3));
      await expect(
        page.locator(".reveal > .footer:not(.footer-default)"),
      ).toHaveCount(0);
      if (footer)
        await expect(
          page.getByText("Global footer", { exact: true }),
        ).toBeHidden();
      await page.evaluate(() => window.Reveal.slide(4));
      if (footer)
        await expect(
          page.getByText("Global footer", { exact: true }),
        ).toBeVisible();
    }
    await page.evaluate(() => window.Reveal.configure({ view: "scroll" }));
    expect(await page.locator("#local > .footer").count()).toBe(footer ? 1 : 0);
    await page.goto("https://example.org/slides/slides.html?print-pdf");
    await page.emulateMedia({ media: "print" });
    await page.waitForFunction(() => window.Reveal?.isReady());
    if (footer) await expect(page.locator("#local > .footer")).toBeVisible();
    const suppressed = page.locator("#suppressed");
    await expect(suppressed.locator(".footer")).toHaveCount(0);
  }
});
