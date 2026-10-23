const BASE_URL = "http://localhost:5000";

describe("Layout", () => {
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
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: "networkidle0" });
  });

  afterEach(async () => {
    await page.close();
  });

  test("body has 1rem top margin", async () => {
    const marginTop = await page.evaluate(
      () => window.getComputedStyle(document.body).marginTop,
    );
    expect(marginTop).toBe("17px");
  });

  test("body has 1rem bottom margin", async () => {
    const marginBottom = await page.evaluate(
      () => window.getComputedStyle(document.body).marginBottom,
    );
    expect(marginBottom).toBe("17px");
  });

  test("body is horizontally centered (auto left/right margin)", async () => {
    const { marginLeft, marginRight } = await page.evaluate(() => {
      const s = window.getComputedStyle(document.body);
      return { marginLeft: s.marginLeft, marginRight: s.marginRight };
    });
    expect(parseFloat(marginLeft)).toBeGreaterThan(0);
    expect(parseFloat(marginRight)).toBeGreaterThan(0);
  });

  test("no sidebar element is present", async () => {
    const sidebar = await page.$(".sidebar");
    expect(sidebar).toBeNull();
  });

  test("main element is present", async () => {
    const main = await page.$("main");
    expect(main).not.toBeNull();
  });

  test("nav element is present", async () => {
    const nav = await page.$("body > nav");
    expect(nav).not.toBeNull();
  });

  test("footer element is present", async () => {
    const footer = await page.$("footer");
    expect(footer).not.toBeNull();
  });

  test("footer contains Sphinx attribution", async () => {
    const text = await page.$eval("footer", (el) => el.textContent);
    expect(text).toContain("Sphinx");
  });
});
