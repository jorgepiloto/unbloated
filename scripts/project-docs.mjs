// SPDX-License-Identifier: LGPL-3.0-only
/** Build independently deployable documentation at each project's version prefix. */
import { execFile as callback } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { root } from "./build.mjs";
import { prepareAdapters } from "./adapters.mjs";
import { prepareDocs, runDocs } from "./docs.mjs";

const execFile = promisify(callback);
export const documentationProjects = JSON.parse(
  await readFile(new URL("docs/projects.json", root), "utf8"),
);

/**
 * Resolve an allowlisted project and dev/stable channel (or core release version).
 * Paths are confined to .cache/project-docs; no caller-supplied directory is deleted.
 * @param {string} project Identifier from docs/projects.json.
 * @param {string} channel dev, stable, or a numeric core release version.
 * @returns {{project: string, channel: string, baseURL: string, directory: URL, configuration: object}}
 * @throws {Error} For unknown projects or invalid channels.
 */
export function projectDocumentation(project, channel) {
  if (!Object.hasOwn(documentationProjects, project))
    throw new Error(`Unknown documentation project: ${project}`);
  if (
    !["dev", "stable"].includes(channel) &&
    !(project === "unbloated" && /^\d+\.\d+\.\d+$/.test(channel))
  )
    throw new Error(`Invalid documentation channel: ${channel}`);
  return {
    project,
    channel,
    baseURL: `https://jorgemartinez.space/projects/${project}/version/${channel}/`,
    directory: new URL(`.cache/project-docs/${project}/${channel}/`, root),
    configuration: documentationProjects[project],
  };
}

async function projectVersion(project) {
  if (project === "sphinx-unbloated-theme") {
    return /__version__ = "([^"]+)"/.exec(
      await readFile(
        new URL("packages/sphinx/src/sphinx_unbloated_theme/__init__.py", root),
        "utf8",
      ),
    )[1];
  }
  if (project === "quarto-unbloated-theme") {
    return /^version: (.+)$/m.exec(
      await readFile(
        new URL("packages/quarto/_extensions/unbloated/_extension.yml", root),
        "utf8",
      ),
    )[1];
  }
  if (project === "unbloated-book") {
    return /\\ProvidesClass[^\n]+ v([^ ]+)/.exec(
      await readFile(
        new URL("packages/latex/unbloated-book.cls", root),
        "utf8",
      ),
    )[1];
  }
  return JSON.parse(
    await readFile(
      new URL(
        project === "unbloated" ? "package.json" : "packages/hugo/package.json",
        root,
      ),
    ),
  ).version;
}

async function buildGuide(target, version) {
  const source = new URL(
    `.cache/project-docs-source/${target.project}/${target.channel}/`,
    root,
  );
  await rm(source, { recursive: true, force: true });
  for (const directory of ["assets/", "content/", "data/"])
    await mkdir(new URL(directory, source), { recursive: true });
  for (const directory of ["layouts", "static"])
    await cp(new URL(`docs/${directory}`, root), new URL(directory, source), {
      recursive: true,
    });
  await cp(
    new URL("docs/project/layouts/", root),
    new URL("layouts/", source),
    { recursive: true },
  );
  for (const name of ["site.css", "tabs.js"])
    await cp(
      new URL(`docs/assets/${name}`, root),
      new URL(`assets/${name}`, source),
    );
  await cp(
    new URL("dist/unbloat.css", root),
    new URL("assets/unbloat.css", source),
  );
  await cp(
    new URL("docs/data/social.json", root),
    new URL("data/social.json", source),
  );
  await writeFile(
    new URL("data/navigation.json", source),
    JSON.stringify([{ title: "Guide", page: "/" }]),
  );
  await writeFile(
    new URL("data/package.json", source),
    JSON.stringify({ version }),
  );
  const { configuration } = target;
  const guide = await readFile(
    new URL(`${configuration.directory}/README.md`, root),
    "utf8",
  );
  await writeFile(
    new URL("content/_index.md", source),
    `---\ntitle: ${JSON.stringify(configuration.title)}\n---\n${guide.replace(/^# [^\n]+\n/, "").replace(/\{\{([<%])([\s\S]*?)([>%])\}\}/g, "{{$1/*$2*/$3}}")}`,
  );
  await writeFile(
    new URL("hugo.json", source),
    JSON.stringify({
      baseURL: target.baseURL,
      title: configuration.title,
      locale: "en-US",
      publishDir: fileURLToPath(target.directory),
      disableKinds: ["taxonomy", "term", "RSS", "sitemap"],
      outputs: { home: ["HTML"] },
      params: {
        description: configuration.description,
        sourceDirectory: configuration.directory,
        sourceRef: process.env.DOCS_SOURCE_REF || "main",
      },
      markup: { highlight: { codeFences: false } },
    }),
  );
  const code = await runDocs("build", [
    "--source",
    fileURLToPath(source),
    "--destination",
    fileURLToPath(target.directory),
  ]);
  if (code) throw new Error(`Documentation build failed: ${target.project}`);
}

/**
 * Build one project's exact publishable artifact, including its identity and URL.
 * Sphinx uses its existing native docs, notebook execution, and PDF exports.
 * Other adapters render their canonical package guide with the existing docs shell.
 * PYTHON selects Sphinx's environment; Quarto/TeX are required by its PDF exports.
 * @param {string} project Identifier from docs/projects.json.
 * @param {string} channel dev, stable, or a numeric core release version.
 * @returns {Promise<object>} Project, channel, URL, version, and generated directory.
 * @throws {Error} On invalid inputs, failed generators, or filesystem errors.
 */
export async function buildProjectDocumentation(project, channel) {
  const target = projectDocumentation(project, channel);
  await prepareDocs();
  await prepareAdapters();
  await rm(target.directory, { recursive: true, force: true });
  await mkdir(target.directory, { recursive: true });
  const version = await projectVersion(project);
  if (target.configuration.builder === "core") {
    if (
      await runDocs("build", [
        "--baseURL",
        target.baseURL,
        "--destination",
        fileURLToPath(target.directory),
      ])
    )
      throw new Error("Core documentation build failed.");
  } else if (target.configuration.builder === "sphinx") {
    const { stdout, stderr } = await execFile(
      process.env.PYTHON || "python3",
      [
        "-m",
        "sphinx",
        "-b",
        "html",
        "-W",
        "--keep-going",
        "-d",
        fileURLToPath(
          new URL(`.cache/project-doctrees/${project}/${channel}/`, root),
        ),
        "doc/source",
        fileURLToPath(target.directory),
      ],
      {
        cwd: new URL("packages/sphinx/", root),
        env: { ...process.env, DOCUMENTATION_BASE_URL: target.baseURL },
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    process.stdout.write(stdout);
    process.stderr.write(stderr);
  } else await buildGuide(target, version);
  const manifest = {
    project,
    channel,
    baseURL: target.baseURL,
    prefix: new URL(target.baseURL).pathname,
    version,
  };
  await writeFile(
    new URL("documentation.json", target.directory),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return { ...manifest, directory: target.directory };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4)
    throw new Error(
      "Usage: node scripts/project-docs.mjs <project> <dev|stable|core-version>",
    );
  await buildProjectDocumentation(process.argv[2], process.argv[3]);
}
