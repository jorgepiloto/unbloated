// SPDX-License-Identifier: LGPL-3.0-only
import { execFile as callback } from "node:child_process";
import { chmod, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(callback);
export const checkout = fileURLToPath(new URL("../", import.meta.url));
export const hugo =
  process.env.HUGO_BIN ||
  (existsSync(join(checkout, ".cache/hugo/hugo"))
    ? join(checkout, ".cache/hugo/hugo")
    : "hugo");

/** Build a real prefixed Hugo consumer with literal text, flags, and shortcodes. */
export async function buildHugo(
  directory,
  binary = hugo,
  { multilingual = false } = {},
) {
  await cp(
    join(checkout, "packages/hugo"),
    join(directory, "themes/unbloated"),
    { recursive: true },
  );
  await mkdir(join(directory, "content/posts"), { recursive: true });
  await writeFile(
    join(directory, "themes/unbloated/assets/css/unbloat.css"),
    await readFile(join(checkout, "dist/unbloat.css")),
  );
  const { stdout: version } = await execFile(binary, ["version"]);
  const modernLocale = Number(/v0\.(\d+)/.exec(version)[1]) >= 158;
  const localeKey = modernLocale ? "locale" : "languageCode";
  await writeFile(
    join(directory, "hugo.toml"),
    `baseURL = 'https://example.org/prefix/'
title = 'Tools & <Interfaces>'
${localeKey} = 'fr-FR'
defaultContentLanguage = 'fr'
theme = 'unbloated'
[security.funcs]
getenv = ['^HUGO_', '^CI$', '^VERSION$']
[params]
lastposts = 20
description = 'Fixture'
[outputs]
home = ['HTML', 'RSS', 'JSON']
[[menus.main]]
name = 'Accueil'
pageRef = '/'
[[menus.main]]
name = 'Articles'
pageRef = '/posts'
[[menus.main]]
name = 'À propos'
pageRef = '/about'
${
  multilingual
    ? `
[languages.fr]
${localeKey} = 'fr-FR'
[languages.en]
${localeKey} = 'en-US'
[languages.ar]
${localeKey} = 'ar-EG'
${modernLocale ? "direction" : "languageDirection"} = 'rtl'
`
    : ""
}
`,
  );
  for (const [name, content] of Object.entries({
    "_index.md": "---\ntitle: Home\n---\nWelcome.",
    "about.md": "---\ntitle: About\n---\nAbout this site.",
    "search.md": "---\ntitle: Search\nlayout: search\n---\n",
    "posts/_index.md": "---\ntitle: Posts\nlayout: posts\n---\n",
    "tags/topic/_index.md": "---\ntitle: topic\nlayout: tags\n---\n",
    "categories/topic/_index.md":
      "---\ntitle: topic\nlayout: categories\n---\n",
    "posts/current.md": `---
title: 'Vector<T> & Buffer "$&"'
date: 2026-01-01
tags: [topic]
categories: [topic]
---
[Prose link](/about/)

| Identifier | Value |
| --- | --- |
| ${"Identifier".repeat(100)} | Result |

[After table](#after-table)

### After table

All content after the wide table remains reachable.

{{< card_plant name="Fern" type="Perennial" growth_habit="Upright" watering="Weekly" humidity="High" light="Indirect" soil="Rich" temperature="20°C" birthday="2020" >}}
{{< card_plant name="Moss" type="Perennial" growth_habit="Low" watering="Weekly" humidity="High" light="Indirect" soil="Rich" temperature="20°C" birthday="2021" >}}
{{< plotly json="/prefix/plot.json?a=1&b=2" >}}
{{< plotly json="/prefix/plot.json?a=1&b=2" >}}
`,
    "posts/old.md":
      "---\ntitle: Historic\ndate: 2022-01-01\ntags: [topic]\ncategories: [topic]\n---\nHistoric content.",
    "posts/private.md":
      "---\ntitle: PrivateMarker\nprivate: true\ndate: 2026-01-01\ntags: [topic]\ncategories: [topic]\n---\nPublicly built, undiscoverable.",
    "posts/noindex.md":
      "---\ntitle: NoindexMarker\nnoindex: true\ndate: 2026-01-01\ntags: [topic]\ncategories: [topic]\n---\nPublicly built, undiscoverable.",
  })) {
    const file = join(directory, "content", name);
    await mkdir(join(file, ".."), { recursive: true });
    await writeFile(file, content);
  }
  if (multilingual) {
    for (const [name, flags] of Object.entries({
      "public.fr.md": "",
      "public.en.md": "",
      "private.fr.md": "private: true",
      "private.en.md": "",
      "noindex.fr.md": "noindex: true",
      "noindex.en.md": "",
      "direction.ar.md": "",
    })) {
      await writeFile(
        join(directory, "content", name),
        `---\ntitle: Translation\n${flags}\n---\nTranslated content.\n`,
      );
    }
  }
  // This consumer uses PostCSS's pinned parser without plugins. Hugo calls its
  // CLI over stdin; keeping the runner here avoids another package dependency.
  const bin = join(directory, "bin");
  await mkdir(bin);
  for (const dependency of [
    "postcss",
    "nanoid",
    "picocolors",
    "source-map-js",
  ]) {
    await cp(
      join(checkout, "node_modules", dependency),
      join(directory, "node_modules", dependency),
      { recursive: true },
    );
  }
  await writeFile(join(directory, "package.json"), '{"type":"module"}');
  await writeFile(
    join(bin, "postcss"),
    `#!/usr/bin/env node
import postcss from "postcss";
let css = "";
for await (const chunk of process.stdin) css += chunk;
const result = await postcss([]).process(css, { from: undefined, map: false });
process.stdout.write(result.css);
`,
  );
  await chmod(join(bin, "postcss"), 0o755);
  await mkdir(join(directory, "node_modules/.bin"), { recursive: true });
  await cp(join(bin, "postcss"), join(directory, "node_modules/.bin/postcss"));
  const result = await execFile(
    binary,
    [
      "--source",
      directory,
      "--destination",
      join(directory, "public"),
      "--panicOnWarning",
    ],
    {
      cwd: directory,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
    },
  );
  return { output: join(directory, "public"), ...result };
}
