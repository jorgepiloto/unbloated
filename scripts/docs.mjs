// SPDX-License-Identifier: LGPL-3.0-only
/** Build and serve Hugo documentation with this checkout's CSS and package version. */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFile as execFileCallback, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { build, root } from "./build.mjs";

const execFile = promisify(execFileCallback);
const localHugo = new URL(".cache/hugo/hugo", root);

/**
 * Install the locked Linux x64 or arm64 Hugo binary in the repository cache.
 * Verify the release archive against the committed SHA-256 before extracting.
 * Other platforms use an installed Hugo executable through PATH or HUGO_BIN.
 * @returns {Promise<void>}
 * @throws {Error} On unsupported platforms, download, checksum, or extraction errors.
 */
export async function setupHugo() {
  const lock = JSON.parse(await readFile(new URL("docs/hugo-lock.json", root)));
  const asset = process.platform === "linux" && lock.linux[process.arch];
  if (!asset) {
    throw new Error(
      `Install Hugo ${lock.version} and set HUGO_BIN or add it to PATH.`,
    );
  }
  const response = await fetch(
    `https://github.com/gohugoio/hugo/releases/download/v${lock.version}/${asset.archive}`,
    { signal: AbortSignal.timeout(120_000) },
  );
  if (!response.ok)
    throw new Error(`Hugo download failed: HTTP ${response.status}`);
  const archive = Buffer.from(await response.arrayBuffer());
  if (createHash("sha256").update(archive).digest("hex") !== asset.sha256) {
    throw new Error(
      "Hugo archive checksum does not match docs/hugo-lock.json.",
    );
  }
  const directory = new URL(".cache/hugo/", root);
  await mkdir(directory, { recursive: true });
  const path = new URL("hugo.tar.gz", directory);
  await writeFile(path, archive);
  try {
    await execFile("tar", [
      "-xzf",
      fileURLToPath(path),
      "-C",
      fileURLToPath(directory),
      "hugo",
    ]);
  } finally {
    await rm(path, { force: true });
  }
}

/**
 * Rebuild CSS and copy it into Hugo's asset pipeline with package version data.
 * Generated files stay out of Git; fingerprints change when their contents change.
 * @returns {Promise<void>}
 * @throws {Error} On library build, manifest, or filesystem errors.
 */
export async function prepareDocs() {
  await build();
  await mkdir(new URL("docs/assets/", root), { recursive: true });
  await mkdir(new URL("docs/data/", root), { recursive: true });
  await copyFile(
    new URL("dist/unbloat.css", root),
    new URL("docs/assets/unbloat.css", root),
  );
  const { version, description } = JSON.parse(
    await readFile(new URL("package.json", root)),
  );
  await writeFile(
    new URL("docs/data/package.json", root),
    JSON.stringify({ version, description }),
  );
}

/**
 * Run a warning-free Hugo build or a loopback-only server with the locked version.
 * HUGO_BIN selects an executable; otherwise use the local cache, then PATH.
 * Build forwards extra Hugo flags, including --baseURL for deployment prefixes.
 * @param {"setup" | "build" | "serve" | "preview"} mode Requested command.
 * @param {string[]} [extraArgs] Additional Hugo command arguments, without a shell.
 * @returns {Promise<number>} Process exit code, or 1 if terminated.
 * @throws {Error} On invalid modes, version mismatch, setup, or process-start errors.
 */
export async function runDocs(mode, extraArgs = []) {
  if (!["setup", "build", "serve", "preview"].includes(mode)) {
    throw new Error(
      "Usage: node scripts/docs.mjs setup|build|serve|preview [Hugo flags]",
    );
  }
  if (mode === "setup") {
    await setupHugo();
    return 0;
  }
  const hugo =
    process.env.HUGO_BIN ||
    (existsSync(localHugo) ? fileURLToPath(localHugo) : "hugo");
  const lock = JSON.parse(await readFile(new URL("docs/hugo-lock.json", root)));
  const { stdout } = await execFile(hugo, ["version"]);
  if (/^hugo v([\d.]+)/.exec(stdout)?.[1] !== lock.version) {
    throw new Error(
      `Use Hugo ${lock.version}. Run npm run docs:setup on Linux, or set HUGO_BIN.`,
    );
  }
  await prepareDocs();
  const args = ["--source", "docs", "--panicOnWarning", "--noBuildLock"];
  if (mode === "build") {
    args.push("--cleanDestinationDir");
  } else {
    const port = mode === "serve" ? "8000" : "4174";
    args.unshift("server");
    args.push(
      "--bind",
      "127.0.0.1",
      "--port",
      port,
      "--baseURL",
      `http://127.0.0.1:${port}/`,
    );
    if (mode === "preview") args.push("--disableLiveReload", "--watch=false");
  }
  args.push(...extraArgs);
  return new Promise((resolve, reject) => {
    const child = spawn(hugo, args, {
      cwd: fileURLToPath(root),
      stdio: "inherit",
    });
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    const cleanup = () => {
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", terminate);
    };
    child.once("error", (error) => {
      cleanup();
      reject(error);
    });
    child.once("exit", (code) => {
      cleanup();
      resolve(code ?? 1);
    });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await runDocs(process.argv[2], process.argv.slice(3));
}
