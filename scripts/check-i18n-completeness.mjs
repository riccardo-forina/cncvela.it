#!/usr/bin/env node
/**
 * Checks every localized text leaf in src/data/*.json has all four
 * locales (it/en/de/fr) present with non-empty values.
 *
 * Why this exists and not just TypeScript: src/i18n/translations.ts is a
 * typed Record<Locale, string> everywhere, so a missing locale there is
 * already a compile error (astro check / tsc catches it). The JSON content
 * files have no such schema — nothing stops an editor (human or CMS) from
 * adding "it"/"en"/"de" to a new entry and forgetting "fr", and it would
 * silently fall back to Italian at runtime instead of failing anything.
 * This script is that missing schema check, run separately from the type
 * checker because JSON files aren't part of the TS program.
 *
 * A "localized leaf" is detected structurally: any object with a string
 * (or string[]) "it" property is assumed to be a locale map and is checked
 * for en/de/fr siblings of the same shape. This matches every localized
 * leaf shape actually used in src/data today (including the string[]
 * "includes" arrays in courses.json).
 *
 * Usage: node scripts/check-i18n-completeness.mjs
 * Exit code 1 if anything is missing, 0 if clean.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const LOCALES = ['it', 'en', 'de', 'fr'];

function isLocaleLeaf(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const it = value.it;
  return typeof it === 'string' || (Array.isArray(it) && it.every((v) => typeof v === 'string'));
}

function isEmptyValue(v) {
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return v == null;
}

function walk(value, jsonPath, problems) {
  if (typeof value !== 'object' || value === null) return;

  if (isLocaleLeaf(value)) {
    for (const locale of LOCALES) {
      if (!(locale in value)) {
        problems.push(`${jsonPath}: missing "${locale}"`);
      } else if (isEmptyValue(value[locale])) {
        problems.push(`${jsonPath}: "${locale}" is empty`);
      }
    }
    // A locale leaf's own keys are the locale codes — don't recurse into
    // e.g. .en as if it were a nested object (it's just a string/array).
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => walk(item, `${jsonPath}[${i}]`, problems));
  } else {
    for (const [key, child] of Object.entries(value)) {
      walk(child, jsonPath ? `${jsonPath}.${key}` : key, problems);
    }
  }
}

function main() {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const problems = [];

  for (const file of files) {
    const fullPath = path.join(DATA_DIR, file);
    let data;
    try {
      data = JSON.parse(readFileSync(fullPath, 'utf-8'));
    } catch (err) {
      problems.push(`${file}: invalid JSON (${err.message})`);
      continue;
    }
    const fileProblems = [];
    walk(data, '', fileProblems);
    fileProblems.forEach((p) => problems.push(`src/data/${file}${p.startsWith('[') ? '' : '.'}${p}`));
  }

  if (problems.length > 0) {
    console.error(`i18n completeness check failed — ${problems.length} issue(s):\n`);
    problems.forEach((p) => console.error(`  ${p}`));
    console.error(`\nEvery locale-keyed entry in src/data/*.json must have it/en/de/fr all present and non-empty.`);
    process.exit(1);
  }

  console.log(`i18n completeness check passed — ${files.length} files, all locale leaves complete.`);
}

main();
