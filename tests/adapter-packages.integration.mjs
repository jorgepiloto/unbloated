// SPDX-License-Identifier: LGPL-3.0-only
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import test from "node:test";
import { prepareAdapters } from "../scripts/adapters.mjs";
import { packAdapters } from "../scripts/pack-adapters.mjs";
import { fixture } from "./adapters-fixture.mjs";

test("real package builders retain fixture CSS in every distribution", async (t) => {
  const directory = await fixture(t);
  const checkout = new URL("../", import.meta.url);
  for (const name of [
    ".gitignore",
    "packages/hugo/package.json",
    "packages/hugo/theme.toml",
    "packages/sphinx/pyproject.toml",
    "packages/sphinx/.gitignore",
    "packages/sphinx/hatch_build.py",
    "packages/sphinx/README.rst",
    "packages/sphinx/LICENSE",
    "packages/sphinx/src/sphinx_unbloated_theme/__init__.py",
    "scripts/check-adapter-artifacts.py",
    "packages/latex/unbloated-book.cls",
    "packages/latex/README.md",
    "packages/latex/example/book.tex",
    "packages/latex/example/chapters/integration.tex",
    "packages/latex/example/chapters/implementation.tex",
    "packages/latex/tests/check.sh",
    "packages/latex/tests/options.tex",
  ]) {
    const target = new URL(name, directory);
    await mkdir(new URL("./", target), { recursive: true });
    await writeFile(target, await readFile(new URL(name, checkout)));
  }
  for (const name of [
    "packages/quarto/README.md",
    "packages/quarto/template.qmd",
  ]) {
    await writeFile(new URL(name, directory), "Test fixture\n");
  }
  await prepareAdapters({ directory });
  await packAdapters({ directory });
  const execFile = promisify(execFileCallback);
  await execFile(process.env.PYTHON || "python3", [
    new URL("scripts/check-adapter-artifacts.py", directory).pathname,
  ]);
});
