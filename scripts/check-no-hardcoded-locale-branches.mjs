#!/usr/bin/env node
/**
 * Fails if any file outside src/i18n/ branches on a literal locale code
 * (e.g. `locale === 'de'`). This is the exact bug pattern from adding
 * French: six files each had their own `locale === 'de' ? ... : locale
 * === 'en' ? ... : ...` chain (date formats, og:locale, the language-
 * switcher flag emoji), every one of them silently missing the new
 * locale until someone went and found each one by hand.
 *
 * The fix each time was the same: move the per-locale values into a
 * Record<Locale, X> lookup table in src/i18n/translations.ts (so
 * TypeScript's exhaustiveness checking catches a missing locale at
 * compile time) and have the call site index into it instead of
 * branching. src/i18n/ itself is exempt since that's where those lookup
 * tables legitimately live.
 *
 * Comparisons against `defaultLocale` (e.g. `locale === defaultLocale`)
 * are fine and intentionally not flagged — those aren't an enumeration
 * of every locale, they're a single locale-agnostic check that already
 * generalizes to a new locale for free.
 *
 * Usage: node scripts/check-no-hardcoded-locale-branches.mjs
 * Exit code 1 if any match, 0 if clean.
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Literal locale codes currently in use. Update this when adding a locale
// (astro.config.mjs's i18n.locales is the source of truth) — this list
// only needs to name the codes so the regex can find them; it's not
// itself a place new-locale support could be "forgotten" the way a
// ternary chain is, because forgetting to update it just makes the check
// less strict, not silently wrong at runtime.
const LOCALE_CODES = ['it', 'en', 'de', 'fr'];

const localeBranchPattern = new RegExp(
  `\\blocale\\s*===?\\s*['"](${LOCALE_CODES.join('|')})['"]`
);

function listTrackedSourceFiles() {
  const out = execFileSync(
    'git',
    ['ls-files', '--', '*.astro', '*.ts', '*.tsx'],
    { cwd: ROOT, encoding: 'utf-8' }
  );
  return out
    .split('\n')
    .filter(Boolean)
    .filter((f) => !f.startsWith('src/i18n/'))
    .filter((f) => !f.endsWith('.test.ts'));
}

function main() {
  const files = listTrackedSourceFiles();
  const problems = [];

  for (const relPath of files) {
    const content = readFileSync(path.join(ROOT, relPath), 'utf-8');
    content.split('\n').forEach((line, i) => {
      if (localeBranchPattern.test(line)) {
        problems.push(`${relPath}:${i + 1}: ${line.trim()}`);
      }
    });
  }

  if (problems.length > 0) {
    console.error(`Hardcoded locale branch check failed — ${problems.length} match(es):\n`);
    problems.forEach((p) => console.error(`  ${p}`));
    console.error(
      `\nMove per-locale values into a Record<Locale, X> lookup table in ` +
      `src/i18n/translations.ts and index into it instead — see localeTags/ ` +
      `localeFlags/ogLocaleTags for the existing pattern.`
    );
    process.exit(1);
  }

  console.log(`Hardcoded locale branch check passed — ${files.length} files scanned.`);
}

main();
