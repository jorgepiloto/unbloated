// SPDX-License-Identifier: LGPL-3.0-only
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

export const root = new URL("../", import.meta.url);
const banner =
  "/*! unbloated | Copyright (C) 2026 Jorge Martinez | LGPL-3.0-only */\n";
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check"))
    throw new Error("Usage: node scripts/build.mjs [--check]");
  if (args.includes("--check")) await checkBuild();
  else await build();
}
