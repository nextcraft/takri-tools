# @nextcraft/takri

CLI, MCP server, and library so coding agents can produce **Unicode Takri** from Devanagari or Roman. Humans proofread via Devanagari.

Site: [Takri Agents Kit](https://Nextcraft.github.io/takri-tools/#/agents-kit)

Roman input follows the [Aksharamukha](https://aksharamukha.appspot.com/) RomanReadable convention (by reference). This package uses the Takri Tools engine; it does not vendor Aksharamukha source.

## Install

```bash
npx @nextcraft/takri --help
npm i -g @nextcraft/takri
npm i @nextcraft/takri
```

## CLI

JSON on stdout by default; add `--text` for lines.

```bash
npx @nextcraft/takri from-deva "नमस्ते"
npx @nextcraft/takri from-roman "namaste"
npx @nextcraft/takri decode "<takri>"
npx @nextcraft/takri lint file.txt
npx @nextcraft/takri pack --kind caption --lang kangri --deva "नमस्ते" --english "Hello"
npx @nextcraft/takri init
npx @nextcraft/takri mcp
```

`takri init` copies Cursor/Claude skills into the current repo and writes `AGENTS-takri.md` (it does not overwrite `AGENTS.md`).

## MCP

```json
{
  "command": "npx",
  "args": ["-y", "@nextcraft/takri", "mcp"]
}
```

Tools: `from_deva`, `from_roman`, `decode`, `lint`, `pack`.

Claude Code:

```bash
claude mcp add takri -- npx -y @nextcraft/takri mcp
```

## Library

```js
import { fromDevanagari, fromRoman, decode, lint, pack } from '@nextcraft/takri';
```
