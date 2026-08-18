const TAKRI_START = 0x11680;
const TAKRI_END = 0x116cf;
const DEVA_START = 0x0900;
const DEVA_END = 0x097f;

function isAllowedPunctuation(ch) {
  return /[\s.,!?;:'"()[\]{}…।॥\-\u0964\u0965]/.test(ch);
}

export function lint(text) {
  const input = text ?? '';
  const issues = [];

  if (!input) {
    return { ok: true, issues: [] };
  }

  for (const ch of input) {
    const cp = ch.codePointAt(0);

    if (ch === '\uFFFD') {
      issues.push({ code: 'replacement_char', message: 'Replacement character U+FFFD found' });
      continue;
    }

    if (cp >= TAKRI_START && cp <= TAKRI_END) continue;
    if (isAllowedPunctuation(ch)) continue;
    if (cp < 0x80) continue;

    if (cp >= DEVA_START && cp <= DEVA_END) {
      issues.push({
        code: 'leftover_devanagari',
        message: `Devanagari code point U+${cp.toString(16).toUpperCase()} in Takri text`,
      });
      continue;
    }

    issues.push({
      code: 'non_takri',
      message: `Non-Takri code point U+${cp.toString(16).toUpperCase()}`,
    });
  }

  return { ok: issues.length === 0, issues };
}
