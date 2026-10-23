module.exports = {
  id: "sphinx-unbloated-theme",

  viewports: [
    { label: "desktop", width: 1280, height: 900 },
    { label: "tablet", width: 768, height: 1024 },
    { label: "mobile", width: 375, height: 812 },
  ],

  scenarios: [
    {
      label: "Home",
      url: "http://localhost:5000/index.html",
      delay: 300,
    },
    {
      label: "Getting Started",
      url: "http://localhost:5000/getting-started.html",
      delay: 300,
    },
    {
      label: "User Guide",
      url: "http://localhost:5000/user-guide.html",
      delay: 300,
    },
    {
      label: "Search",
      url: "http://localhost:5000/search.html?q=sphinx",
      delay: 1500,
    },
    {
      label: "404",
      url: "http://localhost:5000/404.html",
      delay: 300,
    },
  ],

  paths: {
    bitmaps_reference: "tests/backstop/bitmaps_reference",
    bitmaps_test: "tests/backstop/bitmaps_test",
    html_report: "tests/backstop/html_report",
    ci_report: "tests/backstop/ci_report",
  },

  report: ["browser"],
  engine: "playwright",
  engineOptions: {
    browser: "chromium",
    args: ["--no-sandbox"],
  },
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false,
};
