# Release Setup

The package metadata assumes the public repository will be
`https://github.com/jorgepiloto/unbloated-css`. Update `package.json` if the final
repository differs. The package name is `unbloated`; registry availability does
not reserve it. Nothing is published by building or testing locally.

## Configure Publishing

1. Create the GitHub repository `unbloated-css` and push this project to its
   `main` branch. The existing `jorgepiloto/unbloated` repository hosts the older
   Hugo theme, so it is not used as the publication source for this package.
2. Create the GitHub environment `npm`. Restrict deployments to release tags
   and configure required reviewers for publication.
3. If npm requires an initial publication to create the package, perform that
   bootstrap release through your authenticated npm account with two-factor
   authentication using the reviewed tarball produced by the pull-request workflow.
   Complete this npm setup before relying on OIDC publication in `release.yml`.
4. In the npm package settings, add a GitHub Actions trusted publisher with
   owner `jorgepiloto`, repository `unbloated-css`, workflow `release.yml`, and
   environment `npm`. Enable the allowed action for direct `npm publish`.
   Change the owner and repository if your remote differs.
5. Require two-factor authentication and disable token-based publishing after
   trusted publishing is configured and verified.

Trusted publishing requires npm 11.5.1 or newer and Node.js 22.14 or newer. The
release workflow uses Node.js 24. The package's repository URL must match the
GitHub repository. See npm's
[Trusted Publishing documentation](https://docs.npmjs.com/trusted-publishers/).

No `NPM_TOKEN` secret is needed. The publish job receives `id-token: write` so
npm can exchange a short-lived GitHub OIDC token. npm provenance links the
publication to the public repository and workflow. Keep the repository public
for provenance generation.

## Publish a Version

1. Update `package.json`, the lockfile, and `CHANGELOG.md` on a reviewed branch.
   Update versioned documentation examples when appropriate.
2. Run `npm run build`, `npm run verify`, and `npm audit --audit-level=high`.
3. Wait for the pull-request checks to pass and merge to `main`.
4. Create a tag `v<version>` on the reviewed commit and push the tag. This
   triggers `release.yml`.
5. Wait for the checks and build to pass, then approve the `npm` environment
   deployment. The `code-style` job runs pre-commit before `tests`.
   `actions-style` runs zizmor in parallel. The `tests` job verifies the tag
   against `package.json`, checks that the commit belongs to `main`, and runs
   the unit tests, browser tests, documentation checks, build checks, and dependency audits.
   `build-library` waits for both `tests` and `actions-style`, then builds and
   uploads the npm tarball.
6. Confirm that `release-npm` publishes the tarball through trusted publishing.
   After npm publication succeeds, `release-github` creates a GitHub release
   with generated release notes and attaches the same tarball. Only the npm
   job receives OIDC permission, and only the GitHub release job receives
   permission to write repository contents.

Prereleases are intentionally excluded from this workflow. npm versions cannot
be overwritten; fix a failed release through the appropriate configuration or
publish a new version when the package content must change. Retain the source
commit and release artifact for each published version.

If GitHub release creation fails after npm publication succeeds, rerun only the
failed job. Rerunning `release-npm` would try to publish an existing version.

## Download Artifacts

Git tracks the source. It ignores `dist/` and npm tarballs. All verification
workflows explicitly build the distribution because dependency installation and
packaging disable lifecycle scripts with `--ignore-scripts`. The npm `files`
list includes `dist/`, so generated assets are included in published packages.

The pull-request and Night workflows save tarballs after their checks pass.
Night runs manually or daily at 08:00 in `Europe/Madrid`, including daylight
saving changes. The Release workflow saves the published tarball as a GitHub
Actions artifact and attaches it to the public GitHub release.
