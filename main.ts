// Leonida Platinum — entrypoint for gta6-trophy-guide-01.
//
// This program hands the guide in: it copies the guide's app/ folder and its
// screenshots/ folder from beside this file into the output directory, then
// writes the dossier.json the judge reads, using the vendored make.fun
// library. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output directory is left alone as a directory: only what sits inside
// it is cleared first. In the grader /output is a mounted volume, and asking
// the filesystem to remove the mount point itself fails, so the program
// empties the folder instead of deleting it. The same input always writes
// the same bytes, so two runs come out identical.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the gate rejects.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

// Copy a folder and everything under it, one entry at a time, in sorted
// order so the copy is deterministic.
function copyFolder(fromDir, toDir) {
  mkdirSync(toDir, { recursive: true });
  for (const name of readdirSync(fromDir).sort()) {
    const source = join(fromDir, name);
    const target = join(toDir, name);
    if (statSync(source).isDirectory()) copyFolder(source, target);
    else cpSync(source, target);
  }
}

// Empty a directory without removing the directory itself, so a mounted
// output folder stays put while its old contents go away.
function emptyFolder(folder) {
  mkdirSync(folder, { recursive: true });
  for (const name of readdirSync(folder)) {
    rmSync(join(folder, name), { recursive: true, force: true });
  }
}

function run() {
  const appFolder = join(repoDir, "app");
  const shotsFolder = join(repoDir, "screenshots");
  if (!existsSync(appFolder)) {
    throw new Error(`app/ not found under ${repoDir}`);
  }
  if (!existsSync(shotsFolder)) {
    throw new Error(`screenshots/ not found under ${repoDir}`);
  }

  emptyFolder(outDir);
  copyFolder(appFolder, join(outDir, "app"));
  copyFolder(shotsFolder, join(outDir, "screenshots"));

  const dossier = buildDossier(outDir, caps);
  const dossierPath = join(outDir, "dossier.json");
  writeFileSync(dossierPath, dossier);
  if (statSync(dossierPath).size !== dossier.length) {
    throw new Error(`dossier.json did not land whole under ${outDir}`);
  }
  const appCount = readdirSync(join(outDir, "app")).length;
  const shotCount = readdirSync(join(outDir, "screenshots")).length;
  console.log(
    `wrote ${outDir}/dossier.json (${dossier.length} bytes) from ${appCount} app entries and ${shotCount} screenshots`,
  );
}

run();
