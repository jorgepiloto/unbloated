# Security

## Report a Vulnerability

Report security issues privately to
[contact@jorgemartinez.space](mailto:contact@jorgemartinez.space). Include the
affected version, reproduction steps, and the expected impact. Do not include
credentials or private user data. This project does not promise a response
deadline.

## Package and Build

The published package has no runtime dependencies or install-time hooks. Its
CSS makes no network requests. Development tools are pinned to exact versions
and installed from the committed lockfile with lifecycle scripts disabled.
CI verifies registry signatures before auditing dependencies.
Dependabot checks npm dependencies and GitHub Actions weekly; the nightly
workflow audits the locked development dependencies.

GitHub Actions use full commit SHA pins and read-only repository permissions.
Checkout does not retain credentials. Pull requests run through `pull_request`
and receive no publishing permission. The release workflow publishes through
OIDC and does not store an npm publishing token. Verification runs in a separate
job without OIDC permission. The publish job only downloads and publishes the
verified tarball; it does not install dependencies or run the package source.
Configure the external npm
trust relationship and GitHub environment as described in
[Release Setup](docs/content/releasing.md).

Consumers should pin a release. For assets loaded from a CDN, use subresource
integrity when appropriate or serve a verified local copy. CSS overrides and
project adapters remain the consumer's responsibility.
