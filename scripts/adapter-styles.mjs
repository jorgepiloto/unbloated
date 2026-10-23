// SPDX-License-Identifier: LGPL-3.0-only
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import * as sass from "sass";

const root = new URL("../", import.meta.url);
const sources = [
  "packages/sphinx/src/",
  "packages/quarto/_extensions/",
  "packages/hugo/assets/",
  "packages/hugo/layouts/",
];
const generated = new Set([
  "packages/sphinx/src/sphinx_unbloated_theme/theme/sphinx_unbloated_theme/static/css/unbloat.css",
  "packages/quarto/_extensions/unbloated/unbloat.css",
  "packages/hugo/assets/css/unbloat.css",
]);
const colorProperties =
  /(?:color$|^background(?:-image)?$|^border(?:-(?:top|right|bottom|left|inline|block|start|end))*$|^(?:fill|stroke|box-shadow|text-shadow)$)/;
const allowedWords = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "none",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "thin",
  "medium",
  "thick",
  "solid",
  "dashed",
  "dotted",
  "double",
  "hidden",
  "groove",
  "ridge",
  "inset",
  "outset",
  "linear-gradient",
  "radial-gradient",
  "conic-gradient",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeating-conic-gradient",
  "to",
  "top",
  "bottom",
  "left",
  "right",
  "at",
  "center",
  "circle",
  "ellipse",
  "closest-side",
  "farthest-side",
  "closest-corner",
  "farthest-corner",
  "from",
  "in",
  "srgb",
  "srgb-linear",
  "oklab",
  "oklch",
  "hsl",
  "hwb",
  "shorter",
  "longer",
  "increasing",
  "decreasing",
  "hue",
  "calc",
  "min",
  "max",
  "clamp",
]);

/**
 * Reject adapter-owned palettes, font stacks, core overrides, and unknown tokens.
 * Layout geometry and widget-specific sizing remain adapter responsibilities.
 * @param {string} source CSS source.
 * @param {{from?: string, core?: string}} [options] Source label and built core.
 */
export function assertAdapterStyle(
  source,
  { from = "adapter.css", core } = {},
) {
  const known =
    core === undefined
      ? null
      : new Set(
          [...core.matchAll(/(--unbloat-[\w-]+)\s*:/g)].map(
            (match) => match[1],
          ),
        );
  postcss.parse(source, { from }).walkDecls((declaration) => {
    const { value } = declaration;
    const prop = declaration.prop.toLowerCase();
    const fail = (reason) => {
      throw declaration.error(reason);
    };
    if (prop.startsWith("--unbloat-"))
      fail("Only the core may define --unbloat-* properties.");
    if (
      /#(?:[\da-f]{3,8})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|device-cmyk)\s*\(/i.test(
        value,
      )
    ) {
      fail("Use a core variable instead of a literal color.");
    }
    if (prop === "font-family" || /--.*font-family/.test(prop)) {
      if (
        !/^(?:var\(--(?:unbloat-font-family|font-family-[\w-]+)\)|inherit)$/.test(
          value,
        )
      ) {
        fail("Font families must come from --unbloat-font-family.");
      }
    }
    if (
      prop === "font" &&
      !/^(?:inherit|initial|unset|revert|revert-layer)$/.test(value)
    ) {
      const prefix = value.replace(
        /var\(--(?:unbloat-font-family|font-family-[\w-]+)\)$/,
        "",
      );
      if (
        prefix === value ||
        /[,'"]/.test(prefix) ||
        /[a-z]/i.test(
          prefix
            .replace(/(?:\d*\.)?\d+(?:[a-z]+|%)?/gi, "")
            .replace(
              /\b(?:normal|italic|oblique|small-caps|bold|bolder|lighter)\b/g,
              "",
            ),
        )
      ) {
        fail("Font shorthands must use the core font family.");
      }
    }
    if (
      /^--h[1-6]-font-size$/.test(prop) &&
      !/^var\(--unbloat-heading-size-[1-6]\)$/.test(value)
    ) {
      fail("Heading scales must come from the core.");
    }
    if (
      (prop === "border" || prop === "--border") &&
      !/^(?:none|0|inherit)$/.test(value) &&
      !/var\(--(?:unbloat-border-width|border)\)/.test(value)
    ) {
      fail("Shared border widths must come from the core.");
    }
    if (
      prop === "border-radius" &&
      !/^(?:0(?:rem|px)?|inherit|var\(--unbloat-border-radius\))$/.test(value)
    ) {
      fail("Border radii must come from the core.");
    }
    if (
      colorProperties.test(prop) ||
      prop.startsWith("--") ||
      /gradient\s*\(/i.test(value)
    ) {
      const remaining = value
        .replace(/url\([^)]*\)/gi, "")
        .replace(/var\(--[\w-]+\)/g, "")
        .replace(/-?(?:\d*\.)?\d+(?:[a-z]+|%)?/gi, "");
      for (const word of remaining.match(/[a-z][\w-]*/gi) || []) {
        if (!allowedWords.has(word.toLowerCase()))
          fail("Use core variables for colors and shadows.");
      }
    }
    if (
      /shadow$/.test(prop) &&
      /\d/.test(value.replace(/var\(--[\w-]+\)/g, ""))
    ) {
      fail("Shadow offsets must come from the core.");
    }
    if (known) {
      for (const [, name] of value.matchAll(/var\((--unbloat-[\w-]+)/g)) {
        if (!known.has(name)) fail(`Unknown core variable: ${name}`);
      }
    }
  });
}

async function* files(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile() && /\.(css|scss|html)$/.test(entry.name))
      yield path;
  }
}

/**
 * Check authored adapter styles, including inline declarations in templates.
 * @param {{directory?: URL, core?: string}} [options] Checkout and built core.
 * @returns {Promise<void>}
 */
export async function checkAdapterStyles({ directory = root, core } = {}) {
  for (const source of sources) {
    for await (const file of files(new URL(source, directory))) {
      const relative = file.href.slice(directory.href.length);
      if (generated.has(relative)) continue;
      let content = await readFile(file, "utf8");
      if (relative.endsWith(".html")) {
        content = [
          ...[...content.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
            (match) => match[1],
          ),
          ...[...content.matchAll(/\bstyle="([^"]*)"/gi)].map(
            (match) => `a { ${match[1]} }`,
          ),
        ].join("\n");
        // Dynamic template geometry is not CSS until Hugo renders it.
        content = content.replace(/\{\{[\s\S]*?\}\}/g, "0");
      } else if (relative.endsWith(".scss")) {
        content = sass.compileString(content).css;
      }
      assertAdapterStyle(content, { from: relative, core });
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await checkAdapterStyles();
}
