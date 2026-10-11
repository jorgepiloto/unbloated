# Contributing

Use Node.js 24 and the committed npm lockfile. Install dependencies with
`npm ci --ignore-scripts`. The project disables automatic lifecycle scripts in
`.npmrc`; explicit `npm run` commands still work.

Edit design values in `src/tokens.json`, semantic element rules in
`src/base.css`, and optional component rules in `src/components.css`. Keep
layouts and selectors specific to Hugo, Sphinx, or Reveal.js in their adapters.

Run these checks before opening a pull request:

```sh
npx --no-install playwright install --with-deps chromium firefox webkit
npm run format
npm run build
npm run verify
npm audit --audit-level=high
```

Do not add runtime dependencies, remote asset requests, rounded components,
or colored accents to the shared styles. Use logical CSS properties where
possible. Preserve visible keyboard focus and native element semantics.

Commit source changes. Git ignores generated `dist/` files and npm tarballs.
CI builds distributions from the source before testing, and `release.yml`
publishes the verified CI artifact. `npm run build:check` compares two fresh
builds in temporary directories. Add tests
when a change affects supported behavior. Treat exported paths, token names,
and documented classes as the public interface. Changes to those names require
a migration note. Record intentional visual changes in the changelog and
inspect the reference page on desktop and mobile.

The package includes full source and build instructions for its LGPLv3 license.
Keep the license banner in distributed CSS and Sass files.
