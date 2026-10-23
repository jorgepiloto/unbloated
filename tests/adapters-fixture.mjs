// SPDX-License-Identifier: LGPL-3.0-only
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { render } from "../scripts/build.mjs";

export async function fixture(t) {
  const path = await mkdtemp(join(tmpdir(), "unbloated-adapters-"));
  t.after(() => rm(path, { recursive: true, force: true }));
  const directory = pathToFileURL(`${path}/`);
  for (const name of [
    "dist/",
    "packages/sphinx/src/",
    "packages/quarto/_extensions/",
    "packages/hugo/assets/",
    "packages/hugo/layouts/",
  ]) {
    await mkdir(new URL(name, directory), { recursive: true });
  }
  for (const [name, content] of Object.entries({
    "package.json": JSON.stringify({ name: "unbloated", version: "0.1.0" }),
    "dist/unbloat.css": (await render()).get("tokens.css"),
    LICENSE: "Test license\n",
    COPYING: "Test terms\n",
    NOTICE: "Test attribution\n",
  }))
    await writeFile(new URL(name, directory), content);
  return directory;
}
