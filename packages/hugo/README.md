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
