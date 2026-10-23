const { test, expect } = require("@playwright/test");

test.describe("Navigation", () => {
  test("header shows the project title", async ({ page }) => {
    await page.goto("/index.html");
    const title = page.locator("header h1.title");
    await expect(title).toBeVisible();
    await expect(title).toContainText("Sphinx Unbloated Theme");
  });

  test("header contains the search form", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("header form.header-search")).toBeVisible();
    await expect(
      page.locator("header form.header-search input[type='search']"),
    ).toBeVisible();
  });

  test("primary nav bar is rendered", async ({ page }) => {
    await page.goto("/index.html");
    const nav = page.locator("body > nav");
    await expect(nav).toBeVisible();
  });

  test("nav bar contains buttons", async ({ page }) => {
    await page.goto("/index.html");
    const buttons = page.locator("body > nav button");
    await expect(buttons).not.toHaveCount(0);
  });

  test("nav links navigate to their target pages", async ({ page }) => {
    await page.goto("/index.html");
    const links = page.locator("body > nav a[href]:not([href=''])");
    await expect(links).not.toHaveCount(0);
    const firstLink = links.first();
    const href = await firstLink.getAttribute("href");
    expect(href).toBeTruthy();
    await firstLink.click();
    await expect(page).not.toHaveURL("/index.html");
  });

  test("header search submits to the search page", async ({ page }) => {
    await page.goto("/index.html");
    await page.fill("header form.header-search input[type='search']", "sphinx");
    await page.press("header form.header-search input[type='search']", "Enter");
    await expect(page).toHaveURL(/search\.html/);
  });
});
