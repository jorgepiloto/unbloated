// SPDX-License-Identifier: LGPL-3.0-only
/** Validate design tokens and generate the CSS and Sass distribution. */
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root used to resolve source and output paths. @type {URL} */
export const root = new URL("../", import.meta.url);
const banner =
  "/*! unbloated | Copyright (C) 2026 Jorge Martinez | LGPL-3.0-only */\n";
// These groups define the supported token schema. Names become CSS and Sass names.
const groups = new Set([
  "color",
  "font",
  "line-height",
  "heading",
  "space",
  "border",
  "shadow",
  "focus",
]);

/**
 * Validate the supported token groups, safe names and values, and square corners.
 * Values are restricted before interpolation into generated CSS and Sass.
 * @param {unknown} tokens Parsed design-token data.
 * @returns {Record<string, Record<string, string>>} The validated input object.
 * @throws {Error} If groups, names, values, or the border radius are invalid.
 */
export function validateTokens(tokens) {
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    throw new Error("Tokens must be an object.");
  }
  for (const group of groups) {
    if (!Object.hasOwn(tokens, group))
      throw new Error(`Missing token group: ${group}`);
  }
  for (const [group, values] of Object.entries(tokens)) {
    if (
      !groups.has(group) ||
      !values ||
      typeof values !== "object" ||
      Array.isArray(values) ||
      !Object.keys(values).length
    ) {
      throw new Error(`Invalid token group: ${group}`);
    }
    for (const [name, value] of Object.entries(values)) {
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ||
        typeof value !== "string"
      ) {
        throw new Error(`Invalid token: ${group}.${name}`);
      }
      const valid =
        group === "color"
          ? /^#([a-f0-9]{2})\1\1$/i.test(value)
          : group === "font" && name === "family"
            ? /^(?:(?:"[a-zA-Z0-9 -]+"|[a-zA-Z][a-zA-Z0-9-]*), )*monospace$/.test(
                value,
              )
            : group === "line-height"
              ? /^(?:1|2)(?:\.\d+)?$/.test(value)
              : /^(?:0|(?:\d+(?:\.\d+)?)(?:rem|px))$/.test(value);
      if (!valid) throw new Error(`Invalid token value: ${group}.${name}`);
    }
  }
  if (tokens.border.radius !== "0")
    throw new Error("Unbloat requires square corners.");
  return tokens;
}

/**
 * Read canonical tokens and CSS sources, then render the five distribution files.
 * Check that source styles only reference token names defined in tokens.json.
 * @returns {Promise<Map<string, string>>} Output filenames and their contents.
 * @throws {Error} If tokens, CSS references, or source-file reads are invalid.
 */
export async function render() {
  const tokens = validateTokens(
    JSON.parse(await readFile(new URL("src/tokens.json", root), "utf8")),
  );
  const entries = Object.entries(tokens).flatMap(([group, values]) =>
    Object.entries(values).map(([name, value]) => [
      `unbloat-${group}-${name}`,
      value,
    ]),
  );
  const tokensCss = `${banner}:root {\n${entries.map(([key, value]) => `  --${key}: ${value};`).join("\n")}\n}\n`;
  const sass = `${banner}${entries.map(([key, value]) => `$${key}: ${value} !default;`).join("\n")}\n`;
  const base = await readFile(new URL("src/base.css", root), "utf8");
  const components = await readFile(
    new URL("src/components.css", root),
    "utf8",
  );
  const names = new Set(entries.map(([name]) => name));
  for (const [, name] of `${base}\n${components}`.matchAll(
    /var\(--(unbloat-[a-z0-9-]+)/g,
  )) {
    if (!names.has(name)) throw new Error(`Undefined CSS token: ${name}`);
  }
  return new Map([
    ["tokens.css", tokensCss],
    ["_tokens.scss", sass],
    ["base.css", `${banner}${base}`],
    ["components.css", `${banner}${components}`],
    ["unbloat.css", `${tokensCss}\n${base}\n${components}`],
  ]);
}

/**
 * Write the rendered CSS and Sass files to an output directory.
 * Reject extra files so stale or unexpected assets cannot pass a build check.
 * @param {{directory?: string}} [options] Destination, defaulting to dist/.
 * @returns {Promise<void>}
 * @throws {Error} If source validation, filesystem operations, or output checks fail.
 */
export async function build({
  directory = fileURLToPath(new URL("dist/", root)),
} = {}) {
  const files = await render();
  await mkdir(directory, { recursive: true });
  for (const [name, content] of files) {
    await writeFile(join(directory, name), content);
  }
  const actualFiles = await readdir(directory);
  if (actualFiles.some((name) => !files.has(name)))
    throw new Error("Unexpected file in dist/.");
}

/**
 * Compare two fresh builds in independent temporary directories byte for byte.
 * Remove both outputs on success or failure; an existing dist/ is not required.
 * @returns {Promise<void>}
 * @throws {Error} If builds differ or source validation and filesystem operations fail.
 */
export async function checkBuild() {
  const temporary = await mkdtemp(join(tmpdir(), "unbloated-build-"));
  try {
    const first = join(temporary, "first");
    const second = join(temporary, "second");
    await build({ directory: first });
    await build({ directory: second });
    const names = (await readdir(first)).sort();
    const otherNames = (await readdir(second)).sort();
    if (JSON.stringify(names) !== JSON.stringify(otherNames)) {
      throw new Error("Builds produced different file lists.");
    }
    for (const name of names) {
      const content = await readFile(join(first, name));
      const otherContent = await readFile(join(second, name));
      if (!content.equals(otherContent)) {
        throw new Error(`Builds produced different contents for ${name}.`);
      }
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

// Importing this module has no build side effects. The CLI accepts only --check.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check"))
    throw new Error("Usage: node scripts/build.mjs [--check]");
  if (args.includes("--check")) await checkBuild();
  else await build();
}
