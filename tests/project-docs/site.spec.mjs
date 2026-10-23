// SPDX-License-Identifier: LGPL-3.0-only
import { expect, test } from "@playwright/test";
import { readFile, readdir, stat } from "node:fs/promises";
import { docsArtifact } from "../../scripts/docs-artifact.mjs";
import { root } from "../../scripts/build.mjs";
import { projectDocumentation } from "../../scripts/project-docs.mjs";
const artifact = await docsArtifact();
const metadata = JSON.parse(
  await readFile(new URL("documentation.json", artifact.directory)),
);
const expected = projectDocumentation(
  process.env.DOCS_PROJECT || metadata.project,
  metadata.channel,
);

test.beforeEach(async ({ page }) => {
  await page.route("https://**", (route) => route.abort());
});

test("project identity, deployment prefix, local links, downloads, and exact core CSS are valid", async ({
  page,
  request,
}) => {
  expect(metadata.project).toBe(expected.project);
  expect(metadata.baseURL).toBe(expected.baseURL);
  expect(artifact.prefix).toBe(new URL(expected.baseURL).pathname);
  const before = new Map();
  const files = await readdir(artifact.directory, { recursive: true });
  for (const name of files) {
    try {
      before.set(name, await readFile(new URL(name, artifact.directory)));
    } catch (error) {
      if (error.code !== "EISDIR") throw error;
    }
  }
  const links = new Set();
  for (const name of files.filter(
    (name) => name.endsWith(".html") && name !== "404.html",
  )) {
    await page.goto(name);
    await expect(page.locator("main")).toBeVisible();
    const anchors = await page
      .locator("a[href]")
      .evaluateAll((elements) =>
        elements
          .map((a) => a.href)
          .filter((href) => new URL(href).origin === location.origin),
      );
    for (const href of anchors) links.add(href);
    const sourcePrefix = `https://github.com/jorgepiloto/unbloated/blob/${process.env.DOCS_SOURCE_REF || "main"}/`;
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((elements) => elements.map((a) => a.href))) {
      if (href.startsWith(sourcePrefix))
        await stat(
          new URL(
            decodeURIComponent(
              new URL(href).pathname.slice(
                new URL(sourcePrefix).pathname.length,
              ),
            ),
            root,
          ),
        );
    }
    for (const src of await page
      .locator('link[rel="stylesheet"], img[src]')
      .evaluateAll((elements) =>
        elements
          .map((e) => e.href || e.src)
          .filter((href) => new URL(href).origin === location.origin),
      )) {
      expect(new URL(src).pathname.startsWith(artifact.prefix), src).toBe(true);
      expect((await request.get(src)).ok(), src).toBe(true);
    }
  }
  for (const href of links) {
    expect(new URL(href).pathname.startsWith(artifact.prefix), href).toBe(true);
    expect((await request.get(href)).ok(), href).toBe(true);
  }
  await page.goto("./");
  const core = page.locator('link[rel="stylesheet"][href*="/unbloat."]');
  const coreURL = new URL(await core.getAttribute("href"), page.url());
  expect(await (await request.get(coreURL.href)).body()).toEqual(
    await readFile(new URL("dist/unbloat.css", root)),
  );
  for (const name of ["LICENSE", "COPYING", "NOTICE"])
    expect(
      await (
        await request.get(new URL(`licenses/unbloated/${name}`, coreURL).href)
      ).body(),
    ).toEqual(await readFile(new URL(name, root)));
  if (expected.configuration.builder !== "sphinx")
    await expect(page.locator("footer")).toContainText(metadata.version);
  for (const [name, bytes] of before)
    expect(await readFile(new URL(name, artifact.directory))).toEqual(bytes);
  expect(
    (await readdir(artifact.directory, { recursive: true })).sort(),
  ).toEqual(files.sort());
});

test("project homepage keeps readable content and keyboard navigation on narrow screens", async ({
  page,
}) => {
  await page.goto("./");
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addStyleTag({ content: "html {font-size: 200%;}" });
  await expect(page.locator("main h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const link = page
    .locator('nav[aria-label="Main navigation"] a, body > nav > a')
    .first();
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS("outline-style", "solid");
  await expect(link).toHaveCSS("outline-color", "rgb(0, 0, 0)");
  await link.press("Enter");
  await expect(page.locator("main")).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath(`${metadata.project}-mobile.png`),
  });
});
