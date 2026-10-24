// SPDX-License-Identifier: LGPL-3.0-only
/** Render native adapter examples into their documentation's publish directory. */
import { execFile as callback } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { root } from "./build.mjs";

const execFile = promisify(callback);

async function run(command, args, options) {
  const { stdout, stderr } = await execFile(command, args, {
    maxBuffer: 16 * 1024 * 1024,
    timeout: 180_000,
    ...options,
  });
  process.stdout.write(stdout);
  process.stderr.write(stderr);
}

/**
 * Build a resolved, allowlisted project's native example from current sources.
 * Generator failures reject the documentation build; cached PDFs are not reused.
 * @param {object} target Result of projectDocumentation(project, channel).
 * @param {string} version Adapter version used in the Hugo example footer.
 * @returns {Promise<void>} Resolves after the example's entry file is verified.
 */
export async function buildProjectExample(target, version) {
  const { example, directory } = target.configuration;
  if (!example) return;
  const source = new URL(
    `.cache/project-examples/${target.project}/${target.channel}/`,
    root,
  );
  const output = new URL("example/", target.directory);
  await rm(source, { recursive: true, force: true });
  await mkdir(source, { recursive: true });
  await mkdir(output, { recursive: true });
  if (example.type === "pdf") {
    await run(
      "latexmk",
      [
        "-lualatex",
        "-no-shell-escape",
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-file-line-error",
        "-Werror",
        `-outdir=${fileURLToPath(source)}`,
        "example/book.tex",
      ],
      { cwd: new URL(`${directory}/`, root) },
    );
    await cp(new URL("book.pdf", source), new URL("book.pdf", output));
  } else if (example.type === "quarto") {
    await cp(new URL(`${directory}/example/`, root), source, {
      recursive: true,
    });
    await cp(
      new URL(`${directory}/_extensions/`, root),
      new URL("_extensions/", source),
      { recursive: true },
    );
    await run(
      process.env.QUARTO_BIN || "quarto",
      ["render", "slides.qmd", "--output", "index.html"],
      { cwd: source },
    );
    await cp(new URL("index.html", source), new URL("index.html", output));
  } else if (example.type === "hugo") {
    await cp(new URL(`${directory}/example/`, root), source, {
      recursive: true,
    });
    const localHugo = new URL(".cache/hugo/hugo", root);
    const binary =
      process.env.HUGO_BIN ||
      (existsSync(localHugo) ? fileURLToPath(localHugo) : "hugo");
    await run(
      binary,
      [
        "--source",
        fileURLToPath(source),
        "--destination",
        fileURLToPath(output),
        "--themesDir",
        fileURLToPath(new URL("packages/", root)),
        "--baseURL",
        new URL("example/", target.baseURL).href,
        "--panicOnWarning",
        "--noBuildLock",
      ],
      { cwd: root, env: { ...process.env, VERSION: version } },
    );
  } else throw new Error(`Unknown example type: ${example.type}`);
  const entry = await readFile(
    new URL(example.type === "pdf" ? "book.pdf" : "index.html", output),
  );
  if (
    !entry.length ||
    (example.type === "pdf" && entry.subarray(0, 5).toString() !== "%PDF-")
  )
    throw new Error(`Invalid rendered example: ${target.project}`);
}
