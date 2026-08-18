import { motion } from 'framer-motion';
import { copyToClipboard, showToast } from '../lib/script-utils';
import './AgentsKit.css';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SNIPPETS = {
  help: 'npx @nextcraft/takri --help',
  global: 'npm i -g @nextcraft/takri',
  fromDeva: 'npx @nextcraft/takri from-deva "नमस्ते"',
  fromRoman: 'npx @nextcraft/takri from-roman "namaste"',
  init: 'npx @nextcraft/takri init',
  mcpJson: `{
  "mcpServers": {
    "takri": {
      "command": "npx",
      "args": ["-y", "@nextcraft/takri", "mcp"]
    }
  }
}`,
  claude: 'claude mcp add takri -- npx -y @nextcraft/takri mcp',
  pack: `{
  "version": 1,
  "kind": "proverb-card",
  "language": "kangri",
  "devanagari": "नमस्ते",
  "takri": "",
  "roman": "namaste",
  "english": "Hello"
}`,
};

async function copySnippet(label, text) {
  const ok = await copyToClipboard(text);
  showToast(ok ? `Copied ${label}` : 'Copy failed');
}

function Snippet({ label, text }) {
  return (
    <div className="ak-snippet">
      <div className="ak-snippet-bar">
        <span>{label}</span>
        <button type="button" onClick={() => copySnippet(label, text)}>
          Copy
        </button>
      </div>
      <pre><code>{text}</code></pre>
    </div>
  );
}

export default function AgentsKit() {
  return (
    <div className="agents-kit-page">
      <motion.div className="ak-container" initial="hidden" animate="visible" variants={fadeIn}>
        <header className="ak-header">
          <h1>Agents Kit</h1>
          <p>
            Produce real Unicode Takri from Cursor, Claude Code, Cline, OpenCode, Codex, Kilo, and
            any other agent that can run a shell. Models must not invent Takri glyphs.
          </p>
        </header>

        <section className="ak-section">
          <h2>Why this exists</h2>
          <p>
            Agents write Devanagari reasonably well. They do not reliably emit Takri (U+11680–U+116CF).
            Draft in Devanagari, convert with this kit, then proofread the Devanagari beside the Takri.
          </p>
        </section>

        <section className="ak-section">
          <h2>Install</h2>
          <Snippet label="npx" text={SNIPPETS.help} />
          <Snippet label="global install" text={SNIPPETS.global} />
          <p className="ak-note">
            Package: <a href="https://www.npmjs.com/package/@nextcraft/takri">@nextcraft/takri</a>
            {' · '}
            <a href="https://github.com/Nextcraft/takri-tools/tree/main/packages/takri">source in this repo</a>
          </p>
        </section>

        <section className="ak-section">
          <h2>CLI</h2>
          <Snippet label="from-deva" text={SNIPPETS.fromDeva} />
          <Snippet label="from-roman" text={SNIPPETS.fromRoman} />
          <Snippet label="init skills" text={SNIPPETS.init} />
          <p>
            Also: <code>decode</code>, <code>lint</code>, <code>pack</code>. JSON on stdout by default;
            add <code>--text</code> for human-readable lines.
          </p>
        </section>

        <section className="ak-section">
          <h2>MCP</h2>
          <Snippet label="Cursor / Cline / OpenCode mcp.json" text={SNIPPETS.mcpJson} />
          <Snippet label="Claude Code" text={SNIPPETS.claude} />
          <p>Tools: <code>from_deva</code>, <code>from_roman</code>, <code>decode</code>, <code>lint</code>, <code>pack</code>.</p>
        </section>

        <section className="ak-section">
          <h2>Per agent</h2>
          <ul className="ak-list">
            <li><strong>Cursor</strong> — run <code>takri init</code> (skills) and add the MCP JSON to <code>.cursor/mcp.json</code>.</li>
            <li><strong>Claude Code</strong> — <code>takri init</code> writes <code>.claude/skills</code>; add MCP with the command above.</li>
            <li><strong>Cline / OpenCode</strong> — MCP config plus paste <code>AGENTS-takri.md</code> into the project agent file.</li>
            <li><strong>Codex / Kilo</strong> — shell + <code>AGENTS.md</code> snippet from <code>takri init</code> (does not overwrite an existing <code>AGENTS.md</code>).</li>
          </ul>
        </section>

        <section className="ak-section">
          <h2>Example prompt</h2>
          <blockquote>
            Write a Kangri greeting caption. Draft Devanagari, then run
            <code> npx @nextcraft/takri from-deva </code>
            and show Devanagari, Takri, and Roman together. Do not invent Takri.
          </blockquote>
          <Snippet label="pack JSON shape" text={SNIPPETS.pack} />
        </section>

        <section className="ak-section">
          <h2>Fonts</h2>
          <p>
            Many terminals and GitHub will tofu Takri. Verify meaning via Devanagari. For design paste,
            use <a href="#/copy-studio">Copy Studio</a>.
          </p>
          <p className="ak-note">
            Roman input follows the{' '}
            <a href="https://aksharamukha.appspot.com/" target="_blank" rel="noopener noreferrer">
              Aksharamukha
            </a>{' '}
            RomanReadable convention (link only).
          </p>
        </section>
      </motion.div>
    </div>
  );
}
