# Takri agent instructions

When producing Takri (𑚔𑚭𑚊𑚤𑚯) or Pahari-script content:

1. Never invent Takri code points.
2. Draft in Devanagari or RomanReadable, then run:

```bash
npx -y @nextcraft/takri from-deva "…"
npx -y @nextcraft/takri from-roman "…"
npx -y @nextcraft/takri lint <file>
npx -y @nextcraft/takri pack --kind generic --lang und --deva "…"
```

3. Always show Devanagari next to Takri for proofreading.
4. Optional MCP: `{ "command": "npx", "args": ["-y", "@nextcraft/takri", "mcp"] }`

Docs: https://Nextcraft.github.io/takri-tools/#/agents-kit
