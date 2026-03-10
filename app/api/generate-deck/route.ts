import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';

type Body = {
  phaseId?: string;
  serviceId?: string;
  projectName?: string;
  darkMode?: boolean;
};

export async function POST(req: Request) {
  const { phaseId, serviceId, projectName, darkMode }: Body = await req.json();

  if (!phaseId || !serviceId) {
    return NextResponse.json(
      { error: 'phaseId and serviceId are required' },
      { status: 400 },
    );
  }

  // The Python script expects: idea|prd|build|qa|close and site|tool|mvp|ai
  const validPhases = new Set(['idea', 'prd', 'build', 'qa', 'close']);
  const validServices = new Set(['site', 'tool', 'mvp', 'ai']);

  if (!validPhases.has(phaseId) || !validServices.has(serviceId)) {
    return NextResponse.json(
      { error: 'Invalid phaseId or serviceId' },
      { status: 400 },
    );
  }

  const id = randomUUID();
  const outputPath = join(tmpdir(), `deck-${phaseId}-${serviceId}-${id}.pdf`);

  try {
    const pdfBuffer = await runPythonAndReadPdf({
      phaseId,
      serviceId,
      projectName,
      darkMode: Boolean(darkMode),
      outputPath,
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${phaseId}-${serviceId}-deck${
          darkMode ? '-dark' : ''
        }.pdf"`,
      },
    });
  } catch (error) {
    // Surface a simple message to the client; log details on the server.
    console.error('Deck generation failed', error);
    return NextResponse.json(
      { error: 'Deck generation failed' },
      { status: 500 },
    );
  } finally {
    // Best-effort cleanup; ignore errors
    unlink(outputPath).catch(() => {});
  }
}

async function runPythonAndReadPdf(options: {
  phaseId: string;
  serviceId: string;
  projectName?: string;
  darkMode: boolean;
  outputPath: string;
}): Promise<Buffer> {
  const { phaseId, serviceId, projectName, darkMode, outputPath } = options;

  // Construct CLI args to match scripts/generate_phase_deck.py
  const args: string[] = [
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
    args.push('--project', projectName);
  }

  if (darkMode) {
    args.push('--dark');
  }

  await runPython(args);

  // Read the generated PDF file into memory
  const data = await readFile(outputPath);
  return Buffer.from(data);
}

function runPython(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      // Ensure working directory is the app root where scripts/ lives
      cwd: process.cwd(),
    });

    const stderrChunks: Buffer[] = [];

    proc.stderr.on('data', chunk => {
      stderrChunks.push(chunk as Buffer);
    });

    proc.on('error', err => {
      reject(err);
    });

    proc.on('close', code => {
      if (code !== 0) {
        const message =
          Buffer.concat(stderrChunks).toString('utf-8') ||
          `Python exited with code ${code ?? 'unknown'}`;
        reject(new Error(message));
        return;
      }
      resolve();
    });
  });
}

