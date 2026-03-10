// Export the CONTENT object from the React app to JSON for the PDF generator.
// Works in a `"type": "module"` project by compiling the TypeScript source on the fly.

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_DIR = path.join(__dirname, '..', '.tmp-content');
const OUTPUT_PATH = path.join(__dirname, '..', 'content.json');

async function main() {
  // Clean temp dir
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  // Compile the TypeScript data file to JavaScript using the local TypeScript compiler
  execSync(
    'npx tsc src/data/prompts.ts --module esnext --target es2019 --outDir .tmp-content',
    { stdio: 'inherit', cwd: path.join(__dirname, '..') },
  );

  const compiledPath = path.join(TMP_DIR, 'data', 'prompts.js');
  const moduleUrl = pathToFileURL(compiledPath).href;

  const { CONTENT } = await import(moduleUrl);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ CONTENT }, null, 2), 'utf8');
  console.log(`Wrote content to ${OUTPUT_PATH}`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((err) => {
  console.error(err);
  process.exit(1);
});




