const { test, expect } = require("@playwright/test");

test.describe("Search page", () => {
  test("h1 reads 'Search results' (not 'Search')", async ({ page }) => {
    await page.goto("/search.html?q=sphinx");
    const h1 = page.locator("h1#search-documentation");
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("Search results");
  });

  test("no search form is rendered in the page body", async ({ page }) => {
    await page.goto("/search.html");
    await expect(
      page.locator("main form, #search-documentation ~ form"),
    ).toHaveCount(0);
  });

  test("search results container is present", async ({ page }) => {
    await page.goto("/search.html?q=sphinx");
    await expect(page.locator("#search-results")).toBeAttached();
  });

  test("injected 'Search Results' h2 is hidden via CSS", async ({ page }) => {
    await page.goto("/search.html?q=sphinx");
    await page.waitForTimeout(1500);
    const h2 = page.locator("#search-results > h2");
    const count = await h2.count();
    if (count > 0) {
      await expect(h2).toBeHidden();
    }
  });

  test("search page has standard header and footer", async ({ page }) => {
    await page.goto("/search.html");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });
});
