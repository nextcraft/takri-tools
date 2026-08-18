import { mkdirSync, cpSync, existsSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const agentRoot = join(packageRoot, 'agent');

function copySkill(name, destBase) {
  const from = join(agentRoot, 'skills', name);
  const to = join(destBase, name);
  if (!existsSync(from)) {
    return { copied: false, to, reason: 'skill source missing' };
  }
  mkdirSync(destBase, { recursive: true });
  cpSync(from, to, { recursive: true });
  return { copied: true, to };
}

export function runInit(cwd = process.cwd()) {
  const results = [];
  const skillsDir = join(agentRoot, 'skills');
  const skillNames = existsSync(skillsDir)
    ? readdirSync(skillsDir).filter((name) => !name.startsWith('.'))
    : [];

  if (skillNames.length === 0) {
    return {
      ok: false,
      message: 'No skills found in package agent/. Reinstall @nextcraft/takri.',
      results,
    };
  }

  for (const name of skillNames) {
    results.push({ target: '.cursor/skills', ...copySkill(name, join(cwd, '.cursor', 'skills')) });
    results.push({ target: '.claude/skills', ...copySkill(name, join(cwd, '.claude', 'skills')) });
  }

  const agentsSnippetPath = join(agentRoot, 'AGENTS.md');
  if (existsSync(agentsSnippetPath)) {
    const destAgents = join(cwd, 'AGENTS-takri.md');
    const header = '<!-- Copied by takri init. Do not overwrite an existing AGENTS.md; paste this in if needed. -->\n\n';
    writeFileSync(destAgents, header + readFileSync(agentsSnippetPath, 'utf8'));
    results.push({ copied: true, to: destAgents, target: 'AGENTS-takri.md' });
  }

  return {
    ok: true,
    message:
      'Installed Takri agent skills. If you already have AGENTS.md, paste AGENTS-takri.md into it — this command does not overwrite AGENTS.md.',
    results,
  };
}
