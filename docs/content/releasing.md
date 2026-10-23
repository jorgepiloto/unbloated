---
title: Release Setup
---

The package name is `unbloated`. Before publishing, check that the repository
URLs in `package.json` match the GitHub repository you publish from. The manifest
uses `jorgepiloto/unbloated`. Verify the external trusted publisher and provenance
settings before publication. Registry availability does not reserve the package name.

## Configure Publishing

1. Push the project to the publishing repository's `main` branch and check its
   URL against `package.json`.
2. Create the GitHub environment `npm`. Restrict deployments to release tags
   and configure required reviewers for publication.
3. If npm requires an initial publication to create the package, perform that
   bootstrap release through your authenticated npm account with two-factor
   authentication using the reviewed tarball produced by the pull-request workflow.
   Complete this npm setup before relying on OIDC publication in `release.yml`.
4. In the npm package settings, add a GitHub Actions trusted publisher with
   owner `jorgepiloto`, repository `unbloated`, workflow `release.yml`, and
   environment `npm`. Use the actual owner and repository if you publish from
   a different remote. Enable the allowed action for direct `npm publish`.
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

## Configure Documentation Deployment

Add the repository secret `WEBSITE_DEPLOY_TOKEN` with a personal access token that
can write to the `gh-pages` branch of `jorgepiloto/website`. Documentation deploys
to that repository, not this package's GitHub Pages site. The deployment jobs
update only their documentation subdirectory and preserve the rest of the website.

Every workflow runs `doc-build` and uploads the `documentation-html` artifact.
Pull requests build documentation without deploying it. Night runs on `main`
publish development documentation after the required validation and package build
succeed. Tests serve the downloaded static artifact without rebuilding it.
Development documentation lives at
`https://jorgemartinez.space/projects/unbloated/version/dev/`.

After `release-github` succeeds, `doc-deploy-stable` publishes documentation at
`https://jorgemartinez.space/projects/unbloated/version/stable/` and
`https://jorgemartinez.space/projects/unbloated/version/<version>/`, with the
leading `v` removed from the release tag. The release workflow builds separate
stable and versioned artifacts so asset and navigation URLs use the correct
prefix. Tests serve both exact artifacts at those prefixes before release.
Deployment jobs share the `website-documentation` concurrency group
to serialize website updates from this repository.

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
