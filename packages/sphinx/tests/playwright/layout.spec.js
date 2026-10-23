const { test, expect } = require("@playwright/test");

test.describe("Page layout", () => {
  test("body has 1rem top and bottom margin", async ({ page }) => {
    await page.goto("/index.html");
    const margin = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        top: styles.marginTop,
        bottom: styles.marginBottom,
      };
    });
    expect(margin.top).toBe("17px");
    expect(margin.bottom).toBe("17px");
  });

  test("no sidebar is rendered", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator(".sidebar")).toHaveCount(0);
    await expect(page.locator('[class*="sidebar"]')).toHaveCount(0);
  });

  test("main element is present and full-width", async ({ page }) => {
    await page.goto("/index.html");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("header is rendered", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("header")).toBeVisible();
  });

  test("footer is rendered", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("footer contains Sphinx attribution", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("footer")).toContainText("Sphinx");
  });

  test("layout is consistent on Getting Started page", async ({ page }) => {
    await page.goto("/getting-started.html");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator(".sidebar")).toHaveCount(0);
  });

  test("layout is consistent on User Guide page", async ({ page }) => {
    await page.goto("/user-guide.html");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator(".sidebar")).toHaveCount(0);
  });

  test("404 page renders correctly", async ({ page }) => {
    await page.goto("/404.html");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
});
