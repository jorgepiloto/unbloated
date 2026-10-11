// SPDX-License-Identifier: LGPL-3.0-only
/** Build, pack, install, and inspect a source-only checkout as a package consumer. */
import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { root } from "../scripts/build.mjs";

const execFile = promisify(execFileCallback);
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

test("source-only checkout builds, packs, and installs without runtime dependencies", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "unbloated-package-"));
  try {
    const checkout = join(temporary, "checkout");
    await mkdir(join(checkout, "scripts"), { recursive: true });
    for (const path of [
      "package.json",
      ".gitignore",
      ".npmrc",
      "README.md",
      "LICENSE",
      "COPYING",
      "NOTICE",
      "src",
      "scripts/build.mjs",
    ]) {
      await cp(new URL(path, root), join(checkout, path), { recursive: true });
    }
    await assert.rejects(access(join(checkout, "dist")), { code: "ENOENT" });
    await execFile(process.execPath, ["scripts/build.mjs", "--check"], {
      cwd: checkout,
    });
    await assert.rejects(access(join(checkout, "dist")), { code: "ENOENT" });
    await execFile(process.execPath, ["scripts/build.mjs"], { cwd: checkout });
    const packed = await execFile(
      npm,
      ["pack", "--json", "--ignore-scripts", "--pack-destination", temporary],
      { cwd: checkout },
    );
    const [metadata] = JSON.parse(packed.stdout);
    const files = metadata.files.map(({ path }) => path);
    for (const file of [
      "LICENSE",
      "COPYING",
      "NOTICE",
      "README.md",
      "src/tokens.json",
      "src/base.css",
      "src/components.css",
      "scripts/build.mjs",
      "dist/unbloat.css",
      "dist/_tokens.scss",
    ]) {
      assert.ok(files.includes(file), `Missing ${file}`);
    }
    assert.ok(
      files.every((path) =>
        /^(dist\/|src\/|scripts\/build\.mjs$|package\.json$|README\.md$|LICENSE$|COPYING$|NOTICE$)/.test(
          path,
        ),
      ),
      files.join("\n"),
    );
    await writeFile(
      join(temporary, "package.json"),
      JSON.stringify({ private: true, type: "module" }),
    );
    await execFile(
      npm,
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        join(temporary, metadata.filename),
      ],
      { cwd: temporary },
    );
    const directory = join(temporary, "node_modules", "unbloated");
    const manifest = JSON.parse(
      await readFile(join(directory, "package.json"), "utf8"),
    );
    assert.equal(manifest.license, "LGPL-3.0-only");
    assert.equal(manifest.dependencies, undefined);
    assert.equal(manifest.scripts.postinstall, undefined);
    for (const path of Object.values(manifest.exports)) {
      await readFile(join(directory, path));
    }
    const source = await readFile(
      join(checkout, "dist", "unbloat.css"),
      "utf8",
    );
    assert.equal(
      await readFile(join(directory, manifest.style), "utf8"),
      source,
    );
    const resolved = await execFile(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'console.log(import.meta.resolve("unbloated/unbloat.css"))',
      ],
      { cwd: temporary },
    );
    assert.ok(resolved.stdout.trim().endsWith("/dist/unbloat.css"));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
