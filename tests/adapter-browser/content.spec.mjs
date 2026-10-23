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
  for (const full of [false, true]) {
    await execFile(process.env.PYTHON || "python3", [
      join(checkout, "tests/sphinx-consumer.py"),
      join(root, full ? "sphinx-header" : "sphinx"),
      ...(full ? ["--full-header"] : []),
    ]);
  }
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await page
          .locator("main a")
          .evaluateAll((links) =>
            links.every(
              (link) => link.getBoundingClientRect().right <= innerWidth,
            ),
          ),
      ).toBe(true);
      const guide = page.getByRole("link", { name: "guide", exact: true });
      await expect(guide).toHaveCSS("text-decoration-line", "underline");
      await guide.focus();
      await expect(guide).toHaveCSS("outline-style", "solid");
      await guide.press("Enter");
      await expect(
        page.getByRole("heading", { name: "Home", exact: true }),
      ).toBeVisible();
      await page.goBack();
      await expect(guide).toHaveCSS("text-decoration-line", "underline");
      const navigation = page.locator("body > nav").first().locator("a");
      await navigation.first().focus();
      await navigation.first().press("Tab");
      await expect(navigation.nth(1)).toBeFocused();
      await expect(navigation.nth(1)).toHaveAttribute("aria-current", "page");
      await expect(navigation.nth(1)).toHaveCSS(
        "outline-color",
        "rgb(0, 0, 0)",
      );
    }
  }
});

test("Sphinx header controls reflow with long labels, narrow widths, and enlarged text", async ({
  page,
}) => {
  for (const full of [false, true]) {
    await routeFiles(
      page,
      join(root, full ? "sphinx-header/html" : "sphinx/html"),
      "/docs/",
    );
    await page.route("**/versions.json", (route) =>
      route.fulfill({
        json: [
          { name: "Stable version with a long release label", url: "/docs/" },
        ],
      }),
    );
    for (const width of [1000, 500, 320]) {
      for (const scale of [100, 200]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("https://example.org/docs/content.html");
        await page.addStyleTag({ content: `html { font-size: ${scale}%; }` });
        const search = page.getByRole("searchbox");
        if (full)
          await expect(page.locator("#version-switcher")).toHaveValue(
            "https://example.org/docs/",
          );
        const controls = full
          ? [search, page.locator("#version-switcher")]
          : [search];
        for (const control of controls) {
          const box = await control.boundingBox();
          expect(box.width).toBeGreaterThanOrEqual(128);
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width);
          await control.focus();
          await expect(control).toHaveCSS("outline-style", "solid");
          await expect(control).toHaveCSS(
            "outline-color",
            "rgb(255, 255, 255)",
          );
        }
        if (full) {
          for (const social of await page.locator("header .social a").all()) {
            const box = await social.boundingBox();
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
          await search.focus();
          await search.press("Tab");
          await expect(page.locator("#version-switcher")).toBeFocused();
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
    }
  }
  await page.locator("header").screenshot({
    path: test.info().outputPath("sphinx-header-mobile.png"),
  });
});

test("Sphinx summary printing includes every panel and rubric without changing selection", async ({
  browser,
}) => {
  for (const disabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled: !disabled });
    try {
      const page = await context.newPage();
      await routeFiles(page, join(root, "sphinx/html"), "/docs/");
      await page.goto("https://example.org/docs/content.html");
      for (const selected of ["Functions", "Classes"]) {
        if (!disabled) await page.getByRole("tab", { name: selected }).click();
        for (let transition = 0; transition < 2; transition += 1) {
          await page.emulateMedia({ media: "print" });
          await expect(page.locator(".autoapi-tabs")).toBeHidden();
          for (const label of ["Functions", "Classes"]) {
            await expect(
              page
                .locator(".autoapi-summary .rubric")
                .filter({ hasText: label }),
            ).toBeVisible();
            await expect(
              page.getByText(
                `${label === "Functions" ? "Function" : "Class"} summary content.`,
                { exact: true },
              ),
            ).toBeVisible();
          }
          await page.pdf({
            path: test
              .info()
              .outputPath(`summary-${disabled}-${selected}-${transition}.pdf`),
          });
          await page.emulateMedia({ media: "screen" });
          if (!disabled) {
            await expect(
              page.getByRole("tab", { name: selected }),
            ).toHaveAttribute("aria-selected", "true");
            await expect(
              page.locator(".autoapi-summary-panel[hidden]"),
            ).toHaveCount(1);
            await expect(
              page.locator(".autoapi-summary-panel[hidden]"),
            ).toBeHidden();
          } else {
            await expect(page.locator(".autoapi-summary-panel")).toHaveCount(2);
            await expect(
              page.locator(".autoapi-summary-panel").nth(1),
            ).toBeVisible();
          }
        }
      }
    } finally {
      await context.close();
    }
  }
});

test("Sphinx version selection shows unmatched pages and follows validated literal-label options", async ({
  page,
}) => {
  await routeFiles(page, join(root, "sphinx-header/html"), "/docs/");
  await page.route("**/versions.json", (route) =>
    route.fulfill({
      json: [
        { name: "Wrong origin", url: "https://other.example/docs/" },
        { name: 'Version <T> & "$&"', url: "/docs/index.html?version=1#home" },
      ],
    }),
  );
  await page.goto("https://example.org/docs/content.html");
  const select = page.locator("#version-switcher");
  await expect(select).toHaveValue("");
  await expect(select.locator("option")).toHaveText([
    "Current page (unlisted)",
    'Version <T> & "$&"',
  ]);
  await expect(select.locator("option").first()).toBeDisabled();
  await select.selectOption(
    "https://example.org/docs/index.html?version=1#home",
  );
  await expect(page).toHaveURL(
    "https://example.org/docs/index.html?version=1#home",
  );
  await expect(select).toHaveValue(
    "https://example.org/docs/index.html?version=1#home",
  );
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
    await page.emulateMedia({ media: "screen" });
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto("https://example.org/slides/slides.html");
    await page.waitForFunction(() => window.Reveal?.isReady());
    await page.evaluate(() =>
      window.Reveal.configure({
        view: null,
        scrollActivationWidth: null,
        transition: "none",
      }),
    );
    expect(await page.locator("#local > .footer").count()).toBe(footer ? 1 : 0);
    await expect(page.locator(".footer-default")).toHaveText(
      footer ? "Global footer" : "",
    );
    for (const width of [1200, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.Reveal.slide(1));
      await page.waitForFunction(
        () => window.Reveal.getCurrentSlide().id === "global",
      );
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
      await page.waitForFunction(
        () => window.Reveal.getCurrentSlide().id === "local",
      );
      if (footer)
        await expect(
          page.locator(".reveal > .footer:not(.footer-default)"),
        ).toHaveText("Local footer");
      await page.evaluate(() => window.Reveal.slide(3));
      await expect(
        page.locator(".reveal > .footer:not(.footer-default)"),
      ).toHaveCount(0);
      if (footer)
        await expect(page.locator(".reveal > .footer-default")).toBeHidden();
      await page.evaluate(() => window.Reveal.slide(4));
      if (footer)
        await expect(page.locator(".reveal > .footer-default")).toBeVisible();
      await expect(page.locator(".unbloated-slide-footer:visible")).toHaveCount(
        0,
      );
    }
    await page.evaluate(() => window.Reveal.toggleScrollView(true));
    await page.waitForFunction(() => window.Reveal.isScrollView());
    expect(await page.locator("#local > .footer").count()).toBe(footer ? 1 : 0);
    if (footer) {
      await expect(page.locator("#local > .footer")).toBeVisible();
      for (const id of ["global", "default-again"]) {
        await expect(
          page.locator(`#${id} > .unbloated-slide-footer`),
        ).toBeVisible();
      }
      await expect(page.locator(".reveal > .footer")).toBeHidden();
    }
    await expect(
      page.locator("#suppressed .footer, #suppressed .unbloated-slide-footer"),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.goto("https://example.org/slides/slides.html?print-pdf");
    await page.emulateMedia({ media: "print" });
    await page.waitForFunction(() => window.Reveal?.isReady());
    await expect(page.locator(".pdf-page")).toHaveCount(5);
    if (footer) {
      await expect(page.locator("#local > .footer")).toBeHidden();
      await expect(page.locator(".unbloated-print-footer")).toHaveCount(4);
      const printed = page.locator(".pdf-page");
      for (const [index, text] of [
        [0, "Global footer"],
        [1, "Global footer"],
        [2, "Local footer"],
        [4, "Global footer"],
      ]) {
        const footer = printed
          .nth(index)
          .locator(":scope > .unbloated-print-footer");
        await expect(footer).toHaveText(text);
        await expect(footer).toBeVisible();
        expect(
          await footer.evaluate((footer) => {
            const page = footer.closest(".pdf-page").getBoundingClientRect();
            const content = footer.firstElementChild.getBoundingClientRect();
            return (
              content.top >= page.top &&
              content.bottom <= page.bottom &&
              content.left >= page.left &&
              content.right <= page.right
            );
          }),
        ).toBe(true);
      }
      await expect(
        printed.nth(3).locator(".unbloated-print-footer"),
      ).toHaveCount(0);
    }
    const suppressed = page.locator("#suppressed");
    await expect(suppressed.locator(".footer")).toHaveCount(0);
    await expect(suppressed.locator(".unbloated-slide-footer")).toHaveCount(0);
    if (footer) {
      await expect(page.locator(".reveal > .footer-default")).toBeHidden();
      await expect(page.locator("#local .unbloated-slide-footer")).toHaveCount(
        0,
      );
      await expect(
        page.locator("#global > .unbloated-slide-footer"),
      ).toBeHidden();
    } else {
      await expect(page.locator(".footer-default")).toHaveText("");
      await expect(page.locator(".unbloated-slide-footer")).toHaveCount(0);
      await expect(page.locator(".unbloated-print-footer")).toHaveCount(0);
    }
    for (const image of await page.locator("#global .column img").all()) {
      expect(
        await image.evaluate(
          (image) =>
            image.getBoundingClientRect().width <=
            image.closest(".column").getBoundingClientRect().width + 1,
        ),
      ).toBe(true);
    }
    await expect(
      page.getByText("Column caption", { exact: true }),
    ).toBeVisible();
    await page.pdf({
      path: test.info().outputPath(`slides-${footer}.pdf`),
      preferCSSPageSize: true,
    });
  }
});
