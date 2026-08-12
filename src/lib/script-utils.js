/**
 * Split text into grapheme clusters using Intl.Segmenter.
 * Defaults to Takri locale for conjunct-safe character boundaries.
 */
export { COPY_STUDIO_IMPORT_KEY } from './tool-bridge';

export function graphemes(text, locale = 'und-Takr') {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(text)].map(
      (s) => s.segment
    );
  }
  return [...text];
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/**
 * Render text to a PNG data URL via canvas.
 * Returns { dataUrl, width, height }.
 */
export function renderTextToPng(text, { fontFamily, fontSize, color = '#000000' } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const dpr = 3;
  const family = fontFamily || "'Noto Sans Takri', sans-serif";
  const size = fontSize || 48;
  ctx.font = `${size * dpr}px ${family}`;
  const metrics = ctx.measureText(text);
  const width = Math.ceil(metrics.width) + 4;
  const height = Math.ceil(size * dpr * 1.5);
  canvas.width = width;
  canvas.height = height;
  ctx.font = `${size * dpr}px ${family}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, height * 0.55);
  return { dataUrl: canvas.toDataURL('image/png'), width, height };
}

export function downloadPng(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
}
