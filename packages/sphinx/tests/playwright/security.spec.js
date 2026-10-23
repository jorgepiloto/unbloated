const { test, expect } = require("@playwright/test");

async function serveVersions(page, body, status = 200) {
  await page.route("**/versions.json", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
}

test("version feed rejects executable and external destinations", async ({
  page,
}) => {
  const origin = "http://localhost:5000";
  await serveVersions(page, [
    { name: "Home", url: origin + "/index.html" },
    { name: "Guide", url: "/user-guide.html" },
    { name: "Script", url: "javascript:void(window.reviewXss=true)" },
    { name: "Data", url: "data:text/html,<script>alert(1)</script>" },
    { name: "External", url: "https://example.com/" },
    { name: "Protocol-relative", url: "//example.com/" },
    { name: "Credentials", url: "http://user:password@localhost:5000/" },
    null,
    { name: 42, url: origin },
    { name: "Missing URL" },
  ]);
  await page.goto("/index.html");
  const select = page.locator("#version-switcher");
  await expect(select.locator("option")).toHaveText(["Home", "Guide"]);
  await expect(select).toHaveValue(origin + "/index.html");
  await select.selectOption({ label: "Guide" });
  await expect(page).toHaveURL(origin + "/user-guide.html");
  expect(await page.evaluate(() => window.reviewXss)).toBeUndefined();
});

test("version labels remain text", async ({ page }) => {
  const label = '<img src=x onerror="window.reviewXss=true">';
  await serveVersions(page, [{ name: label, url: "/index.html" }]);
  await page.goto("/index.html");
  await expect(page.locator("#version-switcher option")).toHaveText(label);
  await expect(page.locator("#version-switcher img")).toHaveCount(0);
});

for (const [name, body, status] of [
  ["invalid shape", {}, 200],
  [
    "no safe destinations",
    [{ name: "Script", url: "javascript:alert(1)" }],
    200,
  ],
  ["HTTP error", [], 503],
]) {
  test(`version selector hides on ${name}`, async ({ page }) => {
    await serveVersions(page, body, status);
    await page.goto("/index.html");
    await expect(page.locator(".version-switcher")).toBeHidden();
  });
}

test("header controls show keyboard focus", async ({ page }) => {
  await serveVersions(page, [{ name: "Home", url: "/index.html" }]);
  await page.goto("/index.html");
  await expect(page.locator("#version-switcher option")).toHaveText("Home");
  for (const selector of ["#header-search-input", "#version-switcher"]) {
    await page.keyboard.press("Tab");
    await page.locator(selector).focus();
    const outline = await page.locator(selector).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: style.outlineWidth,
        color: style.outlineColor,
      };
    });
    expect(outline).toEqual({
      style: "solid",
      width: "2px",
      color: "rgb(255, 255, 255)",
    });
  }
});
