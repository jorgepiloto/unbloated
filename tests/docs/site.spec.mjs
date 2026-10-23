// SPDX-License-Identifier: LGPL-3.0-only
/** Verify navigation, actual component styles, tab interaction, and mobile layout. */
import { expect, test } from "@playwright/test";
import { readFile, readdir } from "node:fs/promises";
import { docsArtifact } from "../../scripts/docs-artifact.mjs";
import { root } from "../../scripts/build.mjs";

const { directory, prefix } = await docsArtifact();
const localURL = `http://127.0.0.1:4174${prefix}`;

test("Hugo pages keep descriptions, heading IDs, and local links valid", async ({
  page,
  request,
}) => {
  const { description, version } = JSON.parse(
    await readFile(new URL("package.json", root)),
  );
  const files = await readdir(directory, { recursive: true });
  const paths = files
    .filter((path) => path.endsWith("index.html"))
    .map(
      (path) => path.replaceAll("\\", "/").replace(/index\.html$/, "") || "./",
    );
  const destinations = new Set();
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      description,
    );
    await expect(page.locator(".site-description")).toHaveText(description);
    await expect(page.locator("footer")).toContainText(version);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute(
      "id",
      /\S+/,
    );
    await expect(
      page.locator("h1 a, h2 a, h3 a, h4 a, h5 a, h6 a"),
    ).toHaveCount(0);
    const levels = await page
      .locator("main h1, main h2, main h3, main h4, main h5, main h6")
      .evaluateAll((headings) =>
        headings.map((heading) => Number(heading.tagName.slice(1))),
      );
    expect(levels[0], `Missing page title at ${path}`).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(
        levels[index],
        `Skipped heading level at ${path}: H${levels[index - 1]} to H${levels[index]}`,
      ).toBeLessThanOrEqual(levels[index - 1] + 1);
    }
    const links = await page
      .locator("a[href]")
      .evaluateAll((anchors) =>
        anchors
          .map((anchor) => anchor.href)
          .filter((href) => new URL(href).origin === location.origin),
      );
    for (const href of links) destinations.add(href);
  }
  for (const href of destinations) {
    const response = await request.get(href);
    expect(response.ok(), `Broken documentation link: ${href}`).toBe(true);
    const fragment = decodeURIComponent(new URL(href).hash.slice(1));
    if (fragment) {
      await page.goto(href);
      expect(
        await page.evaluate(
          (id) => Boolean(document.getElementById(id)),
          fragment,
        ),
        `Missing heading or example anchor: ${href}`,
      ).toBe(true);
    }
  }
  await page.goto("./");
  const library = page.locator('link[rel="stylesheet"][href*="/unbloat."]');
  const response = await request.get(await library.getAttribute("href"));
  expect(await response.text()).toBe(
    await readFile(new URL("dist/unbloat.css", root), "utf8"),
  );
});

test("heading levels use the library scale and keep code legible", async ({
  page,
}) => {
  const { heading: sizes } = JSON.parse(
    await readFile(new URL("src/tokens.json", root)),
  );
  await page.goto("components/typography/");
  let previousSize = Infinity;
  for (let level = 1; level <= 6; level += 1) {
    const heading =
      level === 1
        ? page.getByRole("heading", { level })
        : page.locator(`.component-demo h${level}`);
    await expect(heading).toHaveCount(1);
    const size = await heading.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    );
    expect(size).toBeCloseTo(Number.parseFloat(sizes[`size-${level}`]) * 16);
    expect(size).toBeLessThan(previousSize);
    previousSize = size;
  }
  const pageTitle = page.getByRole("heading", { level: 1 });
  const parentLabel = page.locator(".nav-breadcrumb-title");
  expect(
    await parentLabel.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
  ).toBeLessThan(
    await pageTitle.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).fontSize),
    ),
  );
  await page.goto("reference/source/");
  for (const heading of await page.locator(".page-content > h3").all()) {
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(heading).toHaveCSS("background-color", "rgb(0, 0, 0)");
    const code = heading.locator("code");
    await expect(code).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(code).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(code).toHaveCSS(
      "font-size",
      await heading.evaluate((element) => getComputedStyle(element).fontSize),
    );
  }
});

test("documentation sections and getting-started pages are reachable", async ({
  page,
}) => {
  await page.goto("./");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link")).toHaveText([
    "Home",
    "Getting Started",
    "Components",
  ]);
  await page.screenshot({
    path: test.info().outputPath("documentation-desktop.png"),
    fullPage: true,
  });
  await navigation.getByRole("link", { name: "Getting Started" }).click();
  await expect(
    page.getByRole("heading", { name: /^Getting Started\b/, level: 1 }),
  ).toBeVisible();
  const sections = page.getByRole("navigation", {
    name: "Sections",
    exact: true,
  });
  await sections.getByRole("link", { name: "About", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "About", level: 1 }),
  ).toBeVisible();
  await sections
    .getByRole("link", { name: "Prerequisites", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /^Prerequisites\b/, level: 1 }),
  ).toBeVisible();
  await sections
    .getByRole("link", { name: "Installation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /^Installation\b/, level: 1 }),
  ).toBeVisible();
});

test("social icons retain accessible names, destinations, and local assets", async ({
  page,
  request,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("./");
  const navigation = page.getByRole("navigation", { name: "Social links" });
  const social = JSON.parse(
    await readFile(new URL("docs/data/social.json", root)),
  );
  await expect(navigation.getByRole("link")).toHaveCount(5);
  for (const { name, url } of social) {
    const link = navigation.getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", url);
    await expect(link.locator("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(link.locator("svg")).toHaveAttribute("focusable", "false");
    if (!url.startsWith("mailto:")) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  }
  await navigation.getByRole("link", { name: "GitHub", exact: true }).focus();
  await expect(
    navigation.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveCSS("outline-width", "2px");
  expect(
    requests.every((url) => new URL(url).origin === "http://127.0.0.1:4174"),
  ).toBe(true);
  const license = await request.get("licenses/font-awesome-LICENSE.txt");
  expect(license.ok()).toBe(true);
  expect(await license.text()).toContain("CC BY 4.0");
});

test("section buttons and parent links work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${localURL}components/`);
    const sections = page.getByRole("navigation", {
      name: "Sections",
      exact: true,
    });
    const heading = page.getByRole("heading", { name: "Components", level: 1 });
    expect((await sections.boundingBox()).y).toBeGreaterThan(
      (await heading.boundingBox()).y,
    );
    const panels = sections.getByRole("link", {
      name: "Panels and Callouts",
      exact: true,
    });
    await panels.focus();
    await panels.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Panels and Callouts", level: 1 }),
    ).toBeVisible();
    await expect(panels).toHaveAttribute("aria-current", "page");
    await expect(panels).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(
      page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Components", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    const parent = page.locator(".nav-breadcrumb-title a");
    await expect(parent).toHaveText("Components");
    await expect(parent).toHaveAttribute("href", `${prefix}components/`);
    expect((await sections.boundingBox()).y).toBeLessThan(
      (
        await page
          .getByRole("heading", { name: "Panels and Callouts", level: 1 })
          .boundingBox()
      ).y,
    );
    await page.screenshot({
      path: test.info().outputPath("documentation-navigation.png"),
      fullPage: true,
    });
    const back = page
      .getByRole("navigation", { name: "Page navigation", exact: true })
      .getByRole("link");
    await expect(back).toHaveText("Back to Components");
    await back.focus();
    await back.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Components", level: 1 }),
    ).toBeVisible();
    await expect(back).toHaveText("Back to Home");
    await back.click();
    await expect(
      page.getByRole("heading", { name: "Home", level: 1 }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test("reference pages use Getting Started as their navigation parent", async ({
  page,
}) => {
  await page.goto("reference/source/");
  await expect(page.locator(".nav-breadcrumb-title a")).toHaveText(
    "Getting Started",
  );
  await expect(
    page
      .getByRole("navigation", { name: "Sections", exact: true })
      .getByRole("link", { name: "Source Reference", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("link", { name: "Back to Getting Started", exact: true })
    .click();
  await expect(page).toHaveURL(/\/getting-started\/$/);
  await expect(
    page.getByRole("heading", { name: "Getting Started", level: 1 }),
  ).toBeVisible();
});

test("component previews use the built library and retain native states", async ({
  page,
}) => {
  await page.goto("components/panels/");
  const panel = page.locator(".component-demo .unbloat-panel").first();
  await expect(panel).toHaveCSS(
    "box-shadow",
    "rgb(187, 187, 187) 2px 2px 0px 0px",
  );
  await expect(panel).toHaveCSS("border-radius", "0px");
  await expect(page.locator(".component-demo .unbloat-callout")).toHaveCSS(
    "border-inline-start-width",
    "3px",
  );
  await expect(page.locator(".component-demo .unbloat-inverse")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  await page.goto("components/buttons/");
  const button = page.getByRole("button", { name: "Preview", exact: true });
  await button.hover();
  await expect(button).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(
    page.getByRole("button", { name: "Unavailable" }),
  ).toBeDisabled();
});

test("tabs support selection, roving focus, and keyboard wrapping", async ({
  page,
}) => {
  await page.goto("components/tabs/");
  const complete = page.getByRole("tab", { name: "Complete" });
  const tokens = page.getByRole("tab", { name: "Tokens" });
  await tokens.click();
  await expect(tokens).toHaveAttribute("aria-selected", "true");
  await expect(tokens).toHaveAttribute("tabindex", "0");
  await expect(complete).toHaveAttribute("tabindex", "-1");
  await expect(page.getByRole("tabpanel", { name: "Tokens" })).toBeVisible();
  await expect(page.locator("#panel-complete")).toBeHidden();
  await tokens.press("ArrowRight");
  await expect(complete).toBeFocused();
  await expect(complete).toHaveAttribute("aria-selected", "true");
  await complete.press("End");
  await expect(tokens).toBeFocused();
  await tokens.press("Home");
  await expect(complete).toBeFocused();
  await complete.press("ArrowLeft");
  await expect(tokens).toBeFocused();
});

test("components fit a narrow viewport and keep the skip link visible on focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("components/controls/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCSS(
    "outline-width",
    "2px",
  );
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("documentation-mobile.png"),
    fullPage: true,
  });
  for (const path of [
    "getting-started/installation/",
    "reference/tokens/",
    "reference/source/",
    "components/typography/",
    "components/content/",
  ]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Page overflow at ${path}`,
    ).toBe(true);
  }
});

test("both tab panels remain readable when enhancement is unavailable", async ({
  browser,
}) => {
  for (const disabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled: !disabled });
    try {
      const page = await context.newPage();
      if (!disabled) await page.route("**/tabs.*.js", (route) => route.abort());
      await page.goto(`${localURL}components/tabs/`);
      await expect(page.locator("#panel-complete")).toBeVisible();
      await expect(page.locator("#panel-tokens")).toBeVisible();
    } finally {
      await context.close();
    }
  }
});
