# Unbloated Hugo Theme

Documentation destinations: [stable](https://jorgemartinez.space/projects/unbloated-hugo-theme/version/stable/)
and [development](https://jorgemartinez.space/projects/unbloated-hugo-theme/version/dev/).

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

### License Files

The adapter uses `LGPL-3.0-only`. In this checkout, the canonical license,
incorporated GPL terms, and copyright notice are the root `LICENSE`, `COPYING`,
and `NOTICE`. Adapter staging includes their exact bytes under
`assets/css/licenses/unbloated/`, which is shipped in the npm tarball. Separate
top-level copies in this package are unnecessary. Keep the bundled license
directory when redistributing the theme.

## Content and Navigation Contracts

Primary menus use native links and Hugo `pageRef` relationships for current-page
and ancestor state. Inline prose links stay underlined. Wide table cells and long
identifiers wrap inside the content width. Plant cards emit semantic definition
lists during generation, with no script dependency.

`private: true` and `noindex: true` exclude pages from search, RSS feeds, sitemap
entries and translated alternate destinations, and theme collections.
Taxonomy landing pages are also excluded from the
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

Locale and RTL regressions run with the same real-core fixture on Hugo Extended
0.144.1, 0.154.5, and 0.167.0. Select a binary with
`HUGO_BIN=/absolute/path/to/hugo node --test tests/hugo.test.mjs` after building
the core and installing the root npm dependencies.

## Standalone Site Setup

Place the theme in `themes/hugo/` after staging its core bundle, or use
`themesDir` to select this repository's `packages/`. Install a PostCSS CLI in the
host site's npm toolchain and any plugins required by its PostCSS configuration.
The theme calls `postCSS` during stylesheet processing; missing tooling fails
the Hugo build rather than falling back to unprocessed styles.

For Hugo 0.158.0 and newer, a site configuration can start with:

```toml
baseURL = 'https://example.org/project/'
title = 'Project Documentation'
theme = 'hugo'
locale = 'en-US'

[params]
description = 'Reference and notes for the project.'
lastposts = 10
footer = 'Project documentation'

[outputs]
home = ['HTML', 'RSS', 'JSON']

[security.funcs]
getenv = ['^HUGO_', '^CI$', '^VERSION$']

[[menus.main]]
name = 'Home'
pageRef = '/'
```

Use `languageCode` in place of `locale` before 0.158.0. Configure `direction`
for a current RTL language or `languageDirection` on the older versions. Set a
numeric `params.lastposts`; the home template uses it as the latest-post limit.
Add a `content/search.md` with `layout: search` in its front matter for the header
search form, and place posts under `content/posts/`.

The imported masthead always renders social destinations. Supply `params.email`,
`github`, `linkedin`, and `youtube` account values, or override `baseof.html` for
a different header. The theme does not validate whether these external accounts
exist. Provide `static/favicon.ico` and `static/favicon.png`, or override the
head partial to use your own icons.

Page `description`, `summary`, `author`, `keywords`, `tags`, `categories`,
`image`/`images`, and `canonical` values feed the SEO partial. Site-level
description, author, keywords, images, jobTitle, and location supply defaults or
person metadata. Set `subtitle` for a secondary post heading. `application_css`
names an asset to process with PostCSS and include on that page.

## Shortcodes

All parameters below are named. Missing values are not generally validated;
supply the listed content inputs. File-inclusion shortcodes read trusted local
source during generation and must not receive untrusted filenames or HTML.

| Shortcode            | Parameters and Behavior                                                                                                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admonition`         | `type`, `content`, and optional `title`. Types `info`, `warning`, `danger`, `hint`, and `tip` select a label/icon; unknown types use Information. A custom title applies to danger or the fallback type. Content is escaped text.                                                 |
| `note`               | `content`, rendered as escaped text in a note container.                                                                                                                                                                                                                          |
| `euler_problem`      | `title` and `statement`, rendered as escaped text.                                                                                                                                                                                                                                |
| `card_plant`         | `name`, `scientific_name`, `type`, `growth_habit`, `watering`, `humidity`, `light`, `soil`, `temperature`, and `birthday`; optional `image`. Emits definition-list fields without scripts. Omitted fields remain empty.                                                           |
| `download_article`   | `href`, used as the destination of the article-download link. Supply a real generated or hosted file.                                                                                                                                                                             |
| `image_with_caption` | `src` and `caption`. A matching page image resource produces 400/800-pixel WebP variants and an 800-pixel fallback with dimensions; other URLs use an ordinary image. Caption text also supplies the image alternative.                                                           |
| `include`            | `file`, relative to the page source directory, and `language` for its fenced code block. A missing file fails the build.                                                                                                                                                          |
| `rawhtml`            | Optional `file` relative to the page source directory; otherwise uses the inner body. Inserts trusted HTML without escaping. A missing named file fails the build.                                                                                                                |
| `plotly`             | `json`, a fetchable Plotly figure URL containing `data` and `layout`; optional `height`, default `200px`. Uses contextual escaping and an independent per-page container ID. Missing `json` shows an error paragraph; fetch or rendering failure shows feedback in the container. |
| `threejs`            | `version`, `id`, and `src`. Adds an unpkg import map and module script; the module owns rendering into `threejs-container-<id>`. Use distinct IDs and a consistent Three.js module version.                                                                                       |
| `tabs`               | Inner `tab` shortcodes; optional accessible `label`, `sync` group name, and `tabRightAlign` with one-based tab numbers. Automatically includes the tabs script.                                                                                                                   |
| `tab`                | `tabName` and Markdown inner content, used only inside `tabs`. All panels remain visible without enhancement.                                                                                                                                                                     |
| `version`            | No parameters. Emits the `VERSION` environment value; the host must allow access to it in Hugo's security settings.                                                                                                                                                               |

```text
{{< tabs label="Examples" sync="language" >}}
  {{< tab tabName="Python" >}}Python example.{{< /tab >}}
  {{< tab tabName="JavaScript" >}}JavaScript example.{{< /tab >}}
{{< /tabs >}}
```

For file inclusion, place `sample.py` and `fragment.txt` beside the page source:

```text
{{< include file="sample.py" language="python" >}}
{{< rawhtml file="fragment.txt" />}}
```

The text fragment may contain trusted HTML. A `.txt` suffix keeps Hugo from
discovering it as a separate HTML content page, which current content security
defaults reject. Close or self-close `rawhtml` even when using its `file` option,
because the shortcode also accepts an inner body.

Tabs activate on click, Arrow Left/Right, Home, or End with roving focus.
Groups with the same `sync` value select peers by matching tab text, not position.
The imported `posts` layout also uses title-driven branches: `Categories` and
`Tags` show collections, `All posts` shows all discoverable posts, and other titles
filter the category name in lowercase or initial-capital form. Its conventional
section is `posts`; adapt the layout when using a different content model.

## Browser Scripts and Offline Use

`assets/js/tabs.js` enhances only shortcode tabs. `static/js/search.js` expects
the search layout's `#search-results[data-index-url]`, the masthead's
`#search-query`, and Fuse.js. That layout loads Fuse.js 6.6.2 and optional Mark.js
8.11.1 from cdnjs. Text remains literal; index loading and malformed data errors
produce the existing recovery message.

The `plotly` page flag loads `plotly-latest.min.js` from Plotly's CDN. The `math`
flag loads KaTeX 0.16.21 and its automatic renderer from jsDelivr. The `threejs`
flag loads legacy classic Three.js 0.125.2 and OrbitControls; the `threejs`
shortcode instead supplies an ES module import map. Avoid enabling both Three.js
loading paths on the same page without a deliberate compatibility setup.

These optional paths need network access and suitable script/style CSP rules;
the Plotly shortcode also needs permission to fetch its data. Self-host assets
and override the relevant partials for offline use or a stricter CSP. The core
CSS's no-remote-assets contract does not extend to these adapter features.

`static/js/youarehere.js` is retained legacy code for matching navigation button
text to URL segments. Current templates derive native-link state during the
Hugo build and do not load it. `script-footer.html` is another retained host
partial, with Bootstrap and `/js/main.js`; the base template does not call it.

## Source and Verification

`layouts/_default/` contains page, collection, feed, index, and search templates;
section overrides live beside it. `partials/discoverable-pages.html` owns the
shared flag filter, `language.html` handles locale compatibility, `seo.html`
emits metadata, and `unbloated-styles.html` handles CSS composition.
`assets/css/style.css` owns platform layout and aliases to core properties.

From the monorepo root, run `npm run build:adapters`,
`node --test tests/hugo.test.mjs tests/search.test.mjs`, and the Hugo cases in
`npm run test:browser`. The persistent consumer fixtures use the real bundled
core and local script substitutes; they do not certify live CDN availability.
See [Rendering Regressions](../../CONTRIBUTING.md#rendering-regressions) for
consumer browser checks and build requirements.
