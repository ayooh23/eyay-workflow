/**
 * Export EYAY content data to JSON for use by the Python PDF generator.
 * Uses esbuild to bundle the TypeScript data files.
 *
 * Usage: node scripts/export-content.mjs
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Write a temporary entry file that exports everything we need as JSON
const entryContent = `
import { CONTENT } from './src/data/prompts.ts';
import { GATES } from './src/data/gates.ts';
import { PHASES } from './src/data/phases.ts';
import { SERVICES } from './src/data/services.ts';

const output = JSON.stringify({ CONTENT, GATES, PHASES, SERVICES }, null, 2);
process.stdout.write(output);
`;

const tmpEntry = join(root, '_export_entry.ts');
writeFileSync(tmpEntry, entryContent);

try {
  // Bundle with esbuild and run with node
  const esbuild = join(root, 'node_modules/.bin/esbuild');
  const bundled = execSync(
    `${esbuild} ${tmpEntry} --bundle --platform=node --format=esm --log-level=error`,
    { cwd: root }
  );

  // Write bundled code to temp file and run it
  const tmpBundle = join(root, '_export_bundle.mjs');
  writeFileSync(tmpBundle, bundled);

  const result = execSync(`node ${tmpBundle}`, { cwd: root });

  // Write output JSON
  writeFileSync(join(root, 'content.json'), result);
  console.log('✓ Exported content.json');

  // Cleanup
  unlinkSync(tmpBundle);
} finally {
  unlinkSync(tmpEntry);
}
