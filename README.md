# 𑚔𑚭𑚊𑚤𑚯 · Takri Tools

A suite of digital tools for preserving and teaching the ancient **Takri script** — built as a modern React web application, hosted on GitHub Pages.

🔗 **Live Site**: [https://Nextcraft.github.io/takri-tools/](https://Nextcraft.github.io/takri-tools/)

---

## About Takri

**Takri** (𑚔𑚭𑚊𑚤𑚯) is a historical Brahmic script used for writing Dogri, Kangri, and other Pahari languages of northern India. Encoded in the Unicode block **U+11680–U+116CF** (Unicode 6.1+), Takri is closely related to Devanagari and shares a near one-to-one character correspondence with it.

This project aims to create practical digital tools that make it easier to produce content in Takri, learn the script, and preserve this important part of cultural heritage.

---

## Tools

| Tool | Status | Description |
|------|--------|-------------|
| ⚡ **[Transliterator](#transliterator)** | ✅ Live | Type Roman text → see Devanagari & Takri side by side |
| 📝 **[Practice Sheets](#practice-sheets)** | ✅ Live | Generate printable PDF worksheets for learning Takri alphabet |
| 📖 **[Character Reference](#character-reference)** | ✅ Live | Browse the full Takri Unicode block with search and copy |
| | 🔲 Planned | More tools coming — contributions welcome! |

### Transliterator

Type in **Roman script** (Aksharamukha Readable scheme) and instantly see the output in both **Devanagari** and **Takri** scripts side by side. Verify the output via Devanagari (which you can read), then use the Takri text.

- **API Mode**: Uses the [Aksharamukha](https://aksharamukha.appspot.com/) API for highest accuracy (handles complex conjuncts)
- **Offline Mode**: Instant transliteration using a built-in engine (no internet required)
- Copy-to-clipboard support for both scripts
- Full keyboard mapping reference chart

### Practice Sheets

Generate **printable PDF worksheets** for learning to write Takri characters:

- Select which character groups to practice (vowels, consonant rows, numerals)
- Configure number of practice rows per character
- Choose display mode (Takri only, Takri + Devanagari, Takri + Devanagari + Roman)
- Live preview before downloading
- Supports A4 and Letter paper sizes

### Character Reference

Browse the **complete Takri Unicode block** (U+11680–U+116CF) in an interactive chart:

- Search by Roman transliteration, Devanagari, Takri glyph, name, or Unicode code point
- Filter by category (vowels, consonant rows, signs, numerals, and more)
- Click any character for a detail view with copy-to-clipboard for Takri, Devanagari, and Unicode
- Deep-link to any character via URL query param (e.g. `#/character-reference?char=1168A`)
- Link to the official Unicode chart PDF

---

## Tech Stack

- **React 18** — Component-based UI architecture
- **Vite 5** — Lightning-fast dev server and build
- **React Router** — Client-side routing
- **Framer Motion** — Cinematic animations and transitions
- **jsPDF** — Client-side PDF generation
- **GitHub Pages** — Zero-cost static hosting

No build servers, no databases, no backend — everything runs in the browser.

---

## Development

```bash
# Clone the repo
git clone https://github.com/Nextcraft/takri-tools.git
cd takri-tools

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## Unicode Reference

The Takri script is encoded in the Unicode block **U+11680–U+116CF**:

| Range | Contents |
|-------|----------|
| U+11680–U+11689 | Vowels (𑚀–𑚉) |
| U+1168A–U+116A9 | Consonants (𑚊–𑚩) |
| U+116AA | Letter Rra (𑚪) |
| U+116AB–U+116B5 | Signs & Vowel Signs |
| U+116B6 | Virama (𑚶) |
| U+116B7 | Nukta (𑚷) |
| U+116B8 | Archaic Kha (𑚸) |
| U+116B9 | Abbreviation Sign (𑚹) |
| U+116C0–U+116C9 | Digits (𑛀–𑛉) |

Official chart: [Unicode U+11680 PDF](https://www.unicode.org/charts/PDF/U11680.pdf)

---

## Credits

- **Transliteration mappings**: [Aksharamukha](https://github.com/virtualvinodh/aksharamukha) by Vinodh Rajan
- **Unicode data**: [Unicode Consortium](https://www.unicode.org/)
- **Takri font**: [Noto Sans Takri](https://fonts.google.com/noto/specimen/Noto+Sans+Takri) by Google

---

## License

MIT
