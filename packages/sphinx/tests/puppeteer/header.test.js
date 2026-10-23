const BASE_URL = "http://localhost:5000";

describe("Header", () => {
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
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: "networkidle0" });
  });

  afterEach(async () => {
    await page.close();
  });

  test("header element exists", async () => {
    const header = await page.$("header");
    expect(header).not.toBeNull();
  });

  test("project title is rendered in header", async () => {
    const text = await page.$eval("header h1.title", (el) =>
      el.textContent.trim(),
    );
    expect(text).toBe("Sphinx Unbloated Theme");
  });

  test("header contains the search form", async () => {
    const form = await page.$("header form.header-search");
    expect(form).not.toBeNull();
  });

  test("header search input has correct attributes", async () => {
    const input = await page.$(
      "header form.header-search input[type='search']",
    );
    expect(input).not.toBeNull();
    const name = await page.$eval(
      "header form.header-search input[type='search']",
      (el) => el.name,
    );
    expect(name).toBe("q");
  });

  test("header search form action points to search page", async () => {
    const action = await page.$eval("header form.header-search", (el) =>
      el.getAttribute("action"),
    );
    expect(action).toContain("search");
  });
});
