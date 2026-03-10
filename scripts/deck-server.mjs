#!/usr/bin/env node

// Minimal Node server to handle POST /api/generate-deck
// and delegate to the Python PDF generator.

import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { readFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const PORT = process.env.DECK_SERVER_PORT
  ? Number(process.env.DECK_SERVER_PORT)
  : 4000;

const validPhases = new Set(['idea', 'prd', 'build', 'qa', 'close']);
const validServices = new Set(['site', 'tool', 'mvp', 'ai']);

const server = createServer(async (req, res) => {
  // Basic CORS handling for browser calls from Vite dev server
  const setCors = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  };

  if (req.method === 'OPTIONS' && req.url === '/api/generate-deck') {
    setCors();
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-deck') {
    setCors();
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const phaseId = parsed.phaseId;
        const serviceId = parsed.serviceId;
        const projectName = parsed.projectName;
        const darkMode = Boolean(parsed.darkMode);

        if (!phaseId || !serviceId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'phaseId and serviceId are required',
            }),
          );
          return;
        }

        if (!validPhases.has(phaseId) || !validServices.has(serviceId)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Invalid phaseId or serviceId',
            }),
          );
          return;
        }

        const id = randomUUID();
        const outputPath = join(
          tmpdir(),
          `deck-${phaseId}-${serviceId}-${id}.pdf`,
        );

        try {
          await runPythonGenerator({
            phaseId,
            serviceId,
            projectName,
            darkMode,
            outputPath,
          });

          const pdf = await readFile(outputPath);

          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${phaseId}-${serviceId}-deck${
              darkMode ? '-dark' : ''
            }.pdf"`,
          });
          res.end(pdf);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Deck generation failed', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Deck generation failed' }));
        } finally {
          // best-effort cleanup
          unlink(outputPath).catch(() => {});
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Deck server listening on http://localhost:${PORT}`);
});

async function runPythonGenerator({
  phaseId,
  serviceId,
  projectName,
  darkMode,
  outputPath,
}) {
  const args = [
    'scripts/generate_phase_deck.py',
    '--phase',
    phaseId,
    '--service',
    serviceId,
    '--output',
    outputPath,
    '--content',
    'content.json',
  ];

  if (projectName) {
    args.push('--project', String(projectName));
  }
  if (darkMode) {
    args.push('--dark');
  }

  await new Promise((resolve, reject) => {
    const proc = spawn('python3', args, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const stderrChunks = [];

    proc.stderr.on('data', chunk => {
      stderrChunks.push(chunk);
    });

    proc.on('error', err => {
      reject(err);
    });

    proc.on('close', code => {
      if (code !== 0) {
        const message =
          Buffer.concat(stderrChunks).toString('utf8') ||
          `Python exited with code ${code ?? 'unknown'}`;
        reject(new Error(message));
      } else {
        resolve();
      }
    });
  });
}

