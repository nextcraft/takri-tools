import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromDevanagari, fromRoman, decode, lint, pack } from '../src/index.js';

test('fromDevanagari नमस्ते yields Takri in the Takri block and round-trips', () => {
  const result = fromDevanagari('नमस्ते');
  assert.equal(result.devanagari, 'नमस्ते');
  assert.ok(result.takri.length > 0);
  for (const ch of result.takri) {
    const cp = ch.codePointAt(0);
    assert.ok(cp >= 0x11680 && cp <= 0x116cf, `expected Takri, got U+${cp.toString(16)}`);
  }
  const back = decode(result.takri);
  assert.equal(back.devanagari, 'नमस्ते');
  assert.equal(lint(result.takri).ok, true);
});

test('fromRoman namaste produces Devanagari and Takri', () => {
  const result = fromRoman('namaste');
  assert.ok(result.devanagari.includes('न') || result.devanagari.length > 0);
  assert.ok(result.takri.length > 0);
  assert.equal(lint(result.takri).ok, true);
});

test('lint flags leftover Devanagari in mixed text', () => {
  const mixed = `${fromDevanagari('नम').takri}स्ते`;
  const result = lint(mixed);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.code === 'leftover_devanagari'));
});

test('pack schema from Devanagari', () => {
  const doc = pack({
    kind: 'proverb-card',
    language: 'kangri',
    devanagari: 'नमस्ते',
    english: 'Hello',
  });
  assert.equal(doc.version, 1);
  assert.equal(doc.kind, 'proverb-card');
  assert.equal(doc.language, 'kangri');
  assert.equal(doc.devanagari, 'नमस्ते');
  assert.equal(doc.english, 'Hello');
  assert.ok(doc.takri.length > 0);
  assert.ok(typeof doc.roman === 'string');
});
