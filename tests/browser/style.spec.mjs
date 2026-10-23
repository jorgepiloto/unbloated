// SPDX-License-Identifier: LGPL-3.0-only
/** Verify the shared appearance, native control behavior, and preview boundaries. */
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/index.html");
});

test("reference page uses grayscale, monospace type, and square corners", async ({
  page,
}) => {
  await expect(page.locator("body")).toHaveCSS("color", "rgb(0, 0, 0)");
  const violations = await page
    .locator("body, body *")
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const style = getComputedStyle(element);
        const errors = [];
        if (!style.fontFamily.endsWith("monospace"))
          errors.push(`${element.tagName}: font`);
        for (const property of [
          "borderTopLeftRadius",
          "borderTopRightRadius",
          "borderBottomLeftRadius",
          "borderBottomRightRadius",
        ]) {
          if (style[property] !== "0px")
            errors.push(`${element.tagName}: ${property}`);
        }
        for (const property of ["color", "backgroundColor", "borderTopColor"]) {
          const match = style[property].match(/^rgba?\((\d+), (\d+), (\d+)/);
          if (match && (match[1] !== match[2] || match[2] !== match[3]))
            errors.push(`${element.tagName}: ${property}`);
        }
        return errors;
      }),
    );
  expect(violations).toEqual([]);
  await expect(page.locator(".unbloat-panel")).toHaveCSS(
    "box-shadow",
    "rgb(187, 187, 187) 2px 2px 0px 0px",
  );
});

test("keyboard focus remains visible", async ({ page, isMobile }) => {
  test.skip(
    isMobile,
    "Mobile browser emulation does not model desktop keyboard navigation.",
  );
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await expect(page.locator(".skip-link")).toHaveCSS("outline-width", "2px");
  await page.keyboard.press("Enter");
  await page.locator("#name").focus();
  await expect(page.locator("#name")).toHaveCSS("outline-style", "solid");
  await expect(page.locator("#name")).toHaveCSS("outline-width", "2px");
});

test("button hover inverts colors and disabled controls remain disabled", async ({
  page,
  isMobile,
}) => {
  await expect(
    page.getByRole("button", { name: "Disabled Button" }),
  ).toBeDisabled();
  test.skip(isMobile, "Touch interfaces do not have a persistent hover state.");
  const button = page.getByRole("button", {
    name: "Default Button",
    exact: true,
  });
  await button.hover();
  await expect(button).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(button).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("reference page fits a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("reference.png"),
    fullPage: true,
  });
});

test("consumer overrides work and base CSS imposes no page width", async ({
  page,
}) => {
  await page
    .locator('link[href="example.css"]')
    .evaluate((element) => element.remove());
  await expect(page.locator("body")).toHaveCSS("max-width", "none");
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--unbloat-font-family",
      '"Consumer Mono", monospace',
    ),
  );
  const buttonFontFamily = await page
    .locator("button")
    .first()
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(buttonFontFamily.replace(/"/g, "")).toBe("Consumer Mono, monospace");
});

test("preview server denies access outside its public routes", async ({
  request,
}) => {
  for (const path of [
    "/package.json",
    "/src/tokens.json",
    "/.git/config",
    "/%2e%2e/package.json",
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  const response = await request.get("/dist/unbloat.css");
  expect(response.headers()["content-type"]).toContain("text/css");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

test("root preview loads its layout stylesheet", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("max-width", "800px");
});

test("square selection controls preserve native keyboard behavior", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Desktop keyboard behavior is tested in desktop browsers.",
  );
  const checkbox = page.getByRole("checkbox", { name: "Show preview" });
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await page.keyboard.press("Space");
  await expect(checkbox).not.toBeChecked();
});

test("mixed checkboxes remain distinct and use native forced-color rendering", async ({
  page,
}) => {
  await page.locator("main").evaluate((main) => {
    const group = document.createElement("div");
    group.innerHTML =
      '<label>Unchecked <input id="unchecked-test" type="checkbox"></label><label>Mixed <input id="mixed-test" type="checkbox"></label><label>Checked <input id="checked-test" type="checkbox" checked></label>';
    main.append(group);
    group.querySelector("#mixed-test").indeterminate = true;
  });
  const mixed = page.locator("#mixed-test");
  await expect(mixed).toHaveCSS("background-image", /linear-gradient/);
  await expect(page.locator("#unchecked-test")).toHaveCSS(
    "background-image",
    "none",
  );
  await expect(page.locator("#checked-test")).toHaveCSS(
    "background-image",
    "none",
  );
  await mixed.focus();
  await mixed.press("Space");
  expect(await mixed.evaluate((input) => input.indeterminate)).toBe(false);
  await page.emulateMedia({ forcedColors: "active" });
  await mixed.evaluate((input) => {
    input.indeterminate = true;
  });
  await expect(mixed).toHaveCSS("appearance", "auto");
});
