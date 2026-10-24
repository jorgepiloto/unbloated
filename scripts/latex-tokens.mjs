// SPDX-License-Identifier: LGPL-3.0-only
/** Translate the built core's CSS custom properties to LuaLaTeX token definitions. */
import postcss from "postcss";
import { createHash } from "node:crypto";
import { validateTokens } from "./build.mjs";

/**
 * Render a TeX package from the canonical :root block in built unbloat.css.
 * Map rem to the book's base point size and px to 0.75 big points (1/96 inch).
 * Browser font families must end in monospace; the class maps that to a TeX font.
 * Reject duplicate, incomplete, or unsafe tokens before emitting executable TeX.
 * @param {string} css Built core stylesheet, not an arbitrary CSS theme.
 * @returns {string} Generated unbloated-tokens.sty, requiring no Node at runtime.
 * @throws {Error} On invalid CSS, missing or duplicate tokens, or unsupported values.
 */
export function renderLatexTokens(css) {
  const tokens = {};
  const roots = postcss
    .parse(css)
    .nodes.filter((node) => node.selector === ":root");
  if (roots.length !== 1)
    throw new Error("LaTeX needs one core :root token block.");
  for (const node of roots[0].nodes) {
    if (node.type === "comment") continue;
    const match =
      /^--unbloat-(color|font|line-height|heading|space|border|shadow|focus)-([a-z0-9-]+)$/.exec(
        node.prop || "",
      );
    if (!match || node.important)
      throw new Error("Unsupported core CSS token declaration.");
    const [, group, name] = match;
    tokens[group] ??= {};
    if (Object.hasOwn(tokens[group], name))
      throw new Error(`Duplicate core token: ${node.prop}`);
    tokens[group][name] = node.value;
  }
  validateTokens(tokens);
  for (const [group, names] of Object.entries({
    color: [
      "text",
      "surface",
      "surface-muted",
      "muted",
      "border",
      "inverse-text",
      "inverse-surface",
    ],
    font: ["family", "size"],
    "line-height": ["body", "heading"],
    heading: ["size-1", "size-2", "size-3", "size-4", "size-5", "size-6"],
    space: ["1", "2", "3", "4", "5"],
    border: ["width", "radius"],
  })) {
    for (const name of names)
      if (!Object.hasOwn(tokens[group], name))
        throw new Error(`Missing LaTeX core token: ${group}.${name}`);
  }
  function dimension(value) {
    if (value === "0") return "0pt";
    const [, amount, unit] = /^(\d+(?:\.\d+)?)(rem|px)$/.exec(value);
    return unit === "rem"
      ? `${amount}\\UnbloatedRootSize`
      : `${Number(amount) * 0.75}bp`;
  }
  const definitions = [];
  for (const [group, values] of Object.entries(tokens)) {
    for (const [name, value] of Object.entries(values)) {
      const key = `${group}-${name}`;
      if (group === "color")
        definitions.push(
          `\\definecolor{unbloat-${key}}{HTML}{${value.slice(1)}}`,
        );
      else if (group === "font" && name === "family") continue;
      else
        definitions.push(
          `\\expandafter\\def\\csname unbloat@${key}\\endcsname{${group === "line-height" ? value : dimension(value)}}`,
        );
    }
  }
  return `% SPDX-License-Identifier: LGPL-3.0-only
% Generated from bundled unbloat.css by scripts/latex-tokens.mjs; do not edit.
\\NeedsTeXFormat{LaTeX2e}[2022-06-01]
\\ProvidesPackage{unbloated-tokens}[Shared Unbloated CSS tokens]
\\RequirePackage{xcolor}
\\newcommand{\\UnbloatedCoreHash}{${createHash("sha256").update(css).digest("hex")}}
\\newlength{\\UnbloatedRootSize}
\\setlength{\\UnbloatedRootSize}{\\f@size pt}
\\newcommand{\\UnbloatedToken}[1]{\\csname unbloat@#1\\endcsname}
${definitions.join("\n")}
\\endinput
`;
}
