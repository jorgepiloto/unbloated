# Unbloated Hugo Theme

This adapter extracts the presentation layer of Jorge's website. Its stylesheet
uses the Unbloated core's design variables; the Hugo templates supply the
existing navigation, post layouts, search, and shortcodes.

## Build

From the Unbloated repository root:

```sh
npm ci --ignore-scripts
npm run build:adapters
npm run check:adapters
```

The build places the unchanged core CSS and its provenance under `assets/css`.
The `unbloated-styles.html` partial combines the core and adapter CSS, then
fingerprints the result. Missing core CSS is a build error.

## Use With the Website

Keep the `theme` and `web` checkouts next to each other. The website configuration
selects `theme: hugo` and `themesDir: ../theme/packages`. Build the adapter
before running Hugo in `web`.

The website retains its content, configuration, analytics and SEO partials,
application CSS, and section-specific layout overrides. Shared layouts and
the main stylesheet belong here. Hugo uses the website's PostCSS configuration
and its npm-installed PostCSS dependencies. Use Hugo Extended 0.144.1 or newer,
and retain the website's pinned version in deployment.

For a different checkout location, set `HUGO_THEMESDIR` to the directory
containing the `hugo` theme. CI checks out this monorepo into `theme-source`,
builds its assets, and sets `HUGO_THEMESDIR=theme-source/packages`.

## Distribution

`npm run pack:adapters` from the repository root writes a Hugo npm tarball into
`.artifacts/`. The archive contains layouts, assets, static scripts, the theme
manifest, and license notices. It is not published automatically.

Extract the archive's `package/` directory into a site's `themes/hugo/` to use
it as a traditional Hugo theme. A packaged theme includes the core CSS already;
the consuming site still needs its Hugo and PostCSS build tools.

## Content and Navigation Contracts

Primary menus use native links and Hugo `pageRef` relationships for current-page
and ancestor state. Inline prose links stay underlined. Wide table cells and long
identifiers wrap inside the content width. Plant cards emit semantic definition
lists during generation, with no script dependency.

`private: true` and `noindex: true` exclude pages from search, RSS feeds, sitemap
entries, and theme collections. Taxonomy landing pages are also excluded from the
sitemap and marked noindex. These flags do not restrict access: the page HTML is
still public. Keep genuinely nonpublic sources out of the public build.

Search requires a home JSON output (`outputs.home: [HTML, RSS, JSON]`) and a page
with `layout: search`. It fetches this site's generated index URL, including its
base path. `URLSearchParams` uses the first `s` value, decodes plus signs and
encoded separators, and tolerates malformed escapes. Empty input prompts for a
query. Failed index requests or unavailable Fuse.js produce a visible recovery
message. Result labels are literal text; destinations must share the index's
origin and deployment path. Mark.js is optional for highlighting.

Plotly shortcodes accept `json` and optional CSS `height`, generate distinct IDs
for repeated datasets, and report load failures in their own container. The page
must supply Plotly (the existing `plotly` page parameter enables its script).

Hugo Extended 0.144.1 remains the minimum. The theme selects legacy locale APIs
below 0.158.0 and `Language.Locale`/`Direction` in newer versions. Use `languageCode`
in older consumer configuration and `locale` from 0.158.0 onward. Set the active
language's direction for RTL sites. The consumer must allow the `VERSION`
environment variable under `security.funcs.getenv` if using the theme footer.
PostCSS, native CSS nesting, and modern container sizing remain build/browser
requirements of the adapter.
