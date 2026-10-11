// SPDX-License-Identifier: LGPL-3.0-only
/** Build the documentation with MkDocs and the library's generated stylesheet. */
import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build, root } from "./build.mjs";

/**
 * Rebuild the library and copy its complete stylesheet into the docs assets.
 * Generated assets stay out of Git; component previews use the current source.
 * @returns {Promise<void>}
 */
export async function prepareDocs() {
  await build();
  await mkdir(new URL("docs/assets/", root), { recursive: true });
  await copyFile(
    new URL("dist/unbloat.css", root),
    new URL("docs/assets/unbloat.css", root),
  );
}

/**
 * Choose an explicit Python interpreter, the local docs environment, or Python
 * on PATH. DOCS_PYTHON supports environments created outside the repository.
 * @returns {string} Executable path passed directly to spawn, without a shell.
 */
function docsPython() {
  if (process.env.DOCS_PYTHON) return process.env.DOCS_PYTHON;
  const local = fileURLToPath(
    new URL(
      process.platform === "win32"
        ? ".venv-docs/Scripts/python.exe"
        : ".venv-docs/bin/python",
      root,
    ),
  );
  return existsSync(local)
    ? local
    : process.platform === "win32"
      ? "python"
      : "python3";
}

/**
 * Run a strict MkDocs build or a loopback-only documentation server.
 * Preview serves an existing site; build and serve first prepare the CSS.
 * @param {"build" | "serve" | "preview"} mode Requested documentation command.
 * @returns {Promise<number>} Child process exit code, or 1 if it was terminated.
 * @throws {Error} If the mode is unsupported or the Python process cannot start.
 */
export async function runDocs(mode) {
  if (!["build", "serve", "preview"].includes(mode)) {
    throw new Error("Usage: node scripts/docs.mjs build|serve|preview");
  }
  if (mode !== "preview") await prepareDocs();
  const args =
    mode === "preview"
      ? [
          "-m",
          "http.server",
          "4174",
          "--bind",
          "127.0.0.1",
          "--directory",
          "site",
        ]
      : ["-m", "mkdocs", mode, "--strict", "--config-file", "mkdocs.yml"];
  if (mode === "serve") args.push("--dev-addr", "127.0.0.1:8000");
  return new Promise((resolve, reject) => {
    const child = spawn(docsPython(), args, {
      cwd: fileURLToPath(root),
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) {
    throw new Error("Usage: node scripts/docs.mjs build|serve|preview");
  }
  process.exitCode = await runDocs(process.argv[2]);
}
