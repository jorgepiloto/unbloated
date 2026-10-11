// SPDX-License-Identifier: LGPL-3.0-only
/** Check token validation, deterministic output, Sass consumption, and contrast. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import * as sass from "sass";
import { checkBuild, render, root, validateTokens } from "../scripts/build.mjs";

const tokens = JSON.parse(
  await readFile(new URL("src/tokens.json", root), "utf8"),
);

test("builds from source are reproducible in independent output directories", async () => {
  await checkBuild();
});

test("generated distribution matches the source", async () => {
  for (const [name, content] of await render()) {
    assert.equal(
      await readFile(new URL(`dist/${name}`, root), "utf8"),
      content,
    );
  }
});

test("unsafe token names, values, and unsupported groups are rejected", () => {
  for (const mutate of [
    (value) => {
      value.color.text = "#000000; background: url(https://example.com)";
    },
    (value) => {
      value.font.family = 'monospace; @import "remote.css"';
    },
    (value) => {
      value.font.family = '"Broken Font, monospace';
    },
    (value) => {
      value.color["bad;name"] = "#ffffff";
    },
    (value) => {
      value.color.text = "#007bff";
    },
    (value) => {
      value.border.radius = "5px";
    },
    (value) => {
      value.color = [];
    },
    (value) => {
      value.unknown = { value: "1px" };
    },
    (value) => {
      delete value.font;
    },
  ]) {
    const value = structuredClone(tokens);
    mutate(value);
    assert.throws(() => validateTokens(value));
  }
  assert.throws(() => validateTokens(null));
});

test("distribution has no remote assets or executable CSS", async () => {
  for (const [name, content] of await render()) {
    assert.doesNotMatch(
      content,
      /@import|url\(|expression\(|javascript:/i,
      name,
    );
    assert.match(content, /LGPL-3\.0-only/, name);
  }
});

test("Sass tokens compile and allow consumer overrides", () => {
  const result = sass.compileString(
    `
    @use "tokens" with ($unbloat-font-family: ("Example Mono", monospace));
    .consumer {
      color: tokens.$unbloat-color-text;
      border-radius: tokens.$unbloat-border-radius;
      font-family: tokens.$unbloat-font-family;
    }
  `,
    { loadPaths: [new URL("dist/", root).pathname] },
  );
  assert.match(result.css, /color: #000000/);
  assert.match(result.css, /border-radius: 0/);
  assert.match(result.css, /font-family: "Example Mono", monospace/);
});

test("README includes the required sections", async () => {
  const readme = await readFile(new URL("README.md", root), "utf8");
  for (const section of [
    "About",
    "Prerequisites",
    "Getting Started",
    "User Guide",
    "License",
  ]) {
    assert.ok(readme.includes(`## ${section}\n`), section);
  }
});

test("default text, muted text, and inverse text have readable contrast", () => {
  const luminance = (hex) => {
    const channel = Number.parseInt(hex.slice(1, 3), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };
  for (const [foreground, background] of [
    ["text", "surface"],
    ["muted", "surface"],
    ["muted", "surface-muted"],
    ["inverse-text", "inverse-surface"],
  ]) {
    const values = [
      luminance(tokens.color[foreground]),
      luminance(tokens.color[background]),
    ].sort((a, b) => a - b);
    assert.ok(
      (values[1] + 0.05) / (values[0] + 0.05) >= 4.5,
      `${foreground} on ${background}`,
    );
  }
});
