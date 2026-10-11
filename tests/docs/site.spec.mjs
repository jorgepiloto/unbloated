// SPDX-License-Identifier: LGPL-3.0-only
/** Verify navigation, actual component styles, tab interaction, and mobile layout. */
import { expect, test } from "@playwright/test";

test("documentation sections and getting-started pages are reachable", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation.getByRole("link")).toHaveText([
    "Home",
    "Getting Started",
    "Components",
  ]);
  await navigation.getByRole("link", { name: "Getting Started" }).click();
  await expect(
    page.getByRole("heading", { name: /^About\b/, level: 1 }),
  ).toBeVisible();
  const sections = page.getByRole("navigation", {
    name: "Sections",
    exact: true,
  });
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

test("component previews use the built library and retain native states", async ({
  page,
}) => {
  await page.goto("/components/panels/");
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
  await page.goto("/components/buttons/");
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
  await page.goto("/components/tabs/");
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
  await page.goto("/components/controls/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await expect(page.getByRole("link", { name: "Skip to content" })).toHaveCSS(
    "outline-width",
    "2px",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("documentation-mobile.png"),
    fullPage: true,
  });
});
