---
name: takri-pack
description: Emits a Takri content pack JSON document for captions, proverb cards, README headings, or generic copy. Use when the user wants structured Takri output, Copy Studio ingest, or a reusable content artifact.
---

# Takri pack

## Rules

- Source text must go through `takri pack` (or MCP `pack`), never hand-written Takri.
- `kind`: `caption` | `proverb-card` | `readme-heading` | `generic`
- `language`: `dogri` | `kangri` | `pahari` | `hi` | `und`

## Command

```bash
npx @nextcraft/takri pack --kind proverb-card --lang kangri --deva "चाह राह" --english "Tea is the path"
```

Output schema:

```json
{
  "version": 1,
  "kind": "proverb-card",
  "language": "kangri",
  "devanagari": "",
  "takri": "",
  "roman": "",
  "english": ""
}
```
