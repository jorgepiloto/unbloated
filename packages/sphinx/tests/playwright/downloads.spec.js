const { test, expect } = require("@playwright/test");

test("example downloads resolve beside their page", async ({
  page,
  request,
}) => {
  await page.goto("/examples/monte_carlo_pi.html");
  const links = page.locator("#download-buttons a");
  await expect(links).toHaveCount(3);
  const destinations = await links.evaluateAll((elements) =>
    elements.map((element) => element.href),
  );
  expect(destinations).toEqual([
    "http://localhost:5000/examples/monte_carlo_pi.py",
    "http://localhost:5000/examples/monte_carlo_pi.ipynb",
    "http://localhost:5000/examples/monte_carlo_pi.pdf",
  ]);
  for (const url of destinations.slice(0, 2)) {
    expect((await request.get(url)).ok()).toBe(true);
  }
});

test("generated documentation includes third-party licenses", async ({
  request,
}) => {
  const font = await request.get("/_static/fonts/LICENSE.txt");
  expect(font.ok()).toBe(true);
  expect(await font.text()).toContain("SIL OPEN FONT LICENSE Version 1.1");
  const icons = await request.get("/_static/licenses/font-awesome-LICENSE.txt");
  expect(icons.ok()).toBe(true);
  expect(await icons.text()).toContain("Icons: CC BY 4.0 License");
});
