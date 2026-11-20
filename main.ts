// Leonida Platinum — entrypoint for gta6-trophy-guide-01.
// Own code, written for this entry. Copies app/ and screenshots/ from this
// repository into the output directory and writes /output/dossier.json with
// buildDossier from vendor/makefun-frontend.ts. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output. Deterministic: the same input
// writes the same bytes on every run.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || "/output";

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const names = readdirSync(src).sort();
  for (const name of names) {
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else cpSync(from, to);
  }
}

function main(): void {
  const appDir = join(REPO_ROOT, "app");
  const shotsDir = join(REPO_ROOT, "screenshots");
  if (!existsSync(appDir)) throw new Error(`app/ not found under ${REPO_ROOT}`);
  if (!existsSync(shotsDir)) throw new Error(`screenshots/ not found under ${REPO_ROOT}`);

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(appDir, join(OUTPUT_DIR, "app"));
  copyTree(shotsDir, join(OUTPUT_DIR, "screenshots"));

  const dossier = buildDossier(OUTPUT_DIR, CAPS);
  writeFileSync(join(OUTPUT_DIR, "dossier.json"), dossier);
  const appEntries = readdirSync(join(OUTPUT_DIR, "app")).length;
  const shotEntries = readdirSync(join(OUTPUT_DIR, "screenshots")).length;
  console.log(`wrote ${OUTPUT_DIR}/dossier.json (${dossier.length} bytes) from ${appEntries} app entries and ${shotEntries} screenshots`);
}

main();
