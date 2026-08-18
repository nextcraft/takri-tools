import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fromDevanagari, fromRoman, decode, lint, pack } from './index.js';

function json(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

export async function runMcp() {
  const server = new McpServer({
    name: '@nextcraft/takri',
    version: '1.0.0',
  });

  server.registerTool(
    'from_deva',
    {
      description: 'Convert Devanagari text to Unicode Takri. Never invent Takri glyphs.',
      inputSchema: { text: z.string().describe('Devanagari source text') },
    },
    async ({ text }) => json({ ok: true, command: 'from-deva', ...fromDevanagari(text) }),
  );

  server.registerTool(
    'from_roman',
    {
      description: 'Convert RomanReadable romanization to Devanagari and Unicode Takri.',
      inputSchema: { text: z.string().describe('Roman (RomanReadable) source text') },
    },
    async ({ text }) => json({ ok: true, command: 'from-roman', ...fromRoman(text) }),
  );

  server.registerTool(
    'decode',
    {
      description: 'Round-trip Takri to Devanagari and Roman for proofreading.',
      inputSchema: { text: z.string().describe('Takri text') },
    },
    async ({ text }) => json({ ok: true, command: 'decode', ...decode(text) }),
  );

  server.registerTool(
    'lint',
    {
      description: 'Check that text contains real Takri code points (U+11680–U+116CF).',
      inputSchema: { text: z.string().describe('Text to lint') },
    },
    async ({ text }) => json(lint(text)),
  );

  server.registerTool(
    'pack',
    {
      description: 'Build a Takri content pack JSON document from Devanagari or Roman.',
      inputSchema: {
        kind: z.enum(['caption', 'proverb-card', 'readme-heading', 'generic']).optional(),
        language: z.enum(['dogri', 'kangri', 'pahari', 'hi', 'und']).optional(),
        devanagari: z.string().optional(),
        roman: z.string().optional(),
        english: z.string().optional(),
      },
    },
    async (args) => json(pack(args)),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
