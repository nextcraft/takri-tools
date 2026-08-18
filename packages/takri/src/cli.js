#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { fromDevanagari, fromRoman, decode, lint, pack } from './index.js';
import { runInit } from './init.js';
import { runMcp } from './mcp.js';

const USAGE = {
  ok: true,
  command: 'help',
  usage: [
    'takri from-deva [text|-]',
    'takri from-roman [text|-]',
    'takri decode [text|-]',
    'takri lint [file|-]',
    'takri pack --kind <kind> --lang <lang> [--deva text] [--roman text] [--english text]',
    'takri init',
    'takri mcp',
  ],
  kinds: ['caption', 'proverb-card', 'readme-heading', 'generic'],
  langs: ['dogri', 'kangri', 'pahari', 'hi', 'und'],
};

function parseFlags(argv) {
  const flags = {};
  const rest = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      flags[key] = value;
    } else {
      rest.push(arg);
    }
  }
  return { flags, rest };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8').replace(/\n$/, '');
}

async function getText(arg) {
  if (!arg || arg === '-') {
    return readStdin();
  }
  return arg;
}

function emit(data, asText, textLines) {
  if (asText) {
    process.stdout.write(`${textLines.join('\n')}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function convertLines(result) {
  return [
    `devanagari: ${result.devanagari}`,
    `takri: ${result.takri}`,
    `roman: ${result.roman}`,
    ...(result.warnings?.length ? [`warnings: ${result.warnings.join('; ')}`] : []),
  ];
}

async function main() {
  const argv = process.argv.slice(2);
  const { flags, rest } = parseFlags(argv);
  const asText = Boolean(flags.text);

  if (rest.length === 0 || rest[0] === 'help' || flags.help || flags.h) {
    emit(USAGE, asText, USAGE.usage);
    process.exit(0);
  }

  const command = rest[0];

  try {
    if (command === 'mcp') {
      await runMcp();
      return;
    }

    if (command === 'init') {
      const result = runInit(process.cwd());
      emit(result, asText, [result.message]);
      process.exit(result.ok ? 0 : 1);
    }

    if (command === 'from-deva') {
      const text = await getText(rest[1]);
      const result = { ok: true, command, ...fromDevanagari(text) };
      emit(result, asText, convertLines(result));
      return;
    }

    if (command === 'from-roman') {
      const text = await getText(rest[1]);
      const result = { ok: true, command, ...fromRoman(text) };
      emit(result, asText, convertLines(result));
      return;
    }

    if (command === 'decode') {
      const text = await getText(rest[1]);
      const result = { ok: true, command, ...decode(text) };
      emit(result, asText, convertLines(result));
      return;
    }

    if (command === 'lint') {
      const target = rest[1];
      let text;
      if (!target || target === '-') {
        text = await readStdin();
      } else {
        text = readFileSync(target, 'utf8');
      }
      const result = lint(text);
      emit(result, asText, result.ok ? ['ok'] : result.issues.map((i) => `${i.code}: ${i.message}`));
      process.exit(result.ok ? 0 : 1);
    }

    if (command === 'pack') {
      const result = pack({
        kind: flags.kind,
        language: flags.lang,
        devanagari: flags.deva,
        roman: flags.roman,
        english: flags.english,
      });
      emit(result, asText, [
        result.takri,
        result.devanagari,
        result.roman,
        result.english,
      ].filter(Boolean));
      return;
    }

    emit({ ok: false, error: `Unknown command: ${command}`, ...USAGE }, asText, [`Unknown command: ${command}`]);
    process.exit(1);
  } catch (error) {
    emit({ ok: false, error: error.message }, asText, [error.message]);
    process.exit(1);
  }
}

await main();
