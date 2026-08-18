---
name: takri-content
description: Converts Hindi/Devanagari or Roman into Unicode Takri for Pahari content (Dogri, Kangri, posters, captions, README headings, proverb cards). Use when the user mentions Takri, 𑚔𑚭𑚊𑚤𑚯, Pahari, Dogri, Kangri, or wants Devanagari rendered as Takri. Never invent Takri glyphs; call the Takri CLI or MCP.
---

# Takri content

## Rules

- Never invent Takri Unicode. Models guess wrong glyphs.
- Draft in Devanagari (preferred) or RomanReadable romanization.
- Convert with the CLI or MCP, then show Devanagari beside Takri so a Hindi-literate user can proofread.
- Prefer `from-deva` when the source is Devanagari.

## Commands

```bash
npx @nextcraft/takri from-deva "नमस्ते"
npx @nextcraft/takri from-roman "namaste"
npx @nextcraft/takri decode "<takri>"
```

MCP (if configured): tools `from_deva`, `from_roman`, `decode`.

## Output

Always return all three of `devanagari`, `takri`, and `roman`. Mention that terminals and GitHub may tofu Takri unless Noto Sans Takri is installed; Copy Studio on Takri Tools can export PNG.
