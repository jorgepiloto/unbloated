const BASE_URL = "http://localhost:5000";

describe("Search page", () => {
  let browser;
  let page;

  beforeAll(async () => {
    const { default: puppeteer } = await import("puppeteer");
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(`${BASE_URL}/search.html?q=sphinx`, {
      waitUntil: "networkidle0",
    });
    await new Promise((r) => setTimeout(r, 1500));
  });

  afterEach(async () => {
    await page.close();
  });

  test("h1 reads 'Search results'", async () => {
    const text = await page.$eval("h1#search-documentation", (el) =>
      el.textContent.trim(),
    );
    expect(text).toBe("Search results");
  });

  test("no search form is present in the body content", async () => {
    const form = await page.$("main form, #search-documentation ~ form");
    expect(form).toBeNull();
  });

  test("search results container exists", async () => {
    const el = await page.$("#search-results");
    expect(el).not.toBeNull();
  });

  test("injected 'Search Results' h2 is hidden", async () => {
    const h2 = await page.$("#search-results > h2");
    if (h2) {
      const display = await page.evaluate(
        (el) => window.getComputedStyle(el).display,
        h2,
      );
      expect(display).toBe("none");
    }
  });

  test("search results list is populated", async () => {
    const items = await page.$$("ul.search li");
    expect(items.length).toBeGreaterThan(0);
  });
});
