---
name: takri-verify
description: Lints Unicode Takri and round-trips it to Devanagari/Roman. Use when a file already contains Takri, when checking agent output, or when the user asks to verify, lint, or decode Takri.
---

# Takri verify

## Rules

- Do not accept Takri that was typed by a model from memory.
- Run `lint` on the Takri string or file.
- Run `decode` and compare the Devanagari to the author’s intended meaning.

## Commands

```bash
npx @nextcraft/takri lint path/to/file.txt
npx @nextcraft/takri decode "𑚝𑚢𑚨𑚶𑚙𑚲"
```

MCP tools: `lint`, `decode`.

Report `ok`, each issue `code`/`message`, and the decoded Devanagari.
