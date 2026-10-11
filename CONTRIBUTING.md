# Contributing

Use Node.js 24 and the committed npm lockfile. Install dependencies with
`npm ci --ignore-scripts`. The project disables automatic lifecycle scripts in
`.npmrc`; explicit `npm run` commands still work.

Install pre-commit and enable the commit and push hooks:

```sh
python -m pip install pre-commit==4.6.2
pre-commit install
```

The hooks use the project's installed Prettier, ESLint, and Biome versions.
Pre-commit installs the pinned file checks, actionlint, zizmor, and Gitleaks
in isolated environments. The first run downloads those tools.

Commit hooks check file names, whitespace, file size, JSON, YAML, TOML,
JavaScript, CSS, workflow syntax and security, secrets, and reproducible builds.
Gitleaks scans the current files with redacted output. It excludes dependencies
and generated files through `.gitleaks.toml`; it does not scan Git history.
Push hooks also run `npm audit --audit-level=high`, which needs registry access.

Run both hook stages locally:

```sh
pre-commit run --all-files --show-diff-on-failure
pre-commit run --all-files --hook-stage pre-push
```

Update remote hooks with `pre-commit autoupdate --freeze` to keep their
revisions pinned to commit hashes.

Pull-request and Release workflows run the commit hooks in `code-style` and
check workflow security with zizmor in `actions-style`. The local zizmor hook
runs offline; the action also runs online audits. Tests wait for `code-style`;
the package build waits for both tests and `actions-style`. Dependency audits
also run in the CI test jobs.

Edit design values in `src/tokens.json`, semantic element rules in
`src/base.css`, and optional component rules in `src/components.css`. Keep
layouts and selectors specific to Hugo, Sphinx, or Reveal.js in their adapters.

Run these checks before opening a pull request:

```sh
npx --no-install playwright install --with-deps chromium firefox webkit
npm run format
npm run lint
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

Documentation uses MkDocs and the generated library stylesheet. Install the
locked Python dependencies as shown in
[Documentation Prerequisites](docs/getting-started/prerequisites.md), then run
`npm run docs:dev` to edit pages with live reload. Restart that command after
changing the shared CSS or tokens so it rebuilds the stylesheet.

Document public inputs, return values, errors, and side effects in source
comments. Update the [Source Reference](docs/reference/source.md), token table,
and component examples when behavior changes. Run `npm run docs:build` and
`npm run test:docs` before submitting documentation changes. CI runs both checks
in each test job. Generated documentation assets and `site/` stay out of Git.

The package includes full source and build instructions for its LGPLv3 license.
Keep the license banner in distributed CSS and Sass files.
